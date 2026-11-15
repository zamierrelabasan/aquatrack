const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const DEV="Zam";/* change to your name */
const mem={};
const L=k=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):(mem[k]||null)}catch(e){return mem[k]||null}};
const S=(k,v)=>{mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const p2=n=>String(n).padStart(2,"0"),dk=d=>d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate());
const fmt=n=>n.toLocaleString("en-US")+" ml";
const tf=ts=>new Date(ts).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
const MSG=["Keep yourself hydrated. Your body will thank you!","Small sips add up to a big day.","A glass now keeps the headache away.","Your future self wants you to drink up.","Water first, everything else second.","You’re doing great. Take another sip!"];
let users=L("aq_users")||{},me=L("aq_sess"),D=null,tab="home",sel=250,hd=dk(new Date()),authMode="login",err="",welcomed=false,onboard=false,ca=0,cb=1,msgI=Math.floor(Math.random()*MSG.length);
const defData=()=>({goal:2000,intakes:[],dark:null,rem:{on:false,interval:60,start:"08:00",end:"21:00",msg:"",last:0}});
function load(){D=me?L("aq_d_"+me):null;if(D)applyTheme()}
const save=()=>S("aq_d_"+me,D),cur=()=>users[me];
function applyTheme(){const r=document.documentElement;if(D&&D.dark!==null)r.setAttribute("data-theme",D.dark?"dark":"light");else r.removeAttribute("data-theme")}
function toast(t){const e=$("#toast");e.textContent=t;e.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display="none",2600)}
async function hash(s){try{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}catch(e){return btoa(unescape(encodeURIComponent(s)))}}
const dayTotals=()=>{const m={};D.intakes.forEach(i=>{const k=dk(new Date(i.ts));m[k]=(m[k]||0)+i.ml});return m};
const todayTotal=()=>dayTotals()[dk(new Date())]||0;

function drop(p,size){const y=114-108*Math.min(p,1),h=108*Math.min(p,1)+2;
return `<svg viewBox="0 0 100 120" width="${size}" height="${size*1.2}" role="img" aria-label="${Math.round(p*100)}% of goal"><defs><clipPath id="c"><path d="M50 6C50 6 12 48 12 76a38 38 0 0 0 76 0C88 48 50 6 50 6Z"/></clipPath></defs><path d="M50 6C50 6 12 48 12 76a38 38 0 0 0 76 0C88 48 50 6 50 6Z" fill="var(--blue2)" stroke="var(--blue)" stroke-width="3"/><g clip-path="url(#c)"><rect id="fill" x="0" y="${y}" width="100" height="${h}" fill="var(--blue)"/></g><circle cx="38" cy="78" r="4" fill="var(--face)"/><circle cx="62" cy="78" r="4" fill="var(--face)"/><path d="M41 90Q50 99 59 90" fill="none" stroke="var(--face)" stroke-width="3.5" stroke-linecap="round"/><circle cx="31" cy="88" r="4" fill="#f4a9a8" opacity=".7"/><circle cx="69" cy="88" r="4" fill="#f4a9a8" opacity=".7"/></svg>`}

function render(){
 if(!me||!cur()){return renderAuth()}
 if(!D){D=defData();save()}
 if(onboard)return renderGoal();
 const nav=[["home","💧","Home"],["history","🕘","History"],["stats","📊","Stats"],["reminders","🔔","Reminders"],["settings","⚙️","Settings"]];
 $("#app").innerHTML=`<main id="v">${views[tab]()}</main><nav aria-label="Main">${nav.map(n=>`<button class="${tab==n[0]?"on":""}" onclick="go('${n[0]}')" ${tab==n[0]?'aria-current="page"':""}><span>${n[1]}</span>${n[2]}</button>`).join("")}</nav>`;
}
const go=t=>{tab=t;render();scrollTo(0,0)};

