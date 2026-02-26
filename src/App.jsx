import { useState, useEffect, useRef } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine,
  ReferenceArea
} from "recharts";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const SEASON_ID    = "20252026";
const SEASON_LABEL = "2025·26";
const PBP_BASE   = "/api/nhle-web/v1/gamecenter";
const SCHED_BASE = "/api/nhle-web/v1/schedule";
const STATS_BASE = "/api/nhle-stats/stats/rest/en/team";

const FALLBACK_TEAMS = [
  { name:"Edmonton Oilers",       abbr:"EDM", pp:27.8, pk:78.5, wins:28, gp:51, conf:"W", ppOpp:185, pkOpp:178 },
  { name:"Colorado Avalanche",    abbr:"COL", pp:25.4, pk:81.8, wins:38, gp:47, conf:"W", ppOpp:190, pkOpp:172 },
  { name:"Vegas Golden Knights",  abbr:"VGK", pp:24.2, pk:83.1, wins:28, gp:44, conf:"W", ppOpp:182, pkOpp:169 },
  { name:"Tampa Bay Lightning",   abbr:"TBL", pp:23.8, pk:81.3, wins:38, gp:52, conf:"E", ppOpp:193, pkOpp:181 },
  { name:"Toronto Maple Leafs",   abbr:"TOR", pp:24.0, pk:79.5, wins:27, gp:49, conf:"E", ppOpp:178, pkOpp:185 },
  { name:"Florida Panthers",      abbr:"FLA", pp:23.5, pk:82.4, wins:29, gp:54, conf:"E", ppOpp:195, pkOpp:177 },
  { name:"Dallas Stars",          abbr:"DAL", pp:23.2, pk:83.9, wins:35, gp:49, conf:"W", ppOpp:186, pkOpp:165 },
  { name:"Carolina Hurricanes",   abbr:"CAR", pp:21.4, pk:84.5, wins:36, gp:51, conf:"E", ppOpp:179, pkOpp:168 },
  { name:"Washington Capitals",   abbr:"WSH", pp:22.6, pk:81.5, wins:30, gp:53, conf:"E", ppOpp:188, pkOpp:182 },
  { name:"Minnesota Wild",        abbr:"MIN", pp:22.2, pk:82.8, wins:34, gp:48, conf:"W", ppOpp:184, pkOpp:171 },
  { name:"Pittsburgh Penguins",   abbr:"PIT", pp:22.0, pk:80.9, wins:29, gp:44, conf:"E", ppOpp:181, pkOpp:176 },
  { name:"Boston Bruins",         abbr:"BOS", pp:22.1, pk:82.1, wins:32, gp:52, conf:"E", ppOpp:187, pkOpp:173 },
  { name:"New York Rangers",      abbr:"NYR", pp:21.6, pk:80.1, wins:22, gp:51, conf:"E", ppOpp:176, pkOpp:180 },
  { name:"Winnipeg Jets",         abbr:"WPG", pp:21.0, pk:81.2, wins:23, gp:49, conf:"W", ppOpp:183, pkOpp:174 },
  { name:"Detroit Red Wings",     abbr:"DET", pp:21.0, pk:80.3, wins:33, gp:52, conf:"E", ppOpp:180, pkOpp:178 },
  { name:"Seattle Kraken",        abbr:"SEA", pp:20.4, pk:81.4, wins:27, gp:48, conf:"W", ppOpp:177, pkOpp:176 },
  { name:"Vancouver Canucks",     abbr:"VAN", pp:20.2, pk:76.5, wins:18, gp:51, conf:"W", ppOpp:186, pkOpp:188 },
  { name:"Utah Mammoth",          abbr:"UTA", pp:20.5, pk:80.6, wins:30, gp:54, conf:"W", ppOpp:179, pkOpp:179 },
  { name:"Ottawa Senators",       abbr:"OTT", pp:20.1, pk:79.8, wins:28, gp:50, conf:"E", ppOpp:185, pkOpp:182 },
  { name:"New Jersey Devils",     abbr:"NJD", pp:19.9, pk:79.4, wins:28, gp:56, conf:"E", ppOpp:191, pkOpp:186 },
  { name:"Montreal Canadiens",    abbr:"MTL", pp:20.6, pk:78.5, wins:32, gp:49, conf:"E", ppOpp:182, pkOpp:184 },
  { name:"New York Islanders",    abbr:"NYI", pp:18.7, pk:83.8, wins:32, gp:53, conf:"E", ppOpp:174, pkOpp:172 },
  { name:"Los Angeles Kings",     abbr:"LAK", pp:19.6, pk:83.3, wins:23, gp:43, conf:"W", ppOpp:176, pkOpp:169 },
  { name:"Columbus Blue Jackets", abbr:"CBJ", pp:18.9, pk:78.8, wins:29, gp:49, conf:"E", ppOpp:178, pkOpp:184 },
  { name:"Calgary Flames",        abbr:"CGY", pp:19.0, pk:79.2, wins:23, gp:50, conf:"W", ppOpp:180, pkOpp:183 },
  { name:"Nashville Predators",   abbr:"NSH", pp:18.5, pk:79.9, wins:26, gp:50, conf:"W", ppOpp:175, pkOpp:180 },
  { name:"Philadelphia Flyers",   abbr:"PHI", pp:18.3, pk:78.2, wins:25, gp:46, conf:"E", ppOpp:173, pkOpp:185 },
  { name:"Buffalo Sabres",        abbr:"BUF", pp:19.3, pk:77.1, wins:33, gp:52, conf:"E", ppOpp:182, pkOpp:189 },
  { name:"St. Louis Blues",       abbr:"STL", pp:18.0, pk:78.4, wins:20, gp:48, conf:"W", ppOpp:171, pkOpp:186 },
  { name:"Anaheim Ducks",         abbr:"ANA", pp:18.1, pk:76.8, wins:31, gp:54, conf:"W", ppOpp:176, pkOpp:191 },
  { name:"Chicago Blackhawks",    abbr:"CHI", pp:17.3, pk:77.1, wins:22, gp:48, conf:"W", ppOpp:168, pkOpp:188 },
  { name:"San Jose Sharks",       abbr:"SJS", pp:17.7, pk:76.1, wins:27, gp:51, conf:"W", ppOpp:172, pkOpp:192 },
];

const LG_PP = +(FALLBACK_TEAMS.reduce((s,t)=>s+t.pp,0)/FALLBACK_TEAMS.length).toFixed(1);
const LG_PK = +(FALLBACK_TEAMS.reduce((s,t)=>s+t.pk,0)/FALLBACK_TEAMS.length).toFixed(1);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function processTeams(teams) {
  return teams.map(t => ({
    ...t,
    winPct:       +(t.wins/t.gp).toFixed(3),
    closeGameScore: +(t.pp*0.55+(t.pk-75)*0.9).toFixed(1),
    ppGoals:      Math.round(t.ppOpp*t.pp/100),
    pkGA:         Math.round(t.pkOpp*(100-t.pk)/100),
    quad:         getQuad(t.pp, t.pk),
  })).sort((a,b)=>b.closeGameScore-a.closeGameScore);
}

