// RUNIQ Lark Bot
// Deploy ke Vercel: tambahkan file ini ke /api/lark-bot.js di repo ptrc-runiq
// Environment variables needed:
//   LARK_APP_ID=cli_aaec7cd20078de15
//   LARK_APP_SECRET=pDJEGUi5MTQiYDvRtx4ccZWzcyGKtHCQ
//   ANTHROPIC_API_KEY=sk-ant-...

const ISSUES = [
  { no:1, judul:"Onboarding Coach vs Athlete berbeda", status:"🔴 Belum" },
  { no:2, judul:"Pilih bahasa tidak berfungsi", status:"🔴 Belum" },
  { no:3, judul:"Nama user masih dummy", status:"🔴 Belum" },
  { no:4, judul:"Edit nama tidak tersimpan", status:"🔴 Belum" },
  { no:5, judul:"Sign up via Strava tidak mendaftarkan user", status:"🔴 Belum" },
  { no:6, judul:"Record tidak tampilkan peta dan tracking", status:"🔴 Belum" },
  { no:7, judul:"Header dan bottom bar ikut scroll", status:"🔴 Belum" },
];

// Get Lark access token
async function getLarkToken() {
  const res = await fetch("https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: process.env.LARK_APP_ID,
      app_secret: process.env.LARK_APP_SECRET,
    }),
  });
  const data = await res.json();
  return data.tenant_access_token;
}

// Send message to Lark
async function sendLarkMessage(chatId, text, token) {
  await fetch("https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=chat_id", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      receive_id: chatId,
      msg_type: "text",
      content: JSON.stringify({ text }),
    }),
  });
}

// Ask Claude
async function askClaude(userMessage, context) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `Kamu adalah asisten AI untuk RUNIQ — app lari Indonesia buatan PTRC. 
Kamu membantu founder (Galih) dengan development, issue tracking, dan pertanyaan teknis.
Context issue tracker saat ini:\n${context}
Jawab singkat dan langsung. Bahasa Indonesia kecuali diminta English.
Jika ada perintah update issue (contoh: "update no 3 jadi selesai"), ekstrak nomor dan status baru.`,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? "Maaf, tidak bisa memproses sekarang.";
}

// Parse issue update command
function parseIssueUpdate(text) {
  // Matches: "update no 3 selesai" / "issue 5 in progress" / "no 2 done"
  const match = text.match(/(?:update|issue|no\.?)\s*(\d+)\s+(?:jadi\s+)?(.+)/i);
  if (!match) return null;
  const no = parseInt(match[1]);
  const rawStatus = match[2].toLowerCase().trim();
  let status = "🔴 Belum";
  if (rawStatus.includes("selesai") || rawStatus.includes("done") || rawStatus.includes("fixed")) status = "🟢 Selesai";
  else if (rawStatus.includes("progress") || rawStatus.includes("proses") || rawStatus.includes("working")) status = "🟡 In Progress";
  else if (rawStatus.includes("belum") || rawStatus.includes("open")) status = "🔴 Belum";
  return { no, status };
}

// Format issue list
function formatIssues(issues) {
  return "📋 *RUNIQ Issue Tracker*\n\n" +
    issues.map(i => `${i.status} *No.${i.no}* — ${i.judul}`).join("\n");
}

export default async function handler(req, res) {
  // Lark verification challenge
  if (req.body?.challenge) {
    return res.json({ challenge: req.body.challenge });
  }

  const event = req.body?.event;
  if (!event || event.message?.message_type !== "text") {
    return res.json({ code: 0 });
  }

  // Ignore bot's own messages
  if (event.sender?.sender_type === "app") return res.json({ code: 0 });

  const chatId = event.message.chat_id;
  const rawText = JSON.parse(event.message.content).text || "";
  const text = rawText.replace(/@\w+/g, "").trim();

  const token = await getLarkToken();

  // Command: list issues
  if (/^(list|issues|tracker|daftar)/i.test(text)) {
    await sendLarkMessage(chatId, formatIssues(ISSUES), token);
    return res.json({ code: 0 });
  }

  // Command: update issue status
  const update = parseIssueUpdate(text);
  if (update) {
    const issue = ISSUES.find(i => i.no === update.no);
    if (issue) {
      issue.status = update.status;
      await sendLarkMessage(chatId, `✅ Issue #${update.no} diupdate ke ${update.status}\n\n${formatIssues(ISSUES)}`, token);
    } else {
      await sendLarkMessage(chatId, `❌ Issue #${update.no} tidak ditemukan.`, token);
    }
    return res.json({ code: 0 });
  }

  // Default: ask Claude
  const context = ISSUES.map(i => `No.${i.no}: ${i.judul} — ${i.status}`).join("\n");
  const reply = await askClaude(text, context);
  await sendLarkMessage(chatId, reply, token);

  return res.json({ code: 0 });
}
