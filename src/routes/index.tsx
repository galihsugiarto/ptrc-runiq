import { useState, useRef, useEffect } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');`;

// ── DESIGN TOKENS (matching Figma v1 + upgraded) ─────────────────
const T = {
  bg:        "#0d0e14",
  surface:   "#13151f",
  card:      "#181b27",
  cardHover: "#1e2133",
  border:    "#252838",
  borderSoft:"#1e2133",
  // gradients
  grad:      "linear-gradient(135deg, #6c47ff, #a855f7, #ec4899)",
  gradBlue:  "linear-gradient(135deg, #3b5bdb, #7c3aed)",
  gradGreen: "linear-gradient(135deg, #10b981, #059669)",
  // accents
  purple:    "#7c3aed",
  purpleLight:"#a855f7",
  blue:      "#3b82f6",
  green:     "#10b981",
  orange:    "#f97316",
  red:       "#ef4444",
  yellow:    "#eab308",
  cyan:      "#06b6d4",
  // text
  ink:       "#f0f0f8",
  muted:     "#6b7099",
  dim:       "#3d4060",
};

// ── MOCK DATA ─────────────────────────────────────────────────────
const COACHES = [
  { id:1, init:"SM", name:"Sarah Mitchell", title:"Marathon Specialist", cert:"USATF L2", rating:4.9, reviews:127, runners:42, price:149, response:"< 1 hour", color:"#7c3aed", available:true, tags:["Sub-3hr","VO2max","Injury Prevention"], bio:"Former Boston qualifier (2:58) with 10+ years coaching. Specialising in sub-3hr marathon training through biomechanics analysis.", highlights:["Boston Marathon qualifier 2:58","200+ athletes PR'd","USATF certified coach"] },
  { id:2, init:"MC", name:"Marcus Chen", title:"Speed & Track", cert:"USATF L3", rating:4.8, reviews:89, runners:31, price:199, response:"< 3 hours", color:"#f97316", available:false, tags:["Intervals","5K–10K","Track"], bio:"National 800m champion. Builds speed foundation for distance runners using periodized interval training.", highlights:["National 800m champion","Track & field specialist","Evidence-based programming"] },
  { id:3, init:"JL", name:"Jamie Lee", title:"Beginner & HM Specialist", cert:"RRCA", rating:4.7, reviews:203, runners:58, price:99, response:"< 2 hours", color:"#10b981", available:true, tags:["First marathon","Run-walk","Injury prevention"], bio:"Helped 500+ runners cross their first finish line. Patient, encouraging, science-backed approach.", highlights:["500+ first-time finishers","Run-walk method expert","Injury-free approach"] },
];

const WEEK_PLAN = [
  { day:"Mon", date:"May 5",  type:"Easy Run",   km:8,  zone:"Z2",   detail:"Conversational pace · HR < 140bpm", done:true,  color:T.blue },
  { day:"Tue", date:"May 6",  type:"Intervals",  km:10, zone:"Z4",   detail:"6×800m @ 6:45/km · 90s rest", done:true,  color:T.purple },
  { day:"Wed", date:"May 7",  type:"Recovery",   km:6,  zone:"Z1",   detail:"Very easy · Focus on form", done:true,  color:T.green },
  { day:"Thu", date:"May 8",  type:"Tempo",      km:12, zone:"Z3–4", detail:"2km WU · 8km threshold · 2km CD", done:false, color:T.orange },
  { day:"Fri", date:"May 9",  type:"Rest",       km:null,zone:null,  detail:"Full recovery · Stretch & mobility", done:false, color:T.muted },
  { day:"Sat", date:"May 10", type:"Long Run",   km:22, zone:"Z2",   detail:"Easy aerobic · Fuel every 45min", done:false, color:T.red },
  { day:"Sun", date:"May 11", type:"Easy Run",   km:8,  zone:"Z2",   detail:"Recovery jog · Keep it easy", done:false, color:T.blue },
];

const ACTIVITIES = [
  { id:1, name:"Morning Easy Run",  date:"Mon, May 5",  source:"Strava", feel:"Great",  feelColor:T.green,  km:6.8,  dur:"37:42", pace:"5:33", hr:142 },
  { id:2, name:"Interval Workout",  date:"Tue, May 6",  source:"Garmin", feel:"Hard",   feelColor:T.orange, km:9.8,  dur:"45:18", pace:"4:37", hr:168 },
  { id:3, name:"Recovery Run",      date:"Wed, May 7",  source:"Strava", feel:"Great",  feelColor:T.green,  km:6.4,  dur:"41:05", pace:"6:24", hr:128 },
];

const MESSAGES = [
  { id:1, from:"coach", text:"Great job on today's tempo run! Your HR stayed controlled through the threshold segment — exactly what we need at this stage of base building.", time:"9:14 AM" },
  { id:2, from:"runner", text:"Thanks Sarah! I noticed my HRV has been a bit low this week. Should I modify Thursday's session?", time:"10:02 AM" },
  { id:3, from:"coach", text:"Good instinct checking in. Your HRV dipped 8% below baseline — I've updated Thursday's tempo. Reduce the threshold to 6km instead of 8km. Your body is telling us something, let's listen.", time:"10:31 AM" },
  { id:4, from:"runner", text:"Got it! Really appreciate how you combine the data with real coaching judgment.", time:"10:45 AM" },
];

const COACH_RUNNERS = [
  { id:1, init:"AT", name:"Alex Thompson", goal:"Sub-4hr Marathon", readiness:72, hrv:58, load:6.4, status:"needs_review", color:T.blue,   lastActive:"2h ago" },
  { id:2, init:"JC", name:"Jamie Chen",    goal:"First Half Marathon", readiness:88, hrv:67, load:4.1, status:"approved",     color:T.green,  lastActive:"1d ago" },
  { id:3, init:"ML", name:"Marcus Lee",    goal:"5K PR < 22min",   readiness:61, hrv:49, load:8.3, status:"needs_review", color:T.orange, lastActive:"3h ago" },
  { id:4, init:"PR", name:"Priya Rajan",   goal:"Sub-3:30 Marathon",readiness:94, hrv:71, load:5.8, status:"approved",     color:T.purple, lastActive:"5h ago" },
];