function getQuad(pp, pk) {
  const a=pp>=LG_PP, b=pk>=LG_PK;
  if (a&&b)  return {label:"Elite",        color:"#00e5a0"};
  if (a&&!b) return {label:"PP Specialist",color:"#f59e0b"};
  if (!a&&b) return {label:"PK Specialist",color:"#60a5fa"};
  return             {label:"Struggling",  color:"#f87171"};
}

function linReg(data,xKey,yKey) {
  const n=data.length,
    sumX=data.reduce((s,d)=>s+d[xKey],0),
    sumY=data.reduce((s,d)=>s+d[yKey],0),
    sumXY=data.reduce((s,d)=>s+d[xKey]*d[yKey],0),
    sumX2=data.reduce((s,d)=>s+d[xKey]**2,0),
    m=(n*sumXY-sumX*sumY)/(n*sumX2-sumX**2),
    b=(sumY-m*sumX)/n,
    yMean=sumY/n,
    ssTot=data.reduce((s,d)=>s+(d[yKey]-yMean)**2,0),
    ssRes=data.reduce((s,d)=>s+(d[yKey]-(m*d[xKey]+b))**2,0);
  return {m,b,r2:1-ssRes/ssTot};
}

function toGameSec(period,timeInPeriod) {
  const [min,sec]=(timeInPeriod||"0:00").split(":").map(Number);
  return (period-1)*1200+min*60+sec;
}

// ─── PLAY-BY-PLAY ENGINE ──────────────────────────────────────────────────────
async function fetchGameIds(targetCount = 60) {
  const ids = [];
  let cursor = new Date();
  const cutoff = new Date("2024-10-01");

  while (ids.length < targetCount && cursor > cutoff) {
    const dateStr = cursor.toISOString().split("T")[0];
    try {
      const res  = await fetch(`${SCHED_BASE}/${dateStr}`);
      const data = await res.json();
      for (const day of (data.gameWeek || [])) {
        for (const g of (day.games || [])) {
          const state = g.gameState || "";
          const isComplete = state === "OFF" || state === "FINAL" || state === "7";
          if (g.gameType === 2 && isComplete && !ids.includes(g.id)) {
            ids.push(g.id);
          }
        }
      }
    } catch(e) {
      console.log("Schedule fetch failed for", dateStr, e);
    }
    cursor.setDate(cursor.getDate() - 3);
  }
  console.log("Game IDs found:", ids.length, ids.slice(0,5));
  return ids.slice(0, targetCount);
}

async function processGamePBP(gameId) {
  const res=await fetch(`${PBP_BASE}/${gameId}/play-by-play`);
  if (!res.ok) return [];
  const data=await res.json();
  const homeId=data.homeTeam?.id, awayId=data.awayTeam?.id;
  const homeAbbr=data.homeTeam?.abbrev||"???", awayAbbr=data.awayTeam?.abbrev||"???";
  if (!homeId||!awayId) return [];

  let homeScore=0, awayScore=0;
  const activePPs=[];
  const allEvents=[];

  for (const play of (data.plays||[])) {
    const period=play.periodDescriptor?.number||1;
    if (period>3) continue;
    const gameSec=toGameSec(period,play.timeInPeriod);
    const typeKey=play.typeDescKey;
    const code=play.situationCode||"1551";

    // Expire old PPs
    for (let i=activePPs.length-1;i>=0;i--) {
      if (gameSec>activePPs[i].expirySec) activePPs.splice(i,1);
    }

    if (typeKey==="goal") {
      const scoringId=play.details?.eventOwnerTeamId;
      const awayG=+code[0],awaySk=+code[1],homeSk=+code[2],homeG=+code[3];
      const isPP=awayG===1&&homeG===1&&awaySk!==homeSk;
      if (isPP) {
        const ppTeamId=homeSk>awaySk?homeId:awayId;
        for (const pp of activePPs) {
          if (pp.ppTeamId===ppTeamId&&!pp.scored) { pp.scored=true; break; }
        }
      }
      if (scoringId===homeId) homeScore++;
      else if (scoringId===awayId) awayScore++;
    }

    if (typeKey==="penalty") {
      const committingId=play.details?.eventOwnerTeamId;
      if (!committingId) continue;
      const durMin=play.details?.duration??play.details?.penaltyMinutes??2;
      if (!durMin||durMin>=10) continue;

      const ppTeamId=committingId===homeId?awayId:homeId;
      const pkTeamId=committingId;
      const diff=Math.abs(homeScore-awayScore);
      const isClose=diff<=1;
      const expirySec=Math.min(gameSec+Math.min(durMin,2)*60, period*1200);

      const event={ppTeamId,pkTeamId,homeId,awayId,homeAbbr,awayAbbr,isClose,diff,expirySec,scored:false};
      activePPs.push(event);
      allEvents.push(event);
    }
  }
  return allEvents;
}

function aggregateEvents(allEvents) {
  const stats={};
  const init=()=>({ppOpp:0,ppGoals:0,ppOppCG:0,ppGoalsCG:0,pkOpp:0,pkGoals:0,pkOppCG:0,pkGoalsCG:0});

  for (const e of allEvents) {
    const ppAbbr=e.ppTeamId===e.homeId?e.homeAbbr:e.awayAbbr;
    const pkAbbr=e.pkTeamId===e.homeId?e.homeAbbr:e.awayAbbr;
    if (!stats[ppAbbr]) stats[ppAbbr]=init();
    if (!stats[pkAbbr]) stats[pkAbbr]=init();

    stats[ppAbbr].ppOpp++;
    if (e.scored) stats[ppAbbr].ppGoals++;
    if (e.isClose) { stats[ppAbbr].ppOppCG++; if(e.scored) stats[ppAbbr].ppGoalsCG++; }

    stats[pkAbbr].pkOpp++;
    if (e.scored) stats[pkAbbr].pkGoals++;
    if (e.isClose) { stats[pkAbbr].pkOppCG++; if(e.scored) stats[pkAbbr].pkGoalsCG++; }
  }

  return Object.entries(stats).map(([abbr,s])=>{
    const ppPct   = s.ppOpp>0   ? +(s.ppGoals/s.ppOpp*100).toFixed(1)                         : null;
    const ppPctCG = s.ppOppCG>0 ? +(s.ppGoalsCG/s.ppOppCG*100).toFixed(1)                     : null;
    const pkPct   = s.pkOpp>0   ? +((s.pkOpp-s.pkGoals)/s.pkOpp*100).toFixed(1)               : null;
    const pkPctCG = s.pkOppCG>0 ? +((s.pkOppCG-s.pkGoalsCG)/s.pkOppCG*100).toFixed(1)         : null;
    const ppDelta = ppPct!=null&&ppPctCG!=null ? +(ppPctCG-ppPct).toFixed(1)                   : null;
    const pkDelta = pkPct!=null&&pkPctCG!=null ? +(pkPctCG-pkPct).toFixed(1)                   : null;
    const clutch  = ppDelta!=null&&pkDelta!=null ? +(ppDelta+pkDelta).toFixed(1)               : null;
    return {abbr,...s,ppPct,ppPctCG,pkPct,pkPctCG,ppDelta,pkDelta,clutch};
  }).filter(r=>r.ppOppCG>=3||r.pkOppCG>=3)
    .sort((a,b)=>(b.clutch??-99)-(a.clutch??-99));
}