function renderAuth(){
 if(!welcomed)return renderWelcome();
 const reg=authMode=="register";
 $("#app").innerHTML=`<div class="auth">${logo(84)}<h1 class="big">AquaTrack</h1><p class="mute">Your personal water intake tracker</p>
 <div class="card box"><h2>${reg?"Create account":"Welcome back"}</h2><div class="err" role="alert">${esc(err)}</div>
 ${reg?`<label for="u">Username</label><input id="u" autocomplete="username">`:""}
 <label for="e">Email address</label><input id="e" type="email" autocomplete="email">
 <label for="p">Password</label><input id="p" type="password" autocomplete="${reg?"new-password":"current-password"}">
 ${reg?`<label for="p2">Confirm password</label><input id="p2" type="password" autocomplete="new-password">`:""}
 <button class="btn" onclick="submitAuth()">${reg?"Sign up":"Log in"}</button>
 <p class="mute" style="text-align:center">${reg?"Already have an account?":"New here?"} <a href="#" onclick="event.preventDefault();authMode='${reg?"login":"register"}';err='';renderAuth()" style="color:var(--ink);font-weight:700">${reg?"Log in":"Sign up"}</a></p></div></div>`;
}
async function submitAuth(){
 const v=id=>($("#"+id)||{value:""}).value.trim(),e=v("e").toLowerCase(),pw=$("#p").value;
 if(authMode=="register"){const u=v("u"),p2v=$("#p2").value;
  if(!u)return fail("Enter a username.");
  if(!/^\S+@\S+\.\S+$/.test(e))return fail("Enter a valid email address.");
  if(pw.length<6)return fail("Use a password with at least 6 characters.");
  if(pw!==p2v)return fail("Passwords don’t match.");
  if(users[e])return fail("That email already has an account. Log in instead.");
  users[e]={username:u,hash:await hash(pw)};S("aq_users",users);me=e;S("aq_sess",me);D=defData();save();onboard=true;
 }else{
  if(!users[e]||users[e].hash!==await hash(pw))return fail("Email or password is incorrect.");
  me=e;S("aq_sess",me);load();
 }
 err="";tab="home";render();startTimer();
}
function logo(n){return `<svg viewBox="0 0 512 512" width="${n}" height="${n}" role="img" aria-label="AquaTrack logo"><rect width="512" height="512" rx="112" fill="var(--icon-bg)"/><path d="M256 80C256 80 156 235 156 300a100 100 0 0 0 200 0C356 235 256 80 256 80Z" fill="#fff"/><circle cx="220" cy="310" r="10" fill="#23425c"/><circle cx="292" cy="310" r="10" fill="#23425c"/><path d="M228 338Q256 364 284 338" fill="none" stroke="#23425c" stroke-width="9" stroke-linecap="round"/><circle cx="198" cy="338" r="11" fill="#f4a9a8" opacity=".7"/><circle cx="314" cy="338" r="11" fill="#f4a9a8" opacity=".7"/></svg>`}
function renderWelcome(){$("#app").innerHTML=`<div class="auth" style="padding-top:12vh">${logo(120)}<h1 class="big" style="margin-top:16px">AquaTrack</h1><p class="mute">Your personal water intake tracker.<br>Hydration · Daily goals · Reminders · Progress</p><button class="btn" style="margin-top:24px" onclick="welcomed=true;renderAuth()">Get started</button></div>`}
function renderGoal(){const g=D.goal;$("#app").innerHTML=`<div class="auth">${logo(72)}<h1 class="big">Set your daily goal</h1><p class="mute">How much water do you want to drink each day?</p><div class="card box"><div class="chips" style="grid-template-columns:repeat(2,1fr)">${[1500,2000,2500,3000].map(n=>`<button class="chip ${g==n?"on":""}" onclick="D.goal=${n};renderGoal()">${fmt(n)}</button>`).join("")}</div><label for="og">Or enter your own (ml)</label><input id="og" type="number" inputmode="numeric" min="500" max="6000" value="${g}"><button class="btn" onclick="finishGoal()">Continue</button></div></div>`}
function finishGoal(){const v=parseInt($("#og").value);if(!(v>=500&&v<=6000))return toast("Choose a goal between 500 and 6,000 ml.");D.goal=v;save();onboard=false;tab="home";render()}
function recent(){const m=dayTotals(),ks=Object.keys(m).sort().reverse().slice(0,10);return ks.length?`<h3 style="margin:6px 0 10px">Recent days</h3><div class="card">${ks.map(k=>`<div class="ent" style="cursor:pointer" onclick="hd='${k}';render();scrollTo(0,0)"><span>${new Date(k+"T00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span><b>${fmt(m[k])}</b><span>${m[k]>=D.goal?"✅":""}</span></div>`).join("")}</div>`:""}
async function savePw(){const o=$("#op").value,n=$("#np").value;if(users[me].hash!==await hash(o))return toast("Current password is incorrect.");if(n.length<6)return toast("Use at least 6 characters.");users[me].hash=await hash(n);S("aq_users",users);toast("Password changed");render()}
function fail(m){err=m;renderAuth()}

const views={
home(){
 const h=new Date().getHours(),g=h<12?"Good morning":h<18?"Good afternoon":"Good evening",t=todayTotal(),goal=D.goal,p=t/goal,rem=Math.max(goal-t,0);
 return `<h1 class="big">${g}, ${esc(cur().username)}!</h1><p class="mute">${MSG[msgI]}</p>
 <div class="card" style="text-align:center">${drop(p,150)}
 <div class="f big">${fmt(t)}</div><div class="mute">of ${fmt(goal)} · ${Math.round(p*100)}%</div>
 <p style="font-weight:700;color:${rem?"var(--ink)":"var(--sage)"}">${rem?`${fmt(rem)} to go`:"🎉 Goal reached! Great job staying hydrated today."}</p></div>
 <div class="card"><h3>Add water</h3><div class="chips">${[100,200,250,500].map(n=>`<button class="chip ${sel==n?"on":""}" onclick="pick(${n})">+${n}</button>`).join("")}</div>
 <label for="cu">Custom amount (ml)</label><input id="cu" type="number" inputmode="numeric" min="1" max="3000" placeholder="e.g. 350" oninput="pickC(this.value)">
 <button class="btn" onclick="addWater()">Add ${fmt(sel||0)}</button></div>`},
history(){
 const d=new Date(hd+"T00:00"),list=D.intakes.filter(i=>dk(new Date(i.ts))==hd).sort((a,b)=>a.ts-b.ts),tot=list.reduce((s,i)=>s+i.ml,0),isT=hd==dk(new Date());
 return `<h1 class="big">History</h1><div class="row" style="margin:12px 0"><button class="btn ghost" style="flex:0 0 52px" onclick="shift(-1)" aria-label="Previous day">‹</button><div class="f" style="text-align:center">${isT?"Today":d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</div><button class="btn ghost" style="flex:0 0 52px" onclick="shift(1)" ${isT?"disabled":""} aria-label="Next day">›</button></div>
 <div class="card">${list.length?list.map(i=>`<div class="ent"><span>${tf(i.ts)}</span><b>${fmt(i.ml)}</b><button class="x" onclick="del('${i.id}')" aria-label="Delete entry">🗑</button></div>`).join("")+`<div class="ent"><b>Total</b><b>${fmt(tot)}</b><span></span></div>`:`<p class="mute">No water logged this day. Head to Home to add a drink.</p>`}</div>${recent()}`},
stats(){
 const m=dayTotals(),goal=D.goal,now=new Date(),days=[...Array(7)].map((_,i)=>{const d=new Date(now);d.setDate(d.getDate()-6+i);return{d,v:m[dk(d)]||0}});
 const prev=[...Array(7)].map((_,i)=>{const d=new Date(now);d.setDate(d.getDate()-13+i);return m[dk(d)]||0});
 const sw=days.reduce((s,x)=>s+x.v,0)/7,sp=prev.reduce((s,x)=>s+x,0)/7,keys=Object.keys(m),reached=keys.filter(k=>m[k]>=goal).length,best=keys.sort((a,b)=>m[b]-m[a])[0];
 const avg=keys.length?Math.round(keys.reduce((s,k)=>s+m[k],0)/keys.length):0,mx=Math.max(goal,...days.map(x=>x.v));
 const bars=days.map((x,i)=>{const h=Math.round(x.v/mx*110);return `<rect x="${i*44+8}" y="${120-h}" width="28" height="${h}" rx="8" fill="${x.v>=goal?"var(--sage)":"var(--blue)"}"/><text x="${i*44+22}" y="136" text-anchor="middle" font-size="11" fill="var(--mute)">${x.d.toLocaleDateString("en-US",{weekday:"narrow"})}</text>`}).join("");
 const gy=120-Math.round(goal/mx*110),dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
 const cells=[...Array(dim)].map((_,i)=>{const v=m[dk(new Date(now.getFullYear(),now.getMonth(),i+1))]||0,r=Math.min(v/goal,1);return `<div class="cell" style="background:${v>=goal?"var(--sage)":`color-mix(in srgb,var(--blue) ${Math.round(r*100)}%,var(--blue2))`};color:${r>.5?"#0f2438":"var(--mute)"}">${i+1}</div>`}).join("");
 const dv=o=>{const d=new Date(now);d.setDate(d.getDate()-o);return m[dk(d)]||0},dl=o=>o==0?"Today":o==1?"Yesterday":new Date(now.getFullYear(),now.getMonth(),now.getDate()-o).toLocaleDateString("en-US",{month:"short",day:"numeric"}),opts=x=>[...Array(14)].map((_,o)=>`<option value="${o}" ${o==x?"selected":""}>${dl(o)}</option>`).join(""),va=dv(ca),vb=dv(cb),cm=Math.max(va,vb,1),cd=va-vb;
 const mt=Object.keys(m).filter(k=>k.startsWith(now.getFullYear()+"-"+p2(now.getMonth()+1))).reduce((t,k)=>t+m[k],0);
 const diff=sp?Math.round((sw-sp)/sp*100):null;
 return `<h1 class="big">Stats</h1>
 <div class="card"><h3>Last 7 days</h3><svg viewBox="0 0 316 142" width="100%" role="img" aria-label="Weekly water intake chart"><line x1="0" x2="316" y1="${gy}" y2="${gy}" stroke="var(--mute)" stroke-dasharray="4 4"/>${bars}</svg>
 <p class="mute">${diff===null?"Log a few days to see how this week compares.":`This week’s daily average is ${Math.abs(diff)}% ${diff>=0?"higher":"lower"} than last week.`} Dashed line is your goal.</p></div>
 <div class="stat"><div class="card"><span class="mute">Today</span><b>${fmt(todayTotal())}</b></div><div class="card"><span class="mute">Daily average</span><b>${fmt(avg)}</b></div>
 <div class="card"><span class="mute">Goal reached</span><b>${reached} ${reached==1?"day":"days"}</b></div><div class="card"><span class="mute">Completion</span><b>${keys.length?Math.round(reached/keys.length*100):0}%</b></div></div>
 <div class="card" style="margin-top:14px"><span class="mute">Best day</span><b class="f" style="display:block;font-size:20px">${best?`${fmt(m[best])} on ${new Date(best+"T00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}`:"Nothing logged yet"}</b></div>
 <div class="card"><h3>Compare days</h3><div class="row" style="margin-top:8px"><select id="cmpA" onchange="ca=+this.value;render()" aria-label="First day">${opts(ca)}</select><select id="cmpB" onchange="cb=+this.value;render()" aria-label="Second day">${opts(cb)}</select></div>${[[ca,va],[cb,vb]].map(x=>`<div class="mute">${dl(x[0])} · ${fmt(x[1])}</div><div style="background:var(--blue2);border-radius:8px;height:14px;margin:4px 0 10px"><div style="width:${x[1]/cm*100}%;background:var(--blue);height:100%;border-radius:8px"></div></div>`).join("")}<p class="mute">${cd==0?"Same amount on both days.":`${dl(ca)} was ${fmt(Math.abs(cd))} ${cd>0?"more":"less"} than ${dl(cb)}.`}</p></div>
 <div class="card"><h3>${now.toLocaleDateString("en-US",{month:"long"})}</h3><p class="mute" style="margin:2px 0 10px">Total ${fmt(mt)} · ${fmt(Math.round(mt/now.getDate()))} per day so far</p><div class="grid">${cells}</div><p class="mute">Green days hit your goal.</p></div>`},
reminders(){
 const r=D.rem,perm="Notification" in window?Notification.permission:"unsupported";
 return `<h1 class="big">Reminders</h1><div class="card"><div class="sw"><b>Hydration reminders</b><input type="checkbox" ${r.on?"checked":""} onchange="remSet('on',this.checked)" aria-label="Reminders on"></div></div>
 <div class="card"><label for="iv">Remind me every</label><select id="iv" onchange="remSet('interval',+this.value)">${[30,45,60,90,120].map(n=>`<option value="${n}" ${r.interval==n?"selected":""}>${n} minutes</option>`).join("")}</select>
 <div class="row"><div><label for="st">Start</label><input id="st" type="time" value="${r.start}" onchange="remSet('start',this.value)"></div><div><label for="en">End</label><input id="en" type="time" value="${r.end}" onchange="remSet('end',this.value)"></div></div>
 <label for="ms">Reminder message (optional)</label><textarea id="ms" rows="2" placeholder="Time to hydrate! Don’t forget a glass of water." onchange="remSet('msg',this.value)">${esc(r.msg)}</textarea><label for="mm">Missed-routine message (optional)</label><textarea id="mm" rows="2" placeholder="You forgot to drink water. Take a little break!" onchange="remSet('missed',this.value)">${esc(r.missed||"")}</textarea></div>
 <div class="card"><p class="mute" style="margin-top:0">Notifications: <b>${perm=="granted"?"allowed":perm=="denied"?"blocked in browser settings":perm=="unsupported"?"not supported here":"not allowed yet"}</b>. Reminders fire while AquaTrack is open or installed and running. Android 13+ asks for permission first.</p>
 <div class="row"><button class="btn sage" onclick="askPerm()">Allow notifications</button><button class="btn ghost" onclick="notify(true)">Send test</button></div></div>`},
settings(){
 const u=cur();
 return `<h1 class="big">Settings</h1>
 <div class="card"><h3>Profile</h3><p class="mute">${esc(me)}</p><label for="un">Username</label><input id="un" value="${esc(u.username)}"><button class="btn" onclick="saveName()">Save username</button></div>
 <div class="card"><label for="gl">Daily goal (ml)</label><input id="gl" type="number" inputmode="numeric" min="500" max="6000" step="50" value="${D.goal}"><button class="btn" onclick="saveGoal()">Save goal</button></div>
 <div class="card"><div class="sw"><b>Dark mode</b><input type="checkbox" ${document.documentElement.matches('[data-theme="dark"]')||(D.dark===null&&matchMedia("(prefers-color-scheme:dark)").matches)?"checked":""} onchange="D.dark=this.checked;save();applyTheme();render()" aria-label="Dark mode"></div>
 <div class="sw"><b>Reminders</b><a href="#" onclick="event.preventDefault();go('reminders')" style="color:var(--ink)">${D.rem.on?"On":"Off"} · change</a></div></div>
 <div class="card"><h3>Account</h3><label for="op">Current password</label><input id="op" type="password" autocomplete="current-password"><label for="np">New password</label><input id="np" type="password" autocomplete="new-password"><button class="btn" onclick="savePw()">Change password</button></div>
 <div class="card"><h3>About AquaTrack</h3><p class="mute">A soft, simple way to build a daily hydration habit. Your data is stored on this device.<br>Version 1.0.0<br>Developer: ${esc(DEV)}</p></div>
 <button class="btn ghost" onclick="logout()">Log out</button>`}
};
function pick(n){sel=n;render()}
function pickC(v){sel=Math.max(0,Math.min(3000,parseInt(v)||0));const b=document.querySelector(".btn:last-child");document.querySelectorAll(".chip").forEach(c=>c.classList.remove("on"));if(b)b.textContent="Add "+fmt(sel)}
function addWater(){if(!sel)return toast("Enter an amount first.");const before=todayTotal();D.intakes.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),ml:sel,ts:Date.now()});save();msgI=(msgI+1)%MSG.length;render();toast(before<D.goal&&todayTotal()>=D.goal?"🎉 Daily goal reached!":"Added "+fmt(sel))}
function shift(n){const d=new Date(hd+"T00:00");d.setDate(d.getDate()+n);if(d<=new Date()){hd=dk(d);render()}}
function del(id){D.intakes=D.intakes.filter(i=>i.id!=id);save();render();toast("Entry deleted")}
function saveName(){const v=$("#un").value.trim();if(!v)return toast("Username can’t be empty.");users[me].username=v;S("aq_users",users);toast("Username saved");render()}
function saveGoal(){const v=parseInt($("#gl").value);if(!(v>=500&&v<=6000))return toast("Choose a goal between 500 and 6,000 ml.");D.goal=v;save();toast("Goal saved");render()}
function logout(){me=null;D=null;S("aq_sess",null);document.documentElement.removeAttribute("data-theme");clearInterval(timer);authMode="login";render()}
function remSet(k,v){D.rem[k]=v;save();if(k=="on"&&v)askPerm(true)}
async function askPerm(quiet){if(!("Notification" in window))return toast("Notifications aren’t supported here. In-app alerts will be used.");try{const r=await Notification.requestPermission();if(!quiet||r!="granted")toast(r=="granted"?"Notifications allowed":"Notifications not allowed");render()}catch(e){}}
function notify(kind){
 const r=D.rem,title="Hey "+cur().username+"! 💧";
 const body=kind=="missed"?(r.missed||"You forgot to drink water. Take a little break and stay hydrated!"):(r.msg||"Time to hydrate! Don’t forget to drink a glass of water today.");
 const show=async()=>{try{if(!("Notification" in window)||Notification.permission!="granted")return false;const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(reg){await reg.showNotification(title,{body,icon:"assets/icon-192.png",badge:"assets/icon-192.png",tag:"aquatrack"});return true}new Notification(title,{body,icon:"assets/icon-192.png"});return true}catch(e){return false}};
 show().then(ok=>{if(!ok)toast(title+" "+body)})}
let timer;
function tick(){if(!D||!D.rem.on)return;const r=D.rem,n=new Date(),m=n.getHours()*60+n.getMinutes(),f=x=>{const a=x.split(":");return +a[0]*60+ +a[1]};
 if(m<f(r.start)||m>f(r.end))return;
 if(!r.last){r.last=Date.now();save();return}
 if(Date.now()-r.last>=r.interval*60000){const last=D.intakes.reduce((x,i)=>Math.max(x,i.ts),0);r.last=Date.now();save();notify(Date.now()-last>=r.interval*120000?"missed":"remind")}}
function startTimer(){clearInterval(timer);timer=setInterval(tick,30000)}
document.addEventListener("visibilitychange",()=>{if(!document.hidden)tick()});
(function init(){if(me&&!users[me])me=null;load();render();if(me)startTimer();
 if("serviceWorker" in navigator&&location.protocol.startsWith("http")){navigator.serviceWorker.register("service-worker.js").catch(()=>{})}})();