// ── COMPONENTS ────────────────────────────────────────────────────
function Grad({ children, style }) {
  return <span style={{ background: T.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", ...style }}>{children}</span>;
}

function Av({ init, color, size=36 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg, ${color}40, ${color}20)`, border:`1.5px solid ${color}60`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter'", fontWeight:700, fontSize:size*0.33, color, flexShrink:0 }}>{init}</div>;
}

function Chip({ label, color }) {
  return <span style={{ fontFamily:"'Inter'", fontSize:10, fontWeight:600, color, background:color+"22", border:`1px solid ${color}40`, padding:"2px 8px", borderRadius:999 }}>{label}</span>;
}

function Ring({ value, size=72 }) {
  const col = value>=80 ? T.green : value>=60 ? T.yellow : T.red;
  const r=(size-8)/2, circ=2*Math.PI*r;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)", position:"absolute" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={`${circ*value/100} ${circ}`} style={{ transition:"stroke-dasharray 1s ease" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontFamily:"'DM Mono'", fontSize:size*0.25, color:col, fontWeight:500, lineHeight:1 }}>{value}</div>
        <div style={{ fontFamily:"'Inter'", fontSize:8, color:T.muted, letterSpacing:0.5, marginTop:1 }}>READY</div>
      </div>
    </div>
  );
}

function Bar({ pct, gradient=T.grad, height=5 }) {
  return <div style={{ background:T.border, borderRadius:999, height }}>
    <div style={{ background:gradient, height:"100%", borderRadius:999, width:`${Math.min(pct,100)}%`, transition:"width 1s ease" }}/>
  </div>;
}

function MiniMetric({ label, value, unit, color, barPct }) {
  return (
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px 14px" }}>
      <div style={{ fontSize:10, color:T.muted, marginBottom:6, fontWeight:500 }}>{label}</div>
      <div style={{ fontFamily:"'DM Mono'", fontSize:22, color, fontWeight:500, lineHeight:1, marginBottom:8 }}>{value}<span style={{ fontSize:10, color:T.muted, marginLeft:2 }}>{unit}</span></div>
      <div style={{ background:T.border, borderRadius:999, height:3 }}>
        <div style={{ background:color, height:"100%", borderRadius:999, width:`${barPct}%` }}/>
      </div>
    </div>
  );
}

// ── RUNNER APP ────────────────────────────────────────────────────
function RunnerApp({ coach, setCoach, planApproved, setPlanApproved }) {
  const [tab, setTab] = useState("home");
  const [plan, setPlan] = useState(WEEK_PLAN);
  const [msgs, setMsgs] = useState(MESSAGES);
  const [draft, setDraft] = useState("");
  const [aiNote, setAiNote] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [bookingCoach, setBookingCoach] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const getAI = async () => {
    setAiLoading(true); setAiNote(""); setStreaming(true);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{ role:"user", content:`You are RUNIQ, an expert AI running coach. Write a warm personal coaching note (2 short paragraphs, max 100 words) for runner Alex Thompson. Goal: Sub-4hr Marathon, October 2026. HRV: 58ms (baseline 62, slightly low). Sleep: 7.2hrs, 78% quality. Load: 6.4/10. Week 8 of 24, base building phase. This week: Easy 8km, Intervals 10km, Recovery 6km done. Still ahead: Tempo 12km Thu, Rest Fri, Long 22km Sat, Easy 8km Sun. Coach Sarah has approved this plan. Be specific, warm, mention HRV. Sound like a real coach not a robot.` }] }) });
      const d = await r.json(); const text = d.content?.[0]?.text || "Training note unavailable.";
      let i=0; const iv = setInterval(() => { i+=4; setAiNote(text.slice(0,i)); if(i>=text.length){clearInterval(iv);setStreaming(false);} }, 14);
    } catch { setAiNote("⚠️ Connect to Claude API to see live coaching notes."); setStreaming(false); }
    setAiLoading(false);
  };

  const sendMsg = () => { if(!draft.trim()) return; setMsgs(m=>[...m,{id:Date.now(),from:"runner",text:draft,time:"Now"}]); setDraft(""); };

  const navItems = [
    {id:"home",   icon:"⊞", label:"Home"},
    {id:"plan",   icon:"◷", label:"Plan"},
    {id:"record", icon:"◎", label:"Record"},
    {id:"chat",   icon:"✉", label:"Chat"},
    {id:"profile",icon:"◉", label:"Profile"},
  ];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:T.bg, fontFamily:"'Inter',sans-serif", color:T.ink, overflow:"hidden" }}>

      {/* Header */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"12px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:T.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>〜</div>
          <span style={{ fontWeight:800, fontSize:15, letterSpacing:-0.3 }}>RUNIQ</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {coach && <Chip label={`Coach: ${coach.name.split(" ")[0]}`} color={T.purple}/>}
          <div style={{ width:8, height:8, borderRadius:"50%", background:T.green }}/>
          <Av init="AT" color={T.blue} size={28}/>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>

        {/* HOME */}
        {tab==="home" && (
          <div style={{ padding:18, animation:"su .3s ease" }}>
            {/* Readiness */}
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:22, fontWeight:800, lineHeight:1.1 }}>Your Readiness</div>
                  <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>Ready to train</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'DM Mono'", fontSize:42, fontWeight:500, color:T.cyan, lineHeight:1 }}>72</div>
                  <div style={{ fontSize:10, color:T.muted }}>/ 100</div>
                </div>
              </div>
            </div>

            {/* Metric cards */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
              <MiniMetric label="❤ HRV" value="68" unit="ms" color={T.red} barPct={68}/>
              <MiniMetric label="🌙 Sleep" value="7.2" unit="hrs" color={T.purple} barPct={72}/>
              <MiniMetric label="⚡ Load" value="45" unit="" color={T.yellow} barPct={45}/>
            </div>

            {/* 7-Day trend placeholder */}
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:16, marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontWeight:700, fontSize:13 }}>7-Day Trend</div>
                <div style={{ fontSize:11, color:T.green }}>↗ Improving</div>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:52 }}>
                {[40,55,48,62,58,70,65].map((h,i) => (
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <div style={{ width:"100%", borderRadius:4, background:i===6?T.cyan:T.purple+"60", height:`${h}%`, minHeight:4, transition:"height .5s" }}/>
                    <div style={{ fontSize:8, color:T.muted }}>{"MTWTFSS"[i]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goal card */}
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:16, marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{ fontWeight:700, fontSize:13 }}>Marathon Goal</div>
                <div style={{ fontFamily:"'DM Mono'", fontSize:13, color:T.cyan }}>65%</div>
              </div>
              <div style={{ fontSize:11, color:T.muted, marginBottom:10 }}>Sub 3:30 · October 2026</div>
              <Bar pct={65}/>
              <div style={{ display:"flex", justifyContent:"space-around", marginTop:14 }}>
                {[["142","Total KM"],["12","Long Runs"],["7:45","Avg Pace"]].map(([v,l])=>(
                  <div key={l} style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'DM Mono'", fontSize:18, fontWeight:500 }}>{v}</div>
                    <div style={{ fontSize:9, color:T.muted, marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Friends activity */}
            <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>Friends Activity</div>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:14 }}>
              <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
                <Av init="ML" color={T.orange} size={36}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>Marcus Lee <span style={{ fontFamily:"'DM Mono'", fontSize:10, color:T.muted }}>Today 6:14 AM</span></div>
                </div>
                <Chip label="Strong" color={T.purple}/>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ width:24, height:24, borderRadius:6, background:T.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>〜</div>
                <div style={{ fontWeight:600, fontSize:13 }}>Trail Morning Run</div>
              </div>
              <div style={{ display:"flex", gap:16 }}>
                {[["8.3 km","Distance"],["1:04:20","Duration"],["7:45/km","Pace"],["158","Avg HR"]].map(([v,l])=>(
                  <div key={l}>
                    <div style={{ fontFamily:"'DM Mono'", fontSize:13, fontWeight:500 }}>{v}</div>
                    <div style={{ fontSize:9, color:T.muted }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PLAN */}
        {tab==="plan" && (
          <div style={{ padding:18, animation:"su .3s ease" }}>
            {/* Toggle */}
            <div style={{ display:"flex", background:T.card, borderRadius:12, padding:4, marginBottom:18 }}>
              {["My Plan","Find Coach"].map((l,i)=>(
                <button key={l} onClick={()=>{ if(i===1) setTab("coach"); }} style={{ flex:1, background:i===0?T.grad:"none", border:"none", borderRadius:10, padding:"9px", fontFamily:"'Inter'", fontSize:13, fontWeight:700, color:i===0?"#fff":T.muted, cursor:"pointer" }}>{l}</button>
              ))}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:20, lineHeight:1.2 }}>This Week's<br/>Plan</div>
                <div style={{ fontSize:11, color:T.muted, marginTop:4 }}>Week 8 of 16 · Base Building Phase</div>
              </div>
              <button onClick={getAI} disabled={aiLoading} style={{ background:aiLoading?T.card:T.grad, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 14px", fontFamily:"'Inter'", fontSize:11, fontWeight:700, color:"#fff", cursor:aiLoading?"wait":"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, minWidth:80 }}>
                <span style={{ fontSize:14 }}>✦</span>
                <span>AI Coach<br/>Notes</span>
              </button>
            </div>

            {aiNote && (
              <div style={{ background:`${T.purple}15`, border:`1px solid ${T.purple}40`, borderRadius:12, padding:14, marginBottom:14, animation:"su .3s ease" }}>
                <div style={{ fontSize:9, fontWeight:700, color:T.purple, letterSpacing:1.5, marginBottom:6 }}>✦ AI COACH · RUNIQ</div>
                <div style={{ fontSize:12, lineHeight:1.7, color:T.ink }}>{aiNote}{streaming&&<span style={{ opacity:.4 }}>▋</span>}</div>
              </div>
            )}

            {/* Coach approval banner */}
            {coach && (
              <div style={{ background:T.card, border:`1px solid ${planApproved?T.green+"50":T.yellow+"50"}`, borderRadius:12, padding:"10px 14px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Av init={coach.init} color={coach.color} size={28}/>
                  <div style={{ fontSize:11, color:T.muted }}>Coach {coach.name.split(" ")[0]}</div>
                </div>
                <Chip label={planApproved?"✓ Approved":"⏳ Awaiting Review"} color={planApproved?T.green:T.yellow}/>
              </div>
            )}

            {/* Progress */}
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{ fontSize:11, color:T.muted }}>Weekly Progress</div>
                <div style={{ fontFamily:"'DM Mono'", fontSize:11, color:T.ink }}>3/7 sessions</div>
              </div>
              <Bar pct={43} gradient={T.gradGreen}/>
            </div>

            {/* Sessions */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {plan.map((s,i)=>(
                <div key={i} onClick={()=>setPlan(p=>p.map((x,j)=>j===i?{...x,done:!x.done}:x))}
                  style={{ background:s.done?`${s.color}12`:T.card, border:`1px solid ${s.done?s.color+"40":T.border}`, borderRadius:12, padding:"13px 14px", display:"flex", gap:12, alignItems:"center", cursor:"pointer", transition:"all .2s" }}>
                  <div style={{ textAlign:"center", minWidth:32 }}>
                    <div style={{ fontFamily:"'DM Mono'", fontSize:9, color:T.muted }}>{s.day}</div>
                    <div style={{ fontFamily:"'DM Mono'", fontSize:8, color:T.dim }}>{s.date.split(" ")[1]}</div>
                  </div>
                  <div style={{ width:3, height:36, borderRadius:2, background:s.color, flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:3 }}>
                      <span style={{ fontWeight:600, fontSize:13, color:s.done?T.muted:T.ink, textDecoration:s.done?"line-through":"none" }}>{s.type}</span>
                      {s.zone && <Chip label={s.zone} color={s.color}/>}
                    </div>
                    <div style={{ fontSize:10, color:T.muted }}>{s.detail}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    {s.km && <div style={{ fontFamily:"'DM Mono'", fontSize:15, color:s.color, fontWeight:500 }}>{s.km}<span style={{ fontSize:9, color:T.muted }}>km</span></div>}
                    <div style={{ fontSize:15, color:s.done?T.green:T.dim, marginTop:2 }}>{s.done?"✓":"○"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FIND COACH */}
        {tab==="coach" && (
          <div style={{ padding:18, animation:"su .3s ease" }}>
            <div style={{ display:"flex", background:T.card, borderRadius:12, padding:4, marginBottom:18 }}>
              {["My Plan","Find Coach"].map((l,i)=>(
                <button key={l} onClick={()=>{ if(i===0) setTab("plan"); }} style={{ flex:1, background:i===1?T.grad:"none", border:"none", borderRadius:10, padding:"9px", fontFamily:"'Inter'", fontSize:13, fontWeight:700, color:i===1?"#fff":T.muted, cursor:"pointer" }}>{l}</button>
              ))}
            </div>

            <div style={{ fontWeight:800, fontSize:20, marginBottom:4 }}>Find Your Coach</div>
            <div style={{ fontSize:12, color:T.muted, marginBottom:16 }}>Expert guidance for your running goals</div>

            {/* Search */}
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 14px", display:"flex", gap:8, alignItems:"center", marginBottom:14 }}>
              <span style={{ fontSize:14, opacity:.4 }}>🔍</span>
              <span style={{ fontSize:12, color:T.dim }}>Search coaches...</span>
            </div>

            {/* Filter chips */}
            <div style={{ display:"flex", gap:8, marginBottom:16, overflowX:"auto" }}>
              {["All","Marathon","Speed","Beginner","Ultra"].map((f,i)=>(
                <button key={f} style={{ background:i===0?T.grad:T.card, border:`1px solid ${i===0?"transparent":T.border}`, borderRadius:999, padding:"6px 14px", fontFamily:"'Inter'", fontSize:11, fontWeight:600, color:i===0?"#fff":T.muted, cursor:"pointer", whiteSpace:"nowrap" }}>{f}</button>
              ))}
            </div>

            <div style={{ fontSize:11, color:T.muted, marginBottom:12 }}>4 coaches found</div>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {COACHES.map(c=>(
                <div key={c.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:16 }}>
                  <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:10 }}>
                    <Av init={c.init} color={c.color} size={48}/>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <div style={{ fontWeight:700, fontSize:15 }}>{c.name}</div>
                        <div style={{ fontFamily:"'DM Mono'", fontSize:15, fontWeight:500 }}>${c.price}<span style={{ fontSize:9, color:T.muted }}>/mo</span></div>
                      </div>
                      <div style={{ fontSize:11, color:T.muted, marginBottom:6 }}>{c.title}</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        <Chip label={c.cert} color={c.color}/>
                        {c.available ? <Chip label="Available" color={T.green}/> : <Chip label="Waitlist" color={T.orange}/>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:12, fontSize:11, color:T.muted, marginBottom:10 }}>
                    <span>⭐ {c.rating} ({c.reviews})</span>
                    <span>· {c.runners} runners</span>
                    <span>· ⚡ {c.response}</span>
                  </div>
                  <div style={{ fontSize:11, color:T.muted, lineHeight:1.6, marginBottom:10 }}>{c.bio}</div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
                    {c.tags.map(t=><Chip key={t} label={t} color={T.dim}/>)}
                  </div>
                  <button onClick={()=>{ if(c.available){setBookingCoach(c);setShowBooking(true);} }}
                    style={{ width:"100%", background:c.available?T.grad:T.card, border:`1px solid ${c.available?"transparent":T.border}`, borderRadius:10, padding:"11px", fontFamily:"'Inter'", fontSize:13, fontWeight:700, color:c.available?"#fff":T.muted, cursor:c.available?"pointer":"not-allowed" }}>
                    {c.available?`Book ${c.name.split(" ")[0]}`:"Join Waitlist"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECORD */}
        {tab==="record" && (
          <div style={{ padding:18, animation:"su .3s ease" }}>
            <div style={{ display:"flex", background:T.card, borderRadius:12, padding:4, marginBottom:24 }}>
              {["This Week","Record"].map((l,i)=>(
                <button key={l} style={{ flex:1, background:i===1?T.grad:"none", border:"none", borderRadius:10, padding:"9px", fontFamily:"'Inter'", fontSize:13, fontWeight:700, color:i===1?"#fff":T.muted, cursor:"pointer" }}>{l}</button>
              ))}
            </div>

            {/* Timer */}
            <div style={{ textAlign:"center", padding:"40px 0 32px" }}>
              <div style={{ fontSize:9, color:T.muted, letterSpacing:1.5, marginBottom:8 }}>DURATION</div>
              <div style={{ fontFamily:"'DM Mono'", fontSize:64, color:T.green, fontWeight:500, lineHeight:1 }}>00:00</div>
            </div>

            {/* Stats row */}
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:16, marginBottom:24, display:"flex", justifyContent:"space-around" }}>
              {[["0.00","KM"],["--:--","PACE /KM"],["--","BPM"]].map(([v,l])=>(
                <div key={l} style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"'DM Mono'", fontSize:20, fontWeight:500 }}>{v}</div>
                  <div style={{ fontSize:9, color:T.muted, marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* GPS status */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
              <Chip label="⬛ GPS locked" color={T.green}/>
            </div>

            {/* Play button */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
              <button style={{ width:72, height:72, borderRadius:"50%", background:T.gradGreen, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, boxShadow:`0 0 30px ${T.green}40` }}>▶</button>
            </div>

            {/* Manual input */}
            <button style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"13px", fontFamily:"'Inter'", fontSize:13, fontWeight:600, color:T.muted, cursor:"pointer" }}>✏ Manual Input</button>

            {/* Recent activities */}
            <div style={{ fontWeight:700, fontSize:13, margin:"20px 0 10px" }}>Recent Activities</div>
            {ACTIVITIES.map(a=>(
              <div key={a.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:14, marginBottom:10 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:T.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>〜</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{a.name}</div>
                    <div style={{ fontSize:10, color:T.muted }}>{a.date} · via {a.source}</div>
                  </div>
                  <Chip label={a.feel} color={a.feelColor}/>
                </div>
                <div style={{ display:"flex", gap:14 }}>
                  {[[a.km+"km","Dist"],[a.dur,"Time"],[a.pace+"/km","Pace"],[a.hr+"bpm","HR"]].map(([v,l])=>(
                    <div key={l}>
                      <div style={{ fontFamily:"'DM Mono'", fontSize:13, fontWeight:500 }}>{v}</div>
                      <div style={{ fontSize:9, color:T.muted }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CHAT */}
        {tab==="chat" && (
          <div style={{ padding:18, animation:"su .3s ease", height:"calc(100% - 80px)", display:"flex", flexDirection:"column" }}>
            {/* Search */}
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 14px", display:"flex", gap:8, alignItems:"center", marginBottom:16 }}>
              <span style={{ fontSize:14, opacity:.4 }}>🔍</span>
              <span style={{ fontSize:12, color:T.dim }}>Search messages...</span>
            </div>

            {coach ? (
              <>
                {/* Active coach chat */}
                <div style={{ background:`${T.purple}15`, border:`1px solid ${T.purple}30`, borderRadius:12, padding:"10px 14px", marginBottom:14, display:"flex", gap:10, alignItems:"center" }}>
                  <Av init={coach.init} color={coach.color} size={32}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{coach.name}</div>
                    <div style={{ fontSize:10, color:T.muted }}>{coach.title} · Your Coach</div>
                  </div>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:T.green }}/>
                </div>
                <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
                  {msgs.map(m=>(
                    <div key={m.id} style={{ display:"flex", flexDirection:m.from==="runner"?"row-reverse":"row", gap:8, alignItems:"flex-end" }}>
                      {m.from==="coach" && <Av init={coach.init} color={coach.color} size={26}/>}
                      <div style={{ maxWidth:"78%", background:m.from==="runner"?T.grad:T.card, border:m.from==="runner"?"none":`1px solid ${T.border}`, borderRadius:m.from==="runner"?"14px 14px 4px 14px":"14px 14px 14px 4px", padding:"10px 13px" }}>
                        <div style={{ fontSize:12, lineHeight:1.6 }}>{m.text}</div>
                        <div style={{ fontSize:9, opacity:.4, marginTop:3, textAlign:m.from==="runner"?"right":"left" }}>{m.time}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={endRef}/>
                </div>
                <div style={{ display:"flex", gap:8, background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:8, flexShrink:0 }}>
                  <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Message your coach..." style={{ flex:1, background:"none", border:"none", outline:"none", fontFamily:"'Inter'", fontSize:12, color:T.ink, padding:"4px 6px" }}/>
                  <button onClick={sendMsg} style={{ background:T.grad, color:"#fff", border:"none", borderRadius:8, padding:"7px 12px", fontFamily:"'Inter'", fontSize:12, fontWeight:700, cursor:"pointer" }}>Send</button>
                </div>
              </>
            ) : (
              <>
                {/* Message threads */}
                {[
                  {init:"SM",name:"Sarah Mitchell",preview:"Great job on today's tempo run! Keep the effor...",time:"2m",badge:2,color:"#7c3aed",online:true},
                  {init:"AT",name:"Alex Thompson",preview:"Thanks for the plan adjustments, feeling much bett...",time:"1h",badge:0,color:T.orange,online:false},
                  {init:"JC",name:"Jamie Chen",preview:"Readiness score looking good this week!",time:"3h",badge:1,color:T.green,online:true},
                  {init:"🏃",name:"Morning Runners Club",preview:"Ryan: See you all at 6am Saturday!",time:"Yesterday",badge:5,color:T.purple,online:false,group:true},
                  {init:"ML",name:"Marcus Lee",preview:"That trail route you shared looks epic",time:"Yesterday",badge:0,color:T.yellow,online:false},
                ].map((c,i)=>(
                  <div key={i} onClick={()=>{ if(i===0) { setCoach(COACHES[0]); } }} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${T.border}`, cursor:"pointer" }}>
                    <div style={{ position:"relative" }}>
                      <Av init={c.init} color={c.color} size={44}/>
                      {c.online && <div style={{ position:"absolute", bottom:1, right:1, width:10, height:10, borderRadius:"50%", background:T.green, border:`2px solid ${T.bg}` }}/>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>{c.name}</div>
                      <div style={{ fontSize:11, color:T.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.preview}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:10, color:c.badge?T.blue:T.muted, marginBottom:4 }}>{c.time}</div>
                      {c.badge>0 && <div style={{ width:18, height:18, borderRadius:"50%", background:T.blue, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, marginLeft:"auto" }}>{c.badge}</div>}
                    </div>
                  </div>
                ))}
                <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:8 }}>
                  {[{icon:"👥",title:"Find a Friend",sub:"Connect with other runners"},{icon:"🏃",title:"Find a Community",sub:"Join running groups near you"}].map(c=>(
                    <div key={c.title} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px 14px", display:"flex", gap:12, alignItems:"center", cursor:"pointer" }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:T.purple+"20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{c.icon}</div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>{c.title}</div>
                        <div style={{ fontSize:11, color:T.muted }}>{c.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* PROFILE */}
        {tab==="profile" && (
          <div style={{ padding:18, animation:"su .3s ease" }}>
            {/* Header card */}
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:20, marginBottom:16, textAlign:"center" }}>
              <div style={{ position:"relative", display:"inline-block", marginBottom:12 }}>
                <div style={{ width:72, height:72, borderRadius:"50%", background:T.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>🏃</div>
                <div style={{ position:"absolute", bottom:0, right:0, width:22, height:22, borderRadius:"50%", background:T.purple, border:`2px solid ${T.bg}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>✏</div>
              </div>
              <div style={{ fontWeight:800, fontSize:18 }}>Alex Thompson</div>
              <div style={{ fontSize:11, color:T.muted, marginBottom:14 }}>Marathon Runner · Sub-4hr Goal</div>
              <div style={{ display:"flex", justifyContent:"space-around" }}>
                {[["247","Total KM"],["42","Runs"],["8","Weeks"]].map(([v,l])=>(
                  <div key={l} style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'DM Mono'", fontSize:22, fontWeight:500 }}>{v}</div>
                    <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coach section */}
            {coach && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>My Coach</div>
                <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:14, display:"flex", gap:12, alignItems:"center" }}>
                  <Av init={coach.init} color={coach.color} size={44}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{coach.name}</div>
                    <div style={{ fontSize:11, color:T.muted }}>{coach.title}</div>
                  </div>
                  <button onClick={()=>setTab("chat")} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:"7px 12px", fontFamily:"'Inter'", fontSize:11, fontWeight:600, color:T.ink, cursor:"pointer" }}>💬 Message</button>
                </div>
              </div>
            )}

            {/* Goal */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>Current Goal</div>
              <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ fontWeight:700 }}>Sub-4hr Marathon</div>
                  <div style={{ fontFamily:"'DM Mono'", fontSize:13, color:T.cyan }}>34%</div>
                </div>
                <div style={{ fontSize:11, color:T.muted, marginBottom:10 }}>Target: October 15, 2026</div>
                <Bar pct={34}/>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:10, color:T.muted }}>
                  <span>Week 8 of 24</span><span>34% complete</span>
                </div>
              </div>
            </div>

            {/* Account */}
            <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>Account</div>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
              {[
                {icon:"👤",label:"Edit Profile",sub:"Name, bio, personal info"},
                {icon:"🔔",label:"Notifications",sub:"Alerts & reminders"},
                {icon:"💳",label:"Subscription",sub:"Free plan · Upgrade to Pro"},
                {icon:"🔒",label:"Privacy",sub:"Data & visibility settings"},
                {icon:"❓",label:"Help & Support",sub:"FAQ, contact, feedback"},
              ].map((r,i)=>(
                <div key={r.label} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderBottom:i<4?`1px solid ${T.border}`:"none", cursor:"pointer" }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:T.surface, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{r.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:500, fontSize:13 }}>{r.label}</div>
                    <div style={{ fontSize:10, color:T.muted }}>{r.sub}</div>
                  </div>
                  <span style={{ color:T.dim, fontSize:14 }}>›</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ background:T.surface, borderTop:`1px solid ${T.border}`, display:"flex", padding:"8px 0 4px", flexShrink:0 }}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"4px 0" }}>
            <span style={{ fontSize:16, opacity:tab===n.id?1:.25 }}>{n.icon}</span>
            <span style={{ fontFamily:"'Inter'", fontSize:8, color:tab===n.id?T.purpleLight:T.muted, fontWeight:tab===n.id?700:400, letterSpacing:.3 }}>{n.label}</span>
            {tab===n.id && <div style={{ width:4, height:4, borderRadius:"50%", background:T.purpleLight, marginTop:1 }}/>}
          </button>
        ))}
      </div>

      {/* Booking sheet */}
      {showBooking && bookingCoach && (
        <div style={{ position:"absolute", inset:0, background:"#00000080", display:"flex", alignItems:"flex-end", zIndex:100 }} onClick={()=>setShowBooking(false)}>
          <div style={{ background:T.surface, borderRadius:"20px 20px 0 0", padding:24, width:"100%", animation:"slideSheet .3s ease" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ fontWeight:800, fontSize:18 }}>Book {bookingCoach.name.split(" ")[0]}</div>
              <button onClick={()=>setShowBooking(false)} style={{ background:"none", border:"none", color:T.muted, fontSize:20, cursor:"pointer" }}>✕</button>
            </div>
            <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:20 }}>
              <Av init={bookingCoach.init} color={bookingCoach.color} size={48}/>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{bookingCoach.name}</div>
                <div style={{ fontSize:12, color:T.muted }}>{bookingCoach.title}</div>
              </div>
            </div>
            <div style={{ fontSize:10, color:T.muted, letterSpacing:1.5, marginBottom:12 }}>WHAT'S INCLUDED</div>
            {["Personalized 7-day training plan","Weekly 1:1 video check-in","Real-time messaging support","RUNIQ AI + coach hybrid insights","Plan adjustments based on HRV & readiness"].map(i=>(
              <div key={i} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
                <span style={{ color:T.green, fontSize:14 }}>✓</span>
                <span style={{ fontSize:13 }}>{i}</span>
              </div>
            ))}
            <div style={{ fontSize:10, color:T.muted, letterSpacing:1.5, margin:"16px 0 10px" }}>COACH HIGHLIGHTS</div>
            {bookingCoach.highlights.map(h=>(
              <div key={h} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
                <div style={{ width:4, height:4, borderRadius:"50%", background:T.muted }}/>
                <span style={{ fontSize:12, color:T.muted }}>{h}</span>
              </div>
            ))}
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px", margin:"16px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:"'DM Mono'", fontSize:22, fontWeight:500 }}>${bookingCoach.price}<span style={{ fontSize:11, color:T.muted, fontFamily:"'Inter'" }}>/month</span></div>
                <div style={{ fontSize:10, color:T.muted }}>Cancel anytime · No setup fee</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:10, color:T.muted }}>Responds in</div>
                <div style={{ fontWeight:700, fontSize:13, color:T.green }}>{bookingCoach.response}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{setShowBooking(false);setTab("chat");}} style={{ flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:12, fontFamily:"'Inter'", fontSize:13, fontWeight:600, color:T.muted, cursor:"pointer" }}>💬 Message First</button>
              <button onClick={()=>{ setCoach(bookingCoach); setShowBooking(false); setPlanApproved(false); setTab("plan"); }} style={{ flex:2, background:T.grad, border:"none", borderRadius:12, padding:12, fontFamily:"'Inter'", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>📅 Book Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── COACH APP ────────────────────────────────────────────────────
function CoachApp({ onApprove, approved }) {
  const [tab, setTab] = useState("runners");
  const [selected, setSelected] = useState(null);
  const [plan, setPlan] = useState(WEEK_PLAN);
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [msgs, setMsgs] = useState(MESSAGES);
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  const sendMsg = () => { if(!draft.trim()) return; setMsgs(m=>[...m,{id:Date.now(),from:"coach",text:draft,time:"Now"}]); setDraft(""); };

  const navItems = [
    {id:"runners",icon:"◈",label:"Runners"},
    {id:"review", icon:"◷",label:"Review"},
    {id:"chat",   icon:"✉",label:"Chat"},
    {id:"squad",  icon:"∿",label:"Squad"},
  ];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:T.bg, fontFamily:"'Inter',sans-serif", color:T.ink, overflow:"hidden" }}>

      {/* Header */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"12px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:T.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>〜</div>
          <span style={{ fontWeight:800, fontSize:15, letterSpacing:-0.3 }}>RUNIQ</span>
          <Chip label="Coach" color={T.purple}/>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Chip label={`${COACH_RUNNERS.filter(r=>r.status==="needs_review").length} pending`} color={T.orange}/>
          <Av init="SM" color={T.purple} size={28}/>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>

        {/* RUNNERS */}
        {tab==="runners" && (
          <div style={{ padding:18, animation:"su .3s ease" }}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>Your Runners</div>
            <div style={{ fontSize:11, color:T.muted, marginBottom:16 }}>{COACH_RUNNERS.length} active · {COACH_RUNNERS.filter(r=>r.status==="needs_review").length} plans need review</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {COACH_RUNNERS.map(r=>{
                const isApproved = approved.includes(r.id) || r.status==="approved";
                return (
                  <div key={r.id} onClick={()=>{ setSelected(r); setTab("review"); }} style={{ background:T.card, border:`1px solid ${isApproved?T.border:T.orange+"50"}`, borderRadius:14, padding:14, cursor:"pointer", transition:"all .2s" }}>
                    <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
                      <Av init={r.init} color={r.color} size={38}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:13 }}>{r.name}</div>
                        <div style={{ fontSize:10, color:T.muted }}>{r.goal}</div>
                      </div>
                      {isApproved ? <Chip label="✓ Approved" color={T.green}/> : <Chip label="Needs Review" color={T.orange}/>}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-around", paddingTop:10, borderTop:`1px solid ${T.border}` }}>
                      {[
                        {l:"Readiness",v:r.readiness,c:r.readiness>=80?T.green:r.readiness>=60?T.yellow:T.red},
                        {l:"HRV",v:`${r.hrv}ms`,c:T.ink},
                        {l:"Load",v:`${r.load}/10`,c:r.load>7?T.red:T.ink},
                        {l:"Active",v:r.lastActive,c:T.muted},
                      ].map(s=>(
                        <div key={s.l} style={{ textAlign:"center" }}>
                          <div style={{ fontFamily:"'DM Mono'", fontSize:13, color:s.c, fontWeight:500 }}>{s.v}</div>
                          <div style={{ fontSize:9, color:T.muted, letterSpacing:.5, textTransform:"uppercase", marginTop:2 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* REVIEW */}
        {tab==="review" && (
          <div style={{ padding:18, animation:"su .3s ease" }}>
            <button onClick={()=>setTab("runners")} style={{ background:"none", border:"none", color:T.muted, fontFamily:"'Inter'", fontSize:11, cursor:"pointer", marginBottom:14, padding:0 }}>← Back to Runners</button>
            {selected ? (
              <>
                {/* Runner context */}
                <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:14, marginBottom:12, display:"flex", gap:10, alignItems:"center" }}>
                  <Av init={selected.init} color={selected.color} size={44}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{selected.name}</div>
                    <div style={{ fontSize:11, color:T.muted, marginBottom:8 }}>{selected.goal}</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      <Chip label={`Readiness ${selected.readiness}`} color={selected.readiness>=80?T.green:T.yellow}/>
                      <Chip label={`HRV ${selected.hrv}ms`} color={T.blue}/>
                      {selected.load>7 && <Chip label={`Load ${selected.load} ⚠`} color={T.red}/>}
                    </div>
                  </div>
                  <Ring value={selected.readiness} size={60}/>
                </div>

                {/* AI rationale */}
                <div style={{ background:`${T.purple}12`, border:`1px solid ${T.purple}30`, borderRadius:12, padding:14, marginBottom:12 }}>
                  <div style={{ fontSize:9, color:T.purple, letterSpacing:1.5, fontWeight:700, marginBottom:8 }}>✦ AI PLAN RATIONALE</div>
                  <div style={{ fontSize:11, color:T.muted, lineHeight:1.7 }}>HRV is {((selected.hrv-62)/62*100).toFixed(1)}% below 4-week baseline. Intensity adjusted: easy sessions maintained, high-intensity capped at 1 session this week. Long run preserved at 22km — aerobic base priority. Recommend coach monitors Thursday tempo execution. Weekly load: {selected.load}/10 — within safe range.</div>
                  <div style={{ fontSize:10, color:T.purple, marginTop:8, cursor:"pointer" }}>↓ Show full analysis</div>
                </div>

                {/* Plan */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                    <div style={{ fontWeight:700, fontSize:13 }}>Weekly Plan</div>
                    <button onClick={()=>setEditing(!editing)} style={{ background:editing?T.purple:T.card, border:`1px solid ${editing?T.purple:T.border}`, borderRadius:6, padding:"4px 10px", fontFamily:"'Inter'", fontSize:11, fontWeight:600, color:editing?"#fff":T.muted, cursor:"pointer" }}>
                      {editing?"Done":"Edit"}
                    </button>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {plan.map((s,i)=>(
                      <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"11px 13px", display:"flex", gap:10, alignItems:"center" }}>
                        <div style={{ fontFamily:"'DM Mono'", fontSize:9, color:T.muted, width:22 }}>{s.day}</div>
                        <div style={{ width:3, height:30, borderRadius:2, background:s.color, flexShrink:0 }}/>
                        <div style={{ flex:1 }}>
                          {editing
                            ? <input value={s.detail} onChange={e=>setPlan(p=>p.map((x,j)=>j===i?{...x,detail:e.target.value}:x))} style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:6, color:T.ink, fontFamily:"'Inter'", fontSize:11, padding:"4px 8px", width:"100%", outline:"none" }}/>
                            : <>
                                <div style={{ fontWeight:600, fontSize:12 }}>{s.type}{s.km?` · ${s.km}km`:""}</div>
                                <div style={{ fontSize:10, color:T.muted, marginTop:1 }}>{s.detail}</div>
                              </>}
                        </div>
                        {s.zone && <Chip label={s.zone} color={s.color}/>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approve */}
                {!approved.includes(selected.id) && selected.status!=="approved" ? (
                  <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:14 }}>
                    <div style={{ fontSize:12, fontWeight:700, marginBottom:10 }}>Coaching Notes for {selected.name.split(" ")[0]}</div>
                    <textarea value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Add feedback before approving... (e.g. 'Reduce tempo to 6km — HRV dip. Keep long run.')" style={{ width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, color:T.ink, fontFamily:"'Inter'", fontSize:12, padding:10, resize:"none", minHeight:70, outline:"none" }}/>
                    <div style={{ display:"flex", gap:8, marginTop:10 }}>
                      <button onClick={()=>{ onApprove(selected.id); }} style={{ flex:2, background:T.grad, color:"#fff", border:"none", borderRadius:10, padding:10, fontFamily:"'Inter'", fontSize:12, fontWeight:800, cursor:"pointer" }}>✓ Approve & Send to Runner</button>
                      <button onClick={()=>setTab("chat")} style={{ flex:1, background:T.bg, color:T.muted, border:`1px solid ${T.border}`, borderRadius:10, padding:10, fontFamily:"'Inter'", fontSize:12, fontWeight:600, cursor:"pointer" }}>Message</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background:`${T.green}12`, border:`1px solid ${T.green}30`, borderRadius:12, padding:14, textAlign:"center" }}>
                    <div style={{ fontWeight:700, color:T.green, marginBottom:4 }}>✓ Plan Approved & Sent</div>
                    <div style={{ fontSize:11, color:T.muted }}>{selected.name.split(" ")[0]} has been notified. Plan is live.</div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"60px 20px", color:T.muted }}>
                <div style={{ fontSize:40, marginBottom:12 }}>◈</div>
                <div style={{ fontSize:13 }}>Select a runner from the Runners tab to review their plan</div>
              </div>
            )}
          </div>
        )}

        {/* CHAT coach */}
        {tab==="chat" && (
          <div style={{ padding:18, animation:"su .3s ease", height:"calc(100% - 36px)", display:"flex", flexDirection:"column" }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:2 }}>Alex Thompson</div>
            <div style={{ fontSize:11, color:T.muted, marginBottom:14 }}>Sub-4hr Marathon · Readiness 72</div>
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
              {msgs.map(m=>(
                <div key={m.id} style={{ display:"flex", flexDirection:m.from==="coach"?"row-reverse":"row", gap:8, alignItems:"flex-end" }}>
                  {m.from==="runner" && <Av init="AT" color={T.blue} size={26}/>}
                  <div style={{ maxWidth:"78%", background:m.from==="coach"?T.grad:T.card, border:m.from==="coach"?"none":`1px solid ${T.border}`, borderRadius:m.from==="coach"?"14px 14px 4px 14px":"14px 14px 14px 4px", padding:"10px 13px" }}>
                    <div style={{ fontSize:12, lineHeight:1.6 }}>{m.text}</div>
                    <div style={{ fontSize:9, opacity:.4, marginTop:3, textAlign:m.from==="coach"?"right":"left" }}>{m.time}</div>
                  </div>
                </div>
              ))}
              <div ref={endRef}/>
            </div>
            <div style={{ display:"flex", gap:8, background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:8, flexShrink:0 }}>
              <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Message Alex..." style={{ flex:1, background:"none", border:"none", outline:"none", fontFamily:"'Inter'", fontSize:12, color:T.ink, padding:"4px 6px" }}/>
              <button onClick={sendMsg} style={{ background:T.grad, color:"#fff", border:"none", borderRadius:8, padding:"7px 12px", fontFamily:"'Inter'", fontSize:12, fontWeight:800, cursor:"pointer" }}>Send</button>
            </div>
          </div>
        )}

        {/* SQUAD */}
        {tab==="squad" && (
          <div style={{ padding:18, animation:"su .3s ease" }}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:16 }}>Squad Overview</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {[
                {label:"Active Runners",val:COACH_RUNNERS.length,color:T.purple},
                {label:"Plans Pending",val:COACH_RUNNERS.filter(r=>r.status==="needs_review").length,color:T.orange},
                {label:"Avg Readiness",val:Math.round(COACH_RUNNERS.reduce((a,r)=>a+r.readiness,0)/COACH_RUNNERS.length),color:T.green},
                {label:"High Load >7",val:COACH_RUNNERS.filter(r=>r.load>7).length,color:T.red},
              ].map(s=>(
                <div key={s.label} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:14 }}>
                  <div style={{ fontFamily:"'DM Mono'", fontSize:30, color:s.color, fontWeight:500 }}>{s.val}</div>
                  <div style={{ fontSize:10, color:T.muted, marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:16 }}>
              <div style={{ fontSize:10, color:T.muted, letterSpacing:1.5, marginBottom:14, textTransform:"uppercase" }}>Runner Readiness</div>
              {COACH_RUNNERS.map(r=>(
                <div key={r.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                  <Av init={r.init} color={r.color} size={30}/>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:12, fontWeight:600 }}>{r.name.split(" ")[0]}</span>
                      <span style={{ fontFamily:"'DM Mono'", fontSize:11, color:r.readiness>=80?T.green:r.readiness>=60?T.yellow:T.red }}>{r.readiness}</span>
                    </div>
                    <Bar pct={r.readiness} gradient={r.readiness>=80?T.gradGreen:r.readiness>=60?`linear-gradient(90deg,${T.yellow},${T.orange})`:`linear-gradient(90deg,${T.red},#ff6b6b)`} height={4}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ background:T.surface, borderTop:`1px solid ${T.border}`, display:"flex", padding:"8px 0 4px", flexShrink:0 }}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"4px 0" }}>
            <span style={{ fontSize:16, opacity:tab===n.id?1:.25 }}>{n.icon}</span>
            <span style={{ fontFamily:"'Inter'", fontSize:8, color:tab===n.id?T.purpleLight:T.muted, fontWeight:tab===n.id?700:400, letterSpacing:.3 }}>{n.label}</span>
            {tab===n.id && <div style={{ width:4, height:4, borderRadius:"50%", background:T.purpleLight, marginTop:1 }}/>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── PHONE BEZEL ───────────────────────────────────────────────────
function Phone({ children, label }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
      <div style={{ fontFamily:"'DM Mono'", fontSize:9, color:T.muted, letterSpacing:2, textTransform:"uppercase" }}>{label}</div>
      <div style={{ width:300, background:"#0a0a0f", borderRadius:42, padding:"10px 8px", boxShadow:"0 40px 80px #000000cc, 0 0 0 1px #1a1a2e, inset 0 0 0 1px #252840" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:6 }}>
          <div style={{ width:90, height:26, background:"#0a0a0f", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#1a1a2e" }}/>
            <div style={{ width:44, height:7, borderRadius:4, background:"#1a1a2e" }}/>
          </div>
        </div>
        <div style={{ borderRadius:30, overflow:"hidden", height:580, position:"relative" }}>
          {children}
        </div>
        <div style={{ display:"flex", justifyContent:"center", marginTop:8 }}>
          <div style={{ width:90, height:4, borderRadius:2, background:"#252840" }}/>
        </div>
      </div>
    </div>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [coach, setCoach] = useState(null);
  const [planApproved, setPlanApproved] = useState(false);
  const [approvedIds, setApprovedIds] = useState([]);

  const handleApprove = (id) => { setApprovedIds(a=>[...a,id]); if(id===1) setPlanApproved(true); };

  if(screen==="login") return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter',sans-serif" }}>
      <style>{FONTS+`*{box-sizing:border-box;margin:0;padding:0;} @keyframes su{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} @keyframes slideSheet{from{transform:translateY(100%)}to{transform:none}} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}`}</style>
      <div style={{ width:"100%", maxWidth:360, animation:"su .5s ease" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ width:72, height:72, borderRadius:20, background:T.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 16px" }}>〜</div>
          <div style={{ fontWeight:900, fontSize:28, letterSpacing:-1, background:T.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>RUNIQ</div>
          <div style={{ fontSize:12, color:T.muted, marginTop:4 }}>AI-Powered Training Platform</div>
        </div>

        {/* Role toggle */}
        <div style={{ background:T.card, borderRadius:14, padding:4, marginBottom:24 }}>
          <div style={{ display:"flex" }}>
            {["Runner","Trainer"].map((r,i)=>(
              <button key={r} style={{ flex:1, background:i===0?T.grad:"none", border:"none", borderRadius:11, padding:"10px", fontFamily:"'Inter'", fontSize:13, fontWeight:700, color:i===0?"#fff":T.muted, cursor:"pointer" }}>{r}</button>
            ))}
          </div>
        </div>

        {/* Form */}
        {[["Email","you@example.com","✉"],["Password","••••••••","🔒"]].map(([l,ph,ic])=>(
          <div key={l} style={{ marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, fontWeight:600 }}>{l}</span>
              {l==="Password" && <span style={{ fontSize:11, color:T.blue, cursor:"pointer" }}>Forgot password?</span>}
            </div>
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px 14px", display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ fontSize:14, opacity:.4 }}>{ic}</span>
              <span style={{ fontSize:12, color:T.dim }}>{ph}</span>
              {l==="Password" && <span style={{ fontSize:14, opacity:.3, marginLeft:"auto" }}>👁</span>}
            </div>
          </div>
        ))}

        <button onClick={()=>setScreen("demo")} style={{ width:"100%", background:T.grad, border:"none", borderRadius:12, padding:"14px", fontFamily:"'Inter'", fontSize:14, fontWeight:800, color:"#fff", cursor:"pointer", marginBottom:20, letterSpacing:-.2 }}>Log In →</button>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:1, background:T.border }}/>
          <span style={{ fontSize:11, color:T.muted }}>or continue with</span>
          <div style={{ flex:1, height:1, background:T.border }}/>
        </div>

        <div style={{ display:"flex", gap:10, marginBottom:24 }}>
          {[["🟠","Strava"],["⬤","Garmin"]].map(([ic,l])=>(
            <button key={l} onClick={()=>setScreen("demo")} style={{ flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px", fontFamily:"'Inter'", fontSize:13, fontWeight:600, color:T.ink, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <span>{ic}</span>{l}
            </button>
          ))}
        </div>

        <div style={{ textAlign:"center", fontSize:12, color:T.muted }}>
          Don't have an account? <span style={{ color:T.blue, fontWeight:600, cursor:"pointer" }}>Sign up</span>
        </div>
      </div>
    </div>
  );

  if(screen==="demo") return (
    <div style={{ minHeight:"100vh", background:"#08090d", display:"flex", flexDirection:"column", fontFamily:"'Inter',sans-serif" }}>
      <style>{FONTS+`*{box-sizing:border-box;margin:0;padding:0;} @keyframes su{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} @keyframes slideSheet{from{transform:translateY(100%)}to{transform:none}} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}`}</style>
      {/* Topbar */}
      <div style={{ background:"#0c0d12", borderBottom:`1px solid ${T.border}`, padding:"10px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:24, height:24, borderRadius:7, background:T.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>〜</div>
          <span style={{ fontWeight:800, fontSize:14, color:T.ink }}>RUNIQ</span>
          <span style={{ fontSize:9, color:T.muted, fontFamily:"'DM Mono'", letterSpacing:2 }}>v2.0 · LIVE DEMO</span>
        </div>
        <button onClick={()=>setScreen("landing")} style={{ background:"none", border:"none", color:T.muted, fontSize:11, cursor:"pointer" }}>← Back</button>
      </div>
      {/* Two phones */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:48, padding:"32px 16px", flexWrap:"wrap" }}>
        <Phone label="🏃 Runner App">
          <RunnerApp coach={coach} setCoach={setCoach} planApproved={planApproved} setPlanApproved={setPlanApproved}/>
        </Phone>
        <Phone label="📋 Coach App">
          <CoachApp onApprove={handleApprove} approved={approvedIds}/>
        </Phone>
      </div>
      <div style={{ textAlign:"center", padding:"0 0 20px", fontFamily:"'DM Mono'", fontSize:8, color:T.dim, letterSpacing:2 }}>
        LIVE CLAUDE API · NEXT.JS 14 · SUPABASE · STRAVA + GARMIN
      </div>
    </div>
  );

  // LANDING
  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px", fontFamily:"'Inter',sans-serif", color:T.ink }}>
      <style>{FONTS+`*{box-sizing:border-box;margin:0;padding:0;} @keyframes su{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}} @keyframes slideSheet{from{transform:translateY(100%)}to{transform:none}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}`}</style>

      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32, animation:"su .5s ease" }}>
        <div style={{ width:52, height:52, borderRadius:14, background:T.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, animation:"float 3s ease infinite" }}>〜</div>
        <div>
          <div style={{ fontWeight:900, fontSize:34, letterSpacing:-1.5, background:T.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>RUNIQ</div>
          <div style={{ fontFamily:"'DM Mono'", fontSize:9, color:T.muted, letterSpacing:2 }}>INVESTOR PREVIEW · 2026</div>
        </div>
      </div>

      <div style={{ textAlign:"center", maxWidth:480, marginBottom:40, animation:"su .6s ease" }}>
        <div style={{ fontSize:38, fontWeight:900, lineHeight:1.15, marginBottom:14, letterSpacing:-1 }}>
          AI training plans,<br/><Grad>human-validated.</Grad>
        </div>
        <div style={{ fontSize:14, color:T.muted, lineHeight:1.7 }}>
          The marketplace that connects Indonesian runners with certified coaches — where AI generates the plan, a real expert approves it before the athlete ever sees it.
        </div>
      </div>

      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:40, animation:"su .65s ease" }}>
        {["✦ Live Claude AI","◈ Coach marketplace","◷ Human approval layer","∿ HRV + sleep + load","✉ Real-time coaching"].map(f=>(
          <div key={f} style={{ fontSize:11, color:T.muted, background:T.card, border:`1px solid ${T.border}`, padding:"5px 12px", borderRadius:999 }}>{f}</div>
        ))}
      </div>

      <div style={{ display:"flex", gap:14, animation:"su .7s ease", flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={()=>setScreen("demo")} style={{ background:T.grad, border:"none", borderRadius:14, padding:"14px 32px", fontFamily:"'Inter'", fontSize:15, fontWeight:800, color:"#fff", cursor:"pointer", letterSpacing:-.2 }}>View Live Demo →</button>
        <button onClick={()=>setScreen("login")} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"14px 28px", fontFamily:"'Inter'", fontSize:15, fontWeight:600, color:T.muted, cursor:"pointer" }}>Try Login Flow</button>
      </div>

      <div style={{ marginTop:20, fontFamily:"'DM Mono'", fontSize:9, color:T.dim, letterSpacing:2, animation:"su .75s ease" }}>
        LIVE CLAUDE API · TWO-SIDED PLATFORM · REAL INTERACTIONS
      </div>
    </div>
  );
}
