const $=s=>document.querySelector(s),pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()),pd=s=>new Date(s+"T00:00:00"),addD=(d,n)=>{const r=new Date(d);r.setDate(r.getDate()+n);return r};
const BL=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const FL=["Tidak ada","Ringan","Sedang","Deras"],MD=["Senang","Biasa","Sedih"],SY=["Kram","Pusing","Lelah","Nyeri punggung","Mual"];
const NAMES={beranda:"Beranda",catat:"Catat harian",riwayat:"Riwayat siklus",artikel:"Artikel kesehatan",pengingat:"Pengingat",akun:"Profil"};
let S={},undo=null,tt;const KEY="lunara_v1";
try{S=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){S={}}
S.logs=S.logs||{};S.rem=S.rem||[{t:"Minum vitamin",w:"08:00"}];
S.p=S.p||{name:"",cycle:28,period:5,last:iso(addD(new Date(),-9))};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const today=new Date();today.setHours(0,0,0,0);let vm=new Date(today.getFullYear(),today.getMonth(),1);
const ART=[
["Meredakan nyeri haid","Kompres hangat di perut bawah, istirahat cukup, dan peregangan ringan sering membantu meredakan kram. Jika nyeri sangat mengganggu aktivitas atau makin parah dari bulan ke bulan, konsultasikan ke dokter.",["#F6C6D6","#B83A66"]],
["Mengenal fase siklus","Siklus dihitung dari hari pertama haid sampai sehari sebelum haid berikutnya. Ovulasi biasanya terjadi sekitar 14 hari sebelum haid berikutnya, dan masa subur berada di sekitar hari itu. Panjang siklus tiap orang berbeda.",["#E6DDF5","#6A4C93"]],
["Zat besi saat haid","Darah yang keluar saat haid dapat menurunkan cadangan zat besi. Makanan seperti daging merah, hati, bayam, dan kacang-kacangan membantu. Jika sering lemas atau pucat, periksakan diri ke tenaga kesehatan.",["#FFE3D3","#C0562D"]],
["Tidur dan hormon","Tidur cukup membantu tubuh mengatur hormon dan suasana hati. Usahakan jam tidur yang konsisten, terutama pada hari-hari menjelang haid ketika tubuh mudah lelah.",["#D9ECF5","#2F6F94"]],
["Mengelola suasana hati","Perubahan suasana hati menjelang haid cukup umum. Mencatatnya di kalender membantu Anda mengenali polanya, sehingga bisa mengatur kegiatan dan waktu istirahat.",["#E2F2DE","#3B7D3A"]],
["Kapan perlu ke dokter","Segera periksakan diri bila haid terlambat sangat lama tanpa sebab jelas, perdarahan sangat deras, nyeri hebat, atau siklus berubah drastis. Riwayat dari Lunara dapat dibawa sebagai bahan konsultasi.",["#F3DCE6","#8A2A52"]]];
const art=(i,w)=>{const[c,d]=ART[i][2];return `<svg viewBox="0 0 200 120" role="img" aria-label="Ilustrasi ${ART[i][0]}"><rect width="200" height="120" fill="${c}"/><circle cx="${60+i*12}" cy="60" r="38" fill="${d}" opacity=".85"/><circle cx="${86+i*12}" cy="52" r="34" fill="${c}"/><circle cx="150" cy="34" r="6" fill="${d}"/><circle cx="168" cy="88" r="10" fill="${d}" opacity=".5"/></svg>`};
function phase(d){const c=+S.p.cycle,L=S.logs[iso(d)];if(L&&L.flow&&L.flow!=="Tidak ada")return"M";const day=(((Math.round((d-pd(S.p.last))/864e5))%c)+c)%c;if(day<+S.p.period)return"M";const o=c-14;return day===o?"O":(day>=o-5&&day<=o+1?"S":"")}
function cdy(d){const c=+S.p.cycle;return(((Math.round((d-pd(S.p.last))/864e5))%c)+c)%c}
function toast(m,u){const t=$("#toast");t.innerHTML=m;if(u){const b=document.createElement("button");b.textContent="Urungkan";b.onclick=()=>{u();t.style.display="none"};t.appendChild(b)}t.style.display="block";clearTimeout(tt);tt=setTimeout(()=>t.style.display="none",4500)}
function fill(id,arr){$(id).innerHTML=arr.map(x=>`<option>${x}</option>`).join("")}
function go(v){location.hash=v}
function route(){const v=(location.hash||"#beranda").slice(1);const k=NAMES[v]?v:"beranda";document.querySelectorAll(".view").forEach(e=>e.classList.toggle("on",e.id==="v-"+k));document.querySelectorAll("[data-n]").forEach(a=>a.classList.toggle("on",a.dataset.n===k));$("#crumb").textContent=k==="beranda"?"Beranda > Kalender bulanan":"Beranda > "+NAMES[k];
if(k==="beranda")home();if(k==="catat")openCatat($("#cd").value||iso(today));if(k==="riwayat")hist();if(k==="artikel")arts();if(k==="pengingat")rems();if(k==="akun")prof();window.scrollTo(0,0)}
function home(){$("#mt").textContent=BL[vm.getMonth()]+" "+vm.getFullYear();let h="";["Sn","Sl","Rb","Km","Jm","Sb","Mg"].forEach(x=>h+=`<b>${x}</b>`);const off=(vm.getDay()+6)%7,n=new Date(vm.getFullYear(),vm.getMonth()+1,0).getDate();for(let i=0;i<off;i++)h+='<div class="d x"></div>';
for(let i=1;i<=n;i++){const d=new Date(vm.getFullYear(),vm.getMonth(),i),p=phase(d),k=iso(d);h+=`<button class="d ${p} ${+d===+today?"t":""} ${S.logs[k]?"l":""}" onclick="pick('${k}')" aria-label="${i} ${BL[vm.getMonth()]}${p?", fase "+{M:"menstruasi",S:"masa subur",O:"ovulasi"}[p]:""}">${i}<small>${p}</small></button>`}$("#cal").innerHTML=h;
const day=cdy(today),ph=phase(today),c=+S.p.cycle,nd=(c-day)%c||c;$("#hk").textContent="Hari ke-"+(day+1);$("#fs").textContent={M:"Fase menstruasi",S:"Masa subur",O:"Perkiraan ovulasi","":"Di luar masa haid dan subur"}[ph];const nx=addD(today,nd);$("#nx").textContent="Haid berikutnya sekitar "+nx.getDate()+" "+BL[nx.getMonth()]+" ("+nd+" hari lagi).";
const a=ART[today.getDate()%ART.length];$("#tipimg").innerHTML=art(today.getDate()%ART.length);$("#tipt").textContent=a[0];$("#tipx").textContent=a[1].split(". ")[0]+".";$("#nb").textContent=S.rem.length?"("+S.rem.length+")":""}
function mon(n){vm=new Date(vm.getFullYear(),vm.getMonth()+n,1);home()}
function pick(k){$("#cd").value=k;go("catat");if(location.hash==="#catat")openCatat(k)}
function quick(){const k=iso(today),L=S.logs[k]||{sym:[],note:""};L.flow=$("#qf").value;L.mood=$("#qm").value;S.logs[k]=L;save();home();toast("Catatan tersimpan")}
function openCatat(k){$("#cd").value=k;const L=S.logs[k]||{};$("#cf").value=L.flow||"Tidak ada";$("#cm").value=L.mood||"Biasa";$("#cn").value=L.note||"";document.querySelectorAll("#cs input").forEach(i=>i.checked=(L.sym||[]).includes(i.value));$("#cdel").style.display=S.logs[k]?"":"none";$("#ce").textContent=""}
function saveLog(){const k=$("#cd").value;if(!k){$("#ce").textContent="Pilih tanggal terlebih dahulu.";return}if(pd(k)>today){$("#ce").textContent="Tanggal tidak boleh di masa depan.";return}
S.logs[k]={flow:$("#cf").value,mood:$("#cm").value,sym:[...document.querySelectorAll("#cs input:checked")].map(i=>i.value),note:$("#cn").value.trim()};save();vm=new Date(pd(k).getFullYear(),pd(k).getMonth(),1);go("beranda");toast("Catatan tersimpan")}
function delLog(){const k=$("#cd").value,old=S.logs[k];delete S.logs[k];save();go("beranda");toast("Catatan dihapus",()=>{S.logs[k]=old;save();home()})}
function starts(){const ks=Object.keys(S.logs).filter(k=>S.logs[k].flow&&S.logs[k].flow!=="Tidak ada").sort();return ks.filter(k=>!(S.logs[iso(addD(pd(k),-1))]&&S.logs[iso(addD(pd(k),-1))].flow!=="Tidak ada"&&S.logs[iso(addD(pd(k),-1))].flow))}
function hist(){const f=$("#fm").value,st=starts(),L=[];for(let i=1;i<st.length;i++)L.push({k:st[i],v:Math.round((pd(st[i])-pd(st[i-1]))/864e5)});
$("#avg").textContent=L.length?Math.round(L.reduce((a,b)=>a+b.v,0)/L.length)+" hari":"–";
$("#chart").innerHTML=L.length?`<svg viewBox="0 0 ${L.length*60+20} 150" style="width:100%;max-width:${L.length*60+20}px" role="img" aria-label="Grafik panjang siklus">${L.slice(-8).map((x,i)=>`<rect x="${10+i*60}" y="${130-x.v*3}" width="40" height="${x.v*3}" rx="6" fill="var(--pri)"/><text x="${30+i*60}" y="${122-x.v*3}" text-anchor="middle" font-size="12" fill="var(--tx)">${x.v}</text><text x="${30+i*60}" y="146" text-anchor="middle" font-size="10" fill="var(--mut)">${x.k.slice(5)}</text>`).join("")}</svg>`:'<p style="color:var(--mut)">Belum ada grafik. Catat awal haid pada dua bulan berbeda untuk melihat panjang siklus Anda.</p>';
const ks=Object.keys(S.logs).filter(k=>!f||k.startsWith(f)).sort().reverse();$("#tb").innerHTML=ks.length?ks.map(k=>{const l=S.logs[k];return`<tr><td>${k}</td><td>${l.flow||"-"}</td><td>${l.mood||"-"}</td><td>${(l.sym||[]).join(", ")||"-"}</td></tr>`}).join(""):'<tr><td colspan="4" style="color:var(--mut)">Belum ada catatan. Mulai dari menu Catat.</td></tr>'}
function exportP(){try{window.print()}catch(e){toast("Ekspor tidak tersedia di tampilan ini")}}
function arts(q){q=(q||$("#q").value||"").toLowerCase().trim();$("#ad").style.display="none";const r=ART.map((a,i)=>[a,i]).filter(([a])=>!q||(a[0]+a[1]).toLowerCase().includes(q));$("#al").style.display="";$("#al").innerHTML=r.length?r.map(([a,i])=>`<div class="card" tabindex="0" role="button" onclick="openA(${i})" onkeydown="if(event.key==='Enter')openA(${i})">${art(i)}<div><h3>${a[0]}</h3><p style="margin:4px 0 0;color:var(--mut)">Baca selengkapnya</p></div></div>`).join(""):'<p>Tidak ada artikel untuk “'+q.replace(/</g,"")+'”. Coba kata kunci lain, misalnya nyeri haid atau tidur.</p>'}
function openA(i){$("#al").style.display="none";const d=$("#ad");d.style.display="";d.innerHTML=`<button onclick="arts()">◀ Kembali ke daftar</button><div style="max-width:560px;margin:12px auto 0">${art(i)}<h2 style="margin:12px 0 6px">${ART[i][0]}</h2><p>${ART[i][1]}</p></div>`;$("#crumb").textContent="Beranda > Artikel > "+ART[i][0]}
function doSearch(){const q=$("#q").value;if(location.hash==="#artikel")arts(q);else go("artikel")}
function rems(){$("#rl").innerHTML=S.rem.length?S.rem.map((r,i)=>`<div class="mh" style="border-bottom:1px solid var(--bd);padding:6px 0"><span><b>${r.t}</b> · ${r.w}</span><button onclick="delR(${i})">Hapus</button></div>`).join(""):'<p style="color:var(--mut)">Belum ada pengingat. Tambahkan lewat form di samping.</p>'}
function addR(){S.rem.push({t:$("#rt").value,w:$("#rw").value||"08:00"});save();rems();toast("Pengingat dibuat")}
function delR(i){const o=S.rem.splice(i,1)[0];save();rems();toast("Pengingat dihapus",()=>{S.rem.splice(i,0,o);save();rems()})}
function prof(){const p=S.p;$("#pn").value=p.name;$("#pc").value=p.cycle;$("#pp").value=p.period;$("#pl").value=p.last;$("#pe").textContent=""}
function saveP(){const c=+$("#pc").value,p=+$("#pp").value,l=$("#pl").value;if(c<21||c>45){$("#pe").textContent="Panjang siklus harus antara 21 dan 45 hari.";return}if(p<2||p>10||p>=c){$("#pe").textContent="Lama haid harus antara 2 dan 10 hari.";return}if(!l){$("#pe").textContent="Isi tanggal hari pertama haid terakhir.";return}S.p={name:$("#pn").value.trim(),cycle:c,period:p,last:l};save();toast("Profil tersimpan")}
function wipe(){if(!confirm("Hapus semua catatan, pengingat, dan profil dari peramban ini?"))return;S={logs:{},rem:[],p:{name:"",cycle:28,period:5,last:iso(addD(today,-9))}};save();prof();toast("Semua data dihapus")}
fill("#qf",FL);fill("#qm",MD);fill("#cf",FL);fill("#cm",MD);$("#qm").value="Biasa";$("#cs").innerHTML=SY.map(s=>`<label><input type="checkbox" value="${s}">${s}</label>`).join("");
$("#q").addEventListener("keydown",e=>{if(e.key==="Enter")doSearch()});$("#fm").addEventListener("change",hist);window.addEventListener("hashchange",route);
const MK="lunara_mode",MN={auto:"Auto",mobile:"Mobile",desktop:"Desktop"},mq=matchMedia("(max-width:760px)");
let MODE=document.documentElement.dataset.mode||"auto";
function applyMode(){const vp=document.querySelector("meta[name=viewport]");
vp.content=MODE==="desktop"?"width=1100, initial-scale=1":"width=device-width, initial-scale=1, viewport-fit=cover";
const ui=MODE==="mobile"?"m":MODE==="desktop"?"d":(mq.matches?"m":"d");
document.documentElement.dataset.ui=ui;document.documentElement.dataset.mode=MODE;
$("#modeLbl").textContent=MN[MODE];document.querySelectorAll("input[name=mode]").forEach(r=>r.checked=r.value===MODE)}
function setMode(m){MODE=m;try{localStorage.setItem(MK,m)}catch(e){}applyMode();toast("Tampilan: "+MN[m])}
function cycleMode(){setMode({auto:"mobile",mobile:"desktop",desktop:"auto"}[MODE])}
document.querySelectorAll("input[name=mode]").forEach(r=>r.addEventListener("change",()=>setMode(r.value)));
mq.addEventListener?mq.addEventListener("change",applyMode):mq.addListener(applyMode);window.addEventListener("resize",()=>{if(MODE==="auto")applyMode()});applyMode();
route();