// ─── TOOLTIP COMPONENTS ───────────────────────────────────────────────────────
const Box=({children})=>(
  <div style={{background:"#0a1628",border:"1px solid #1e3050",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#e2e8f0"}}>{children}</div>
);

const ClutchTip=({active,payload})=>{
  if(!active||!payload?.length) return null;
  const d=payload[0]?.payload;
  return <Box>
    <b style={{color:"#fff",fontSize:14}}>{d.abbr}</b>
    <div style={{marginTop:4}}>PP Close: <b style={{color:"#a78bfa"}}>{d.ppPctCG!=null?d.ppPctCG.toFixed(1)+"%":"—"}</b></div>
    <div>PP All: <b style={{color:"#7c6db0"}}>{d.ppPct!=null?d.ppPct.toFixed(1)+"%":"—"}</b></div>
    <div style={{marginTop:4}}>PK Close: <b style={{color:"#34d399"}}>{d.pkPctCG!=null?d.pkPctCG.toFixed(1)+"%":"—"}</b></div>
    <div>PK All: <b style={{color:"#256f52"}}>{d.pkPct!=null?d.pkPct.toFixed(1)+"%":"—"}</b></div>
    <div style={{marginTop:4,borderTop:"1px solid #1e3050",paddingTop:4}}>
      PP Δ: <b style={{color:d.ppDelta>=0?"#00e5a0":"#f87171"}}>{d.ppDelta!=null?(d.ppDelta>=0?"+":"")+d.ppDelta:"—"}</b>
      {"  "}PK Δ: <b style={{color:d.pkDelta>=0?"#00e5a0":"#f87171"}}>{d.pkDelta!=null?(d.pkDelta>=0?"+":"")+d.pkDelta:"—"}</b>
    </div>
    <div>Clutch: <b style={{color:"#fbbf24"}}>{d.clutch!=null?(d.clutch>=0?"+":"")+d.clutch:"—"}</b></div>
  </Box>;
};

const SeasonTip=({active,payload})=>{
  if(!active||!payload?.length) return null;
  const d=payload[0]?.payload;
  const q=getQuad(d.pp,d.pk);
  return <Box>
    <b style={{color:"#fff",fontSize:14}}>{d.name}</b>
    <div style={{color:q.color,fontSize:11,marginBottom:5}}>{q.label}</div>
    <div>PP%: <b style={{color:"#a78bfa"}}>{d.pp?.toFixed(1)}%</b></div>
    <div>PK%: <b style={{color:"#34d399"}}>{d.pk?.toFixed(1)}%</b></div>
    <div>CG Score: <b style={{color:"#fbbf24"}}>{d.closeGameScore}</b></div>
    <div>Win%: <b style={{color:"#fff"}}>{(d.winPct*100).toFixed(1)}%</b></div>
  </Box>;
};

const ModelTip=({active,payload})=>{
  if(!active||!payload?.length) return null;
  const d=payload[0]?.payload;
  const diff=(d.winPct-d.projWinPct)*100;
  return <Box>
    <b style={{color:"#fff",fontSize:14}}>{d.name}</b>
    <div>CG Score: <b style={{color:"#fbbf24"}}>{d.closeGameScore}</b></div>
    <div>Actual Win%: <b style={{color:"#60a5fa"}}>{(d.winPct*100).toFixed(1)}%</b></div>
    <div>Projected: <b style={{color:"#f97316"}}>{(d.projWinPct*100).toFixed(1)}%</b></div>
    <div>Δ: <b style={{color:diff>0?"#00e5a0":"#f87171"}}>{diff>0?"+":""}{diff.toFixed(1)}%</b></div>
  </Box>;
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [teams,     setTeams]     = useState([]);
  const [dataLabel, setDataLabel] = useState("loading");
  const [tab,       setTab]       = useState("scorestate");
  const [sortKey,   setSortKey]   = useState("clutch");
  const [sortDir,   setSortDir]   = useState(-1);
  const [confFilt,  setConfFilt]  = useState("ALL");

  // Score-state engine
  const [ssPhase,    setSsPhase]    = useState("idle");
  const [ssProgress, setSsProgress] = useState({done:0,total:0,ok:0,fail:0});
  const [ssError,    setSsError]    = useState("");
  const [ssResults,  setSsResults]  = useState([]);
  const [ssMeta,     setSsMeta]     = useState({totalEvents:0,closeEvents:0,gamesOk:0});
  const abortRef = useRef(false);

  useEffect(()=>{
    async function load() {
      try {
        const [ppRes,pkRes]=await Promise.all([
          fetch(`${STATS_BASE}/powerplay?cayenneExp=seasonId%3D${SEASON_ID}%20and%20gameTypeId%3D2&limit=40`),
          fetch(`${STATS_BASE}/penaltykill?cayenneExp=seasonId%3D${SEASON_ID}%20and%20gameTypeId%3D2&limit=40`),
        ]);
        if (!ppRes.ok||!pkRes.ok) throw new Error();
        const ppData=await ppRes.json(), pkData=await pkRes.json();
        const pkMap={};
        (pkData.data||[]).forEach(t=>{pkMap[t.teamFullName]=t;});
        const merged=(ppData.data||[]).map(pp=>{
          const pk=pkMap[pp.teamFullName]||{};
          const fb=FALLBACK_TEAMS.find(f=>f.name===pp.teamFullName)||{};
          const ppv=+(parseFloat(pp.powerPlayPct||0)*100).toFixed(1);
          const pkv=+(parseFloat(pk.penaltyKillPct||0)*100).toFixed(1);
          if (!ppv&&!pkv) return null;
          return {name:pp.teamFullName,abbr:fb.abbr||"???",pp:ppv,pk:pkv,
            ppOpp:pp.powerPlayOpportunities||fb.ppOpp||180,
            pkOpp:pk.penaltyKillOpportunities||fb.pkOpp||180,
            wins:fb.wins||25, gp:pp.gamesPlayed||fb.gp||50, conf:fb.conf||"E"};
        }).filter(Boolean);
        if (merged.length>20) { setTeams(processTeams(merged)); setDataLabel("live"); return; }
        throw new Error();
      } catch { setTeams(processTeams(FALLBACK_TEAMS)); setDataLabel("estimates"); }
    }
    load();
  },[]);

  async function runAnalysis() {
    abortRef.current=false;
    setSsPhase("fetching"); setSsProgress({done:0,total:0,ok:0,fail:0});
    setSsResults([]); setSsError(""); setSsMeta({totalEvents:0,closeEvents:0,gamesOk:0});

    let gameIds=[];
    try { gameIds=await fetchGameIds(55); }
    catch { setSsError("Schedule fetch failed — NHL API may be unavailable in this environment."); setSsPhase("error"); return; }
    if (!gameIds.length) { setSsError("No completed games found."); setSsPhase("error"); return; }

    setSsPhase("processing"); setSsProgress({done:0,total:gameIds.length,ok:0,fail:0});

    const all=[]; let ok=0,fail=0;
    for (let i=0;i<gameIds.length;i++) {
      if (abortRef.current) break;
      await new Promise(r=>setTimeout(r,180));
      try { const evts=await processGamePBP(gameIds[i]); all.push(...evts); ok++; }
      catch { fail++; }
      setSsProgress({done:i+1,total:gameIds.length,ok,fail});
    }

    if (!all.length) { setSsError("Play-by-play extraction yielded no events. The NHL API may block cross-origin requests from sandboxed environments. Deploy this app in a standard browser environment to enable live data."); setSsPhase("error"); return; }

    setSsMeta({totalEvents:all.length, closeEvents:all.filter(e=>e.isClose).length, gamesOk:ok});
    setSsResults(aggregateEvents(all));
    setSsPhase("done");
  }

  function cancel() { abortRef.current=true; setSsPhase("idle"); }

  const handleSort=(k)=>{ if(sortKey===k) setSortDir(d=>-d); else {setSortKey(k);setSortDir(-1);} };
  const SA=({col})=><span style={{marginLeft:3,opacity:sortKey===col?1:0.3,fontSize:9}}>{sortKey===col?(sortDir===-1?"▼":"▲"):"⬍"}</span>;

  const baseTeams=teams.length?teams:processTeams(FALLBACK_TEAMS);
  const sorted=[...baseTeams].filter(t=>confFilt==="ALL"||t.conf===confFilt).sort((a,b)=>sortDir*(b[sortKey]-a[sortKey]));
  const reg=baseTeams.length?linReg(baseTeams,"closeGameScore","winPct"):{m:0,b:0,r2:0};
  const modelData=baseTeams.map(t=>({...t,projWinPct:+(reg.m*t.closeGameScore+reg.b).toFixed(3)}));
  const lgPP2=teams.length?+(teams.reduce((s,t)=>s+t.pp,0)/teams.length).toFixed(1):LG_PP;
  const lgPK2=teams.length?+(teams.reduce((s,t)=>s+t.pk,0)/teams.length).toFixed(1):LG_PK;
  const top=baseTeams[0], pct=ssProgress.total>0?Math.round(ssProgress.done/ssProgress.total*100):0;
  const clutchBar=[...ssResults].filter(r=>r.clutch!=null).sort((a,b)=>b.clutch-a.clutch);

  const TABS=[
    {id:"scorestate",label:"🧊 Score State Engine"},
    {id:"rankings",  label:"📊 Season Rankings"},
    {id:"scatter",   label:"⚡ PP vs PK Matrix"},
    {id:"model",     label:"🔮 Predictive Model"},
  ];

  // ── reusable table header button ──
  const TH=({col,children})=>(
    <th style={{padding:"10px 8px",textAlign:"center"}}>
      <button onClick={()=>handleSort(col)} style={{background:"none",border:"none",cursor:"pointer",color:"#7a9fc0",fontFamily:"inherit",fontSize:11,fontWeight:500,letterSpacing:".08em",textTransform:"uppercase",whiteSpace:"nowrap",padding:0}}>
        {children}<SA col={col}/>
      </button>
    </th>
  );

  return (
    <div style={{minHeight:"100vh",background:"#060d1a",fontFamily:"'DM Mono','Courier New',monospace",color:"#c9d8f0",paddingBottom:60}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Barlow+Condensed:wght@700;800;900&display=swap');
        body{margin:0;background:#060d1a;}
        .btn{background:none;border:none;cursor:pointer;transition:all .18s;font-family:inherit;}
        .row:hover td{background:rgba(74,159,255,.05)!important;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:#0a1628;}
        ::-webkit-scrollbar-thumb{background:#2a4060;border-radius:3px;}
        .badge{display:inline-block;padding:2px 7px;border-radius:9px;font-size:10px;font-weight:700;}
        .prog{width:100%;height:6px;background:#1e3050;border-radius:3px;overflow:hidden;}
        .prog-fill{height:100%;border-radius:3px;transition:width .3s;background:linear-gradient(90deg,#4a9eff,#00e5a0);}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
        .pulse{animation:pulse 1.4s infinite;}
      `}</style>

      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#0a1628,#0d2040 50%,#091422)",borderBottom:"1px solid #1e3050",padding:"26px 32px 22px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:36,fontWeight:900,color:"#fff",letterSpacing:".02em",lineHeight:1}}>NHL SPECIAL TEAMS</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,color:"#4a9eff",letterSpacing:".1em",marginTop:2}}>CLOSE-GAME INTELLIGENCE — {SEASON_LABEL}</div>
              <div style={{fontSize:10,color:"#4a6fa5",marginTop:5}}>PP &amp; PK efficiency · true score-state play-by-play · predictive modeling</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:"#4a6fa5",letterSpacing:".1em",textTransform:"uppercase",marginBottom:3}}>Season Aggregate</div>
              <div style={{fontSize:11,color:dataLabel==="live"?"#00e5a0":"#f59e0b"}}>
                {dataLabel==="loading"?"⏳ Fetching...":dataLabel==="live"?"🟢 Live NHL API":"🟡 Season Estimates"}
              </div>
            </div>
          </div>
          {baseTeams.length>0&&(
            <div style={{display:"flex",gap:12,marginTop:20,flexWrap:"wrap"}}>
              {[
                {l:"League Avg PP%",   v:`${lgPP2}%`,                              c:"#a78bfa"},
                {l:"League Avg PK%",   v:`${lgPK2}%`,                              c:"#34d399"},
                {l:"Best Overall",     v:top?.abbr,                                c:"#fbbf24"},
                {l:"CG Leader Score",  v:top?.closeGameScore,                      c:"#fbbf24"},
                {l:"Games Analyzed",   v:ssPhase==="done"?ssMeta.gamesOk:"—",      c:"#60a5fa"},
                {l:"Close-Game PPs",   v:ssPhase==="done"?ssMeta.closeEvents:"—",  c:"#60a5fa"},
              ].map((c,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,.03)",border:"1px solid #1e3050",borderRadius:10,padding:"10px 16px",flex:"1 1 110px"}}>
                  <div style={{fontSize:9,color:"#4a6fa5",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>{c.l}</div>
                  <div style={{fontSize:20,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,color:c.c}}>{c.v??"—"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#0a1628",borderBottom:"1px solid #1e3050",padding:"0 32px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex"}}>
          {TABS.map(t=>(
            <button key={t.id} className="btn" onClick={()=>setTab(t.id)}
              style={{padding:"13px 18px",fontSize:12,fontWeight:500,letterSpacing:".05em",
                color:tab===t.id?"#4a9eff":"#4a6fa5",
                borderBottom:tab===t.id?"2px solid #4a9eff":"2px solid transparent",
                marginBottom:-1}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 32px 0"}}>

        {/* ══════════════════════════════════════════
            SCORE STATE ENGINE
        ══════════════════════════════════════════ */}
        {tab==="scorestate"&&(
          <div>
            <div style={{marginBottom:22}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:"#fff"}}>Score State Play-by-Play Engine</div>
              <div style={{fontSize:11,color:"#4a6fa5",marginTop:3,maxWidth:680,lineHeight:1.7}}>
                This engine fetches real NHL play-by-play data game-by-game. At each penalty event it records the exact score, classifying it as a <b style={{color:"#4a9eff"}}>close-game situation</b> (tied, up 1, or down 1). It then tracks whether the power play produced a goal before the penalty expired — revealing true close-game PP% and PK%, not just season totals.
              </div>
            </div>

            {/* HOW IT WORKS cards */}
            {ssPhase==="idle"&&(
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginBottom:26}}>
                  {[
                    {n:"01",t:"Fetch Schedule",     b:"Pulls completed 2025-26 regular season game IDs from the NHL schedule API, scanning backwards from the current date."},
                    {n:"02",t:"Parse Play-by-Play",  b:"Fetches every play for each game. Penalty and goal events are extracted with period, time, and situationCode."},
                    {n:"03",t:"Score State Tag",     b:"At each penalty, the running score is checked. diff ≤ 1 → flagged as a close-game PP/PK opportunity."},
                    {n:"04",t:"PP Outcome Linking",  b:"Each PP window tracks expiry time. If a PP goal is scored (via unequal situationCode) before expiry, it counts."},
                    {n:"05",t:"Clutch Delta",        b:"(Close-game PP%) − (Overall PP%) = PP delta. Same for PK. Sum = Clutch Score. Positive = performs better under pressure."},
                    {n:"06",t:"Team Ranking",        b:"All 32 teams ranked by Clutch Score. Who rises in tight games? Who fades when the margin is razor-thin?"},
                  ].map(s=>(
                    <div key={s.n} style={{background:"#0a1628",border:"1px solid #1e3050",borderRadius:10,padding:"16px 18px"}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:900,color:"#1e3050",lineHeight:1}}>{s.n}</div>
                      <div style={{fontWeight:700,color:"#4a9eff",fontSize:12,margin:"6px 0 4px"}}>{s.t}</div>
                      <div style={{fontSize:11,color:"#4a6fa5",lineHeight:1.65}}>{s.b}</div>
                    </div>
                  ))}
                </div>
                <div style={{textAlign:"center",padding:"20px 0 10px"}}>
                  <button onClick={runAnalysis}
                    style={{background:"linear-gradient(135deg,#1a3a6f,#0f2448)",border:"1px solid #4a9eff",borderRadius:10,color:"#4a9eff",fontFamily:"inherit",fontWeight:700,fontSize:14,letterSpacing:".1em",padding:"16px 46px",cursor:"pointer"}}
                    onMouseOver={e=>e.currentTarget.style.background="linear-gradient(135deg,#234a8a,#1a3060)"}
                    onMouseOut={e=>e.currentTarget.style.background="linear-gradient(135deg,#1a3a6f,#0f2448)"}>
                    ▶ &nbsp;START SCORE-STATE ANALYSIS
                  </button>
                  <div style={{fontSize:10,color:"#4a6fa5",marginTop:10}}>~50 games · ~450 penalty events · requires NHL API access</div>
                </div>
              </>
            )}

            {/* PROGRESS */}
            {(ssPhase==="fetching"||ssPhase==="processing")&&(
              <div style={{background:"#0a1628",border:"1px solid #1e3050",borderRadius:12,padding:"26px 30px",marginBottom:24}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800,color:"#fff"}}>
                      {ssPhase==="fetching"
                        ?<span className="pulse">Fetching game schedule...</span>
                        :`Processing games (${ssProgress.done} / ${ssProgress.total})`}
                    </div>
                    {ssPhase==="processing"&&(
                      <div style={{fontSize:11,color:"#4a6fa5",marginTop:4}}>
                        ✅ {ssProgress.ok} parsed &nbsp;·&nbsp; ❌ {ssProgress.fail} failed &nbsp;·&nbsp; {pct}% complete
                      </div>
                    )}
                  </div>
                  <button onClick={cancel} className="btn" style={{border:"1px solid #3a2020",borderRadius:6,color:"#f87171",fontSize:11,padding:"6px 14px"}}>Cancel</button>
                </div>
                <div className="prog"><div className="prog-fill" style={{width:`${ssPhase==="fetching"?12:pct}%`}}/></div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:20}}>
                  {[
                    {l:"Games Queued",    v:ssProgress.total||"—"},
                    {l:"Parsed OK",       v:ssProgress.ok||"—"},
                    {l:"Failed",          v:ssProgress.fail||"—"},
                    {l:"Events ~",        v:ssProgress.ok>0?"~"+(ssProgress.ok*9):"—"},
                  ].map((c,i)=>(
                    <div key={i} style={{background:"rgba(255,255,255,.02)",borderRadius:8,padding:"10px 14px",textAlign:"center"}}>
                      <div style={{fontSize:9,color:"#4a6fa5",letterSpacing:".08em",marginBottom:3}}>{c.l}</div>
                      <div style={{fontSize:20,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,color:"#60a5fa"}}>{c.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ERROR */}
            {ssPhase==="error"&&(
              <div style={{background:"#130808",border:"1px solid #5a2020",borderRadius:12,padding:"24px 28px",marginBottom:24}}>
                <div style={{color:"#f87171",fontWeight:700,fontSize:14,marginBottom:8}}>⚠ Analysis Failed</div>
                <div style={{color:"#c9a0a0",fontSize:12,lineHeight:1.7,marginBottom:14}}>{ssError}</div>
                <div style={{fontSize:11,color:"#7a5050",lineHeight:1.7}}>
                  The NHL play-by-play API (api-web.nhle.com) is publicly accessible but may be blocked by CORS policy in sandboxed environments like this artifact renderer. To run the full analysis, deploy this component in a standard web environment (e.g. Vite, Create React App) where the NHL API allows browser-origin requests.
                </div>
                <button onClick={()=>setSsPhase("idle")} className="btn" style={{marginTop:16,border:"1px solid #5a2020",borderRadius:6,color:"#f87171",fontSize:11,padding:"7px 16px"}}>← Try Again</button>
              </div>
            )}

            {/* RESULTS */}
            {ssPhase==="done"&&ssResults.length>0&&(
              <div>
                {/* Summary */}
                <div style={{display:"flex",gap:12,marginBottom:22,flexWrap:"wrap"}}>
                  {[
                    {l:"Games Analyzed",     v:ssMeta.gamesOk,    c:"#60a5fa"},
                    {l:"Total PP Events",    v:ssMeta.totalEvents, c:"#a78bfa"},
                    {l:"Close-Game PPs",     v:ssMeta.closeEvents, c:"#fbbf24"},
                    {l:"Close-Game Rate",    v:ssMeta.totalEvents>0?(ssMeta.closeEvents/ssMeta.totalEvents*100).toFixed(0)+"%":"—", c:"#fbbf24"},
                    {l:"Top Clutch Team",    v:clutchBar[0]?.abbr??"—",  c:"#00e5a0"},
                    {l:"Most Pressure-Prone",v:clutchBar.at(-1)?.abbr??"—", c:"#f87171"},
                  ].map((c,i)=>(
                    <div key={i} style={{background:"#0a1628",border:"1px solid #1e3050",borderRadius:10,padding:"10px 16px",flex:"1 1 110px"}}>
                      <div style={{fontSize:9,color:"#4a6fa5",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>{c.l}</div>
                      <div style={{fontSize:20,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,color:c.c}}>{c.v}</div>
                    </div>
                  ))}
                </div>

                {/* Clutch Delta Bar */}
                <div style={{background:"#0a1628",border:"1px solid #1e3050",borderRadius:12,padding:"20px 14px",marginBottom:22}}>
                  <div style={{fontSize:11,color:"#4a6fa5",marginBottom:3,letterSpacing:".08em"}}>CLUTCH DELTA — COMBINED PP+PK PERFORMANCE (CLOSE GAME − OVERALL)</div>
                  <div style={{fontSize:10,color:"#334155",marginBottom:14}}>🟢 Positive = performs better when tied / ±1 goal &nbsp;·&nbsp; 🔴 Negative = fades in tight games</div>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={clutchBar} margin={{top:0,right:10,bottom:26,left:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e3050"/>
                      <XAxis dataKey="abbr" tick={{fill:"#4a6fa5",fontSize:9}} angle={-45} textAnchor="end"/>
                      <YAxis tick={{fill:"#4a6fa5",fontSize:10}} tickFormatter={v=>v>0?"+"+v:v}/>
                      <Tooltip content={<ClutchTip/>}/>
                      <ReferenceLine y={0} stroke="#334155" strokeWidth={1.5}/>
                      <Bar dataKey="clutch" radius={[3,3,0,0]}>
                        {clutchBar.map((d,i)=>(
                          <Cell key={i} fill={d.clutch>=4?"#00e5a0":d.clutch>=0?"#4a9eff":d.clutch>=-4?"#f59e0b":"#f87171"}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* PP Delta vs PK Delta scatter */}
                <div style={{background:"#0a1628",border:"1px solid #1e3050",borderRadius:12,padding:"20px 14px",marginBottom:22}}>
                  <div style={{fontSize:11,color:"#4a6fa5",marginBottom:3,letterSpacing:".08em"}}>PP DELTA vs PK DELTA — QUADRANT VIEW</div>
                  <div style={{fontSize:10,color:"#334155",marginBottom:14}}>Top-right = elite under pressure on both ends &nbsp;·&nbsp; Bottom-left = struggles in tight games both ways</div>
                  <ResponsiveContainer width="100%" height={380}>
                    <ScatterChart margin={{top:10,right:30,bottom:30,left:20}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e3050"/>
                      <XAxis type="number" dataKey="ppDelta" name="PP Δ" domain={[-15,15]} tick={{fill:"#4a6fa5",fontSize:10}}
                        label={{value:"PP% Delta (Close − Overall)",position:"bottom",fill:"#4a6fa5",fontSize:11,offset:10}}/>
                      <YAxis type="number" dataKey="pkDelta" name="PK Δ" domain={[-15,15]} tick={{fill:"#4a6fa5",fontSize:10}}
                        label={{value:"PK% Delta",angle:-90,position:"insideLeft",fill:"#4a6fa5",fontSize:11}}/>
                      <Tooltip content={<ClutchTip/>}/>
                      <ReferenceLine x={0} stroke="#334155" strokeDasharray="5 3"/>
                      <ReferenceLine y={0} stroke="#334155" strokeDasharray="5 3"/>
                      <ReferenceArea x1={0} x2={15}  y1={0}   y2={15}  fill="#00e5a011"/>
                      <ReferenceArea x1={-15} x2={0} y1={-15} y2={0}   fill="#f8717109"/>
                      <Scatter
                        data={ssResults.filter(d=>d.ppDelta!=null&&d.pkDelta!=null)}
                        shape={({cx,cy,payload})=>{
                          const c=payload.ppDelta>=0&&payload.pkDelta>=0?"#00e5a0":payload.ppDelta<0&&payload.pkDelta<0?"#f87171":"#60a5fa";
                          return <g>
                            <circle cx={cx} cy={cy} r={8} fill={c} fillOpacity={.4} stroke={c} strokeWidth={1.5}/>
                            <text x={cx} y={cy-11} textAnchor="middle" fill={c} fontSize={9} fontWeight={700}>{payload.abbr}</text>
                          </g>;
                        }}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                {/* Full table */}
                <div style={{background:"#0a1628",border:"1px solid #1e3050",borderRadius:12,overflow:"hidden",marginBottom:20}}>
                  <div style={{padding:"14px 18px",borderBottom:"1px solid #1e3050"}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,color:"#fff"}}>True Score-State Results — All Teams</div>
                    <div style={{fontSize:10,color:"#4a6fa5",marginTop:2}}>min 3 PP or PK close-game opportunities to display · click headers to sort</div>
                  </div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <thead>
                        <tr style={{borderBottom:"1px solid #1e3050",background:"#060d1a"}}>
                          <TH col="abbr">Team</TH>
                          <TH col="ppPctCG">PP% Close</TH>
                          <TH col="ppPct">PP% All</TH>
                          <TH col="ppDelta">PP Δ</TH>
                          <TH col="pkPctCG">PK% Close</TH>
                          <TH col="pkPct">PK% All</TH>
                          <TH col="pkDelta">PK Δ</TH>
                          <TH col="ppOppCG">PP n</TH>
                          <TH col="pkOppCG">PK n</TH>
                          <TH col="clutch">Clutch</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {[...ssResults].sort((a,b)=>sortDir*(b[sortKey]-a[sortKey])).map((t,i)=>(
                          <tr key={t.abbr} className="row" style={{borderBottom:"1px solid #0f1b2d"}}>
                            <td style={{padding:"9px 10px",textAlign:"center",fontWeight:700,color:i<5?"#fbbf24":i>=ssResults.length-5?"#f87171":"#c9d8f0"}}>{t.abbr}</td>
                            <td style={{padding:"9px 8px",textAlign:"center",color:"#a78bfa",fontWeight:600}}>{t.ppPctCG!=null?t.ppPctCG.toFixed(1)+"%":"—"}</td>
                            <td style={{padding:"9px 8px",textAlign:"center",color:"#7c6db0"}}>{t.ppPct!=null?t.ppPct.toFixed(1)+"%":"—"}</td>
                            <td style={{padding:"9px 8px",textAlign:"center",fontWeight:700,color:t.ppDelta>=0?"#00e5a0":"#f87171"}}>{t.ppDelta!=null?(t.ppDelta>=0?"+":"")+t.ppDelta:"—"}</td>
                            <td style={{padding:"9px 8px",textAlign:"center",color:"#34d399",fontWeight:600}}>{t.pkPctCG!=null?t.pkPctCG.toFixed(1)+"%":"—"}</td>
                            <td style={{padding:"9px 8px",textAlign:"center",color:"#256f52"}}>{t.pkPct!=null?t.pkPct.toFixed(1)+"%":"—"}</td>
                            <td style={{padding:"9px 8px",textAlign:"center",fontWeight:700,color:t.pkDelta>=0?"#00e5a0":"#f87171"}}>{t.pkDelta!=null?(t.pkDelta>=0?"+":"")+t.pkDelta:"—"}</td>
                            <td style={{padding:"9px 8px",textAlign:"center",color:"#4a6fa5",fontSize:11}}>{t.ppOppCG}</td>
                            <td style={{padding:"9px 8px",textAlign:"center",color:"#4a6fa5",fontSize:11}}>{t.pkOppCG}</td>
                            <td style={{padding:"9px 8px",textAlign:"center",fontSize:13,fontWeight:700,
                              color:t.clutch>=4?"#00e5a0":t.clutch>=0?"#60a5fa":t.clutch>=-4?"#f59e0b":"#f87171"}}>
                              {t.clutch!=null?(t.clutch>=0?"+":"")+t.clutch:"—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <button onClick={()=>setSsPhase("idle")} className="btn" style={{border:"1px solid #1e3050",borderRadius:6,color:"#4a6fa5",fontSize:11,padding:"7px 16px"}}>← Run Again</button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            SEASON RANKINGS
        ══════════════════════════════════════════ */}
        {tab==="rankings"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:"#fff"}}>Season Aggregate Rankings</div>
                <div style={{fontSize:11,color:"#4a6fa5",marginTop:2}}>Close-Game Score = PP%×0.55 + (PK%−75)×0.90 · full-season data</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {["ALL","E","W"].map(c=>(
                  <button key={c} className="btn" onClick={()=>setConfFilt(c)}
                    style={{padding:"4px 12px",borderRadius:20,border:"1px solid #1e3050",fontSize:11,
                      background:confFilt===c?"#1e3a5f":"transparent",color:confFilt===c?"#60a5fa":"#4a6fa5"}}>
                    {c==="ALL"?"All":c==="E"?"Eastern":"Western"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{background:"#0a1628",border:"1px solid #1e3050",borderRadius:12,padding:"18px 14px",marginBottom:22}}>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={sorted} margin={{top:0,right:10,bottom:22,left:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3050"/>
                  <XAxis dataKey="abbr" tick={{fill:"#4a6fa5",fontSize:9}} angle={-45} textAnchor="end"/>
                  <YAxis tick={{fill:"#4a6fa5",fontSize:10}} domain={[18,32]} width={28}/>
                  <Tooltip content={<SeasonTip/>}/>
                  <ReferenceLine y={sorted.reduce((s,t)=>s+t.closeGameScore,0)/Math.max(sorted.length,1)} stroke="#334155" strokeDasharray="4 4"/>
                  <Bar dataKey="closeGameScore" radius={[3,3,0,0]}>
                    {sorted.map((_,i)=><Cell key={i} fill={i<5?"#00e5a0":i>=sorted.length-5?"#f87171":"#4a6fa5"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:"#0a1628",border:"1px solid #1e3050",borderRadius:12,overflow:"hidden"}}>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid #1e3050",background:"#060d1a"}}>
                      <th style={{padding:"11px 14px",textAlign:"left",color:"#4a6fa5",fontSize:10,letterSpacing:".08em"}}>RK</th>
                      <TH col="name">Team</TH>
                      <TH col="closeGameScore">CG Score</TH>
                      <TH col="pp">PP%</TH>
                      <TH col="pk">PK%</TH>
                      <TH col="ppGoals">PP G</TH>
                      <TH col="pkGA">PK GA</TH>
                      <TH col="winPct">Win%</TH>
                      <th style={{padding:"11px 14px",textAlign:"center",color:"#4a6fa5",fontSize:10}}>Profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((t,i)=>{
                      const q=getQuad(t.pp,t.pk);
                      return (
                        <tr key={t.name} className="row" style={{borderBottom:"1px solid #0f1b2d"}}>
                          <td style={{padding:"9px 14px",color:i<5?"#fbbf24":i>=sorted.length-5?"#f87171":"#4a6fa5",fontWeight:700,fontSize:13}}>{i+1}</td>
                          <td style={{padding:"9px 10px"}}>
                            <div style={{fontWeight:500,color:"#e2e8f0",whiteSpace:"nowrap"}}>{t.name}</div>
                            <div style={{fontSize:9,color:t.conf==="E"?"#60a5fa":"#f97316",marginTop:1}}>{t.conf==="E"?"EASTERN":"WESTERN"}</div>
                          </td>
                          <td style={{padding:"9px 8px",textAlign:"center",color:"#fbbf24",fontWeight:700}}>{t.closeGameScore}</td>
                          <td style={{padding:"9px 8px",textAlign:"center",color:t.pp>=lgPP2?"#a78bfa":"#6b7280"}}>{t.pp.toFixed(1)}%</td>
                          <td style={{padding:"9px 8px",textAlign:"center",color:t.pk>=lgPK2?"#34d399":"#6b7280"}}>{t.pk.toFixed(1)}%</td>
                          <td style={{padding:"9px 8px",textAlign:"center",color:"#c9d8f0"}}>{t.ppGoals}</td>
                          <td style={{padding:"9px 8px",textAlign:"center",color:"#c9d8f0"}}>{t.pkGA}</td>
                          <td style={{padding:"9px 8px",textAlign:"center",color:"#c9d8f0"}}>{(t.winPct*100).toFixed(0)}%</td>
                          <td style={{padding:"9px 14px",textAlign:"center"}}>
                            <span className="badge" style={{background:q.color+"22",color:q.color,border:`1px solid ${q.color}55`}}>{q.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            PP vs PK MATRIX
        ══════════════════════════════════════════ */}
        {tab==="scatter"&&(
          <div>
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:"#fff"}}>PP% vs PK% — The Special Teams Matrix</div>
              <div style={{fontSize:11,color:"#4a6fa5",marginTop:2}}>Four quadrants reveal season-aggregate team profiles. League averages divide the field.</div>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
              {[{l:"Elite",c:"#00e5a0",d:"Above avg both"},{l:"PP Specialist",c:"#f59e0b",d:"High PP, weaker PK"},{l:"PK Specialist",c:"#60a5fa",d:"High PK, weaker PP"},{l:"Struggling",c:"#f87171",d:"Below avg both"}].map(q=>(
                <div key={q.l} style={{display:"flex",alignItems:"center",gap:8,background:"#0a1628",border:`1px solid ${q.c}44`,borderRadius:8,padding:"7px 12px"}}>
                  <div style={{width:9,height:9,borderRadius:2,background:q.c}}/>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:q.c}}>{q.l}</div>
                    <div style={{fontSize:10,color:"#4a6fa5"}}>{q.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"#0a1628",border:"1px solid #1e3050",borderRadius:12,padding:"22px 14px"}}>
              <ResponsiveContainer width="100%" height={480}>
                <ScatterChart margin={{top:10,right:40,bottom:30,left:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3050"/>
                  <XAxis type="number" dataKey="pp" domain={[16,30]} tick={{fill:"#4a6fa5",fontSize:10}}
                    label={{value:"Power Play %",position:"bottom",fill:"#4a6fa5",fontSize:11,offset:10}}/>
                  <YAxis type="number" dataKey="pk" domain={[74,87]} tick={{fill:"#4a6fa5",fontSize:10}}
                    label={{value:"Penalty Kill %",angle:-90,position:"insideLeft",fill:"#4a6fa5",fontSize:11,offset:10}}/>
                  <Tooltip content={<SeasonTip/>}/>
                  <ReferenceLine x={lgPP2} stroke="#334155" strokeDasharray="6 3" label={{value:`avg ${lgPP2}%`,fill:"#4a6fa5",fontSize:9}}/>
                  <ReferenceLine y={lgPK2} stroke="#334155" strokeDasharray="6 3" label={{value:`avg ${lgPK2}%`,fill:"#4a6fa5",fontSize:9,position:"right"}}/>
                  <ReferenceArea x1={lgPP2} x2={30}  y1={lgPK2} y2={87}  fill="#00e5a011"/>
                  <ReferenceArea x1={16}   x2={lgPP2} y1={lgPK2} y2={87}  fill="#60a5fa09"/>
                  <ReferenceArea x1={lgPP2} x2={30}  y1={74}    y2={lgPK2} fill="#f59e0b09"/>
                  <ReferenceArea x1={16}   x2={lgPP2} y1={74}    y2={lgPK2} fill="#f8717109"/>
                  <Scatter data={baseTeams}
                    shape={({cx,cy,payload})=>{
                      const q=getQuad(payload.pp,payload.pk);
                      return <g>
                        <circle cx={cx} cy={cy} r={8} fill={q.color} fillOpacity={.35} stroke={q.color} strokeWidth={1.5}/>
                        <text x={cx} y={cy-11} textAnchor="middle" fill={q.color} fontSize={9} fontWeight={700}>{payload.abbr}</text>
                      </g>;
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            PREDICTIVE MODEL
        ══════════════════════════════════════════ */}
        {tab==="model"&&(
          <div>
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:"#fff"}}>Predictive Model — Special Teams → Wins</div>
              <div style={{fontSize:11,color:"#4a6fa5",marginTop:2}}>OLS regression: how much of team winning does close-game special teams efficiency explain?</div>
            </div>
            <div style={{display:"flex",gap:14,marginBottom:20,flexWrap:"wrap"}}>
              {[
                {l:"R² (Explanatory Power)",v:(reg.r2*100).toFixed(1)+"%",c:"#a78bfa",d:"Variance in wins explained"},
                {l:"Regression Slope",      v:reg.m.toFixed(4),           c:"#fbbf24",d:"Win% change per CG Score pt"},
                {l:"Intercept",            v:reg.b.toFixed(4),            c:"#60a5fa",d:"Baseline win% at zero"},
              ].map(s=>(
                <div key={s.l} style={{background:"#0a1628",border:"1px solid #1e3050",borderRadius:10,padding:"14px 18px",flex:"1 1 180px"}}>
                  <div style={{fontSize:10,color:"#4a6fa5",letterSpacing:".08em",marginBottom:3}}>{s.l}</div>
                  <div style={{fontSize:24,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:10,color:"#4a6fa5",marginTop:2}}>{s.d}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#0a1628",border:"1px solid #1e3050",borderRadius:12,padding:"22px 14px",marginBottom:22}}>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{top:10,right:20,bottom:30,left:20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3050"/>
                  <XAxis type="number" dataKey="closeGameScore" domain={[18,34]} tick={{fill:"#4a6fa5",fontSize:10}}
                    label={{value:"Close-Game Score",position:"bottom",fill:"#4a6fa5",fontSize:11,offset:10}}/>
                  <YAxis type="number" dataKey="winPct" domain={[0.25,0.85]} tickFormatter={v=>(v*100).toFixed(0)+"%"} tick={{fill:"#4a6fa5",fontSize:10}}
                    label={{value:"Win %",angle:-90,position:"insideLeft",fill:"#4a6fa5",fontSize:11}}/>
                  <Tooltip content={<ModelTip/>}/>
                  <Scatter data={modelData}
                    shape={({cx,cy,payload})=>{
                      const q=getQuad(payload.pp,payload.pk);
                      return <g>
                        <circle cx={cx} cy={cy} r={7} fill={q.color} fillOpacity={.45} stroke={q.color} strokeWidth={1}/>
                        <text x={cx} y={cy-10} textAnchor="middle" fill="#c9d8f0" fontSize={8}>{payload.abbr}</text>
                      </g>;
                    }}
                  />
                  <Scatter data={[{closeGameScore:18,winPct:reg.m*18+reg.b},{closeGameScore:34,winPct:reg.m*34+reg.b}]}
                    line={{stroke:"#f97316",strokeWidth:2,strokeDasharray:"6 3"}} shape={()=>null}/>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {[
                {title:"🔺 Overperforming",  key:"over",  color:"#00e5a0",desc:"Winning more than special teams predict"},
                {title:"🔻 Underperforming", key:"under", color:"#f87171",desc:"Winning less than special teams predict"},
              ].map(g=>{
                const list=[...modelData].sort((a,b)=>g.key==="over"
                  ?(b.winPct-b.projWinPct)-(a.winPct-a.projWinPct)
                  :(a.winPct-a.projWinPct)-(b.winPct-b.projWinPct)).slice(0,6);
                return (
                  <div key={g.key} style={{background:"#0a1628",border:`1px solid ${g.color}33`,borderRadius:12,padding:16}}>
                    <div style={{color:g.color,fontWeight:700,fontSize:12,marginBottom:2}}>{g.title}</div>
                    <div style={{fontSize:10,color:"#4a6fa5",marginBottom:12}}>{g.desc}</div>
                    {list.map(t=>{
                      const d=((t.winPct-t.projWinPct)*100).toFixed(1);
                      return (
                        <div key={t.abbr} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #0f1b2d",fontSize:12}}>
                          <span style={{color:"#e2e8f0"}}><b style={{color:g.color}}>{t.abbr}</b> {t.name.split(" ").slice(-1)[0]}</span>
                          <span style={{color:g.color,fontWeight:700}}>{d>0?"+":""}{d}%</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
