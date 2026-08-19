/* =================================================================
   100% CLIENT-SIDE NET-TO-GROSS ENGINE — Ireland 2026
   Inverts the verified take-home maths (Budget 2026 bands): given the
   net pay you want, it solves for the gross salary you need via binary
   search. Same bands/credits as the salary-after-tax calculator.
   No fetch(), no storage, no third-party scripts: data stays local.
   ================================================================= */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});

const CUTOFF={single:44000, married1:53000};
const CREDITS={single:4000, married1:6000};   // personal + employee PAYE credit
const USC_EXEMPT=13000, PRSI_RATE=0.042, PRSI_WEEKLY_EXEMPT=352*52;

function band(a,lo,hi,r){return Math.max(0,Math.min(a,hi)-lo)*r;}
// Class A employee PRSI. Nil at or below EUR352/week; between EUR352.01 and EUR424 a
// tapered weekly credit of up to EUR12 applies, reduced by one sixth of weekly
// earnings above EUR352.01 (gov.ie "PRSI Class A Rates", note **).
function prsiEmployee(gross, rate){
  if(gross<=PRSI_WEEKLY_EXEMPT) return 0;
  const w=gross/52;
  const credit = w<=352.01 ? 12 : (w>=424 ? 0 : Math.max(0, 12-(w-352.01)/6));
  return Math.max(0, w*(rate||PRSI_RATE)-credit)*52;
}


function deductions(gross,status){
  const cut=CUTOFF[status];
  const grossIT=Math.min(gross,cut)*0.20 + Math.max(0,gross-cut)*0.40;
  const it=Math.max(0,grossIT-CREDITS[status]);
  let usc=0;
  if(gross>USC_EXEMPT){
    usc=band(gross,0,12012,0.005)+band(gross,12012,28700,0.02)
       +band(gross,28700,70044,0.03)+band(gross,70044,Infinity,0.08);
  }
  const prsi=prsiEmployee(gross);
  return {it,usc,prsi,total:it+usc+prsi};
}
function netFromGross(gross,status){return gross-deductions(gross,status).total;}

function compute(){
  const target=Math.max(0,parseFloat($('net').value)||0);
  const status=$('status').value;
  // binary search gross so netFromGross(gross) == target (monotonic increasing)
  let lo=target, hi=target*2.5+5000;
  for(let i=0;i<80;i++){
    const mid=(lo+hi)/2;
    if(netFromGross(mid,status)<target) lo=mid; else hi=mid;
  }
  const gross=(lo+hi)/2;
  const d=deductions(gross,status);
  return {target,status,gross,it:d.it,usc:d.usc,prsi:d.prsi,
          total:d.total,monthly:gross/12,eff:gross?d.total/gross:0};
}

function render(){
  const r=compute();
  $('grossAnnual').textContent=fmt.format(r.gross);
  $('grossMonthly').textContent=fmt.format(r.monthly)+' / month gross';
  $('bGross').textContent=fmt.format(r.gross);
  $('it').textContent='– '+fmt.format(r.it);
  $('usc').textContent='– '+fmt.format(r.usc);
  $('prsi').textContent='– '+fmt.format(r.prsi);
  $('bnet').textContent=fmt.format(r.target);
  const label=r.status==='single'?'single':'married (one income)';
  $('answerLine').innerHTML=
    `To take home <b>${fmt.format(r.target)}</b> a year as a ${label} worker, you need to earn about `+
    `<b>${fmt.format(r.gross)}</b> gross (roughly <b>${fmt.format(r.monthly)}</b>/month) — after income tax, USC and PRSI on Ireland's 2026 bands.`;
  return r;
}

$('net').addEventListener('input',()=>{$('netRange').value=$('net').value;render();});
$('netRange').addEventListener('input',()=>{$('net').value=$('netRange').value;render();});
$('status').addEventListener('input',render);
$('reset').addEventListener('click',()=>{$('net').value=40000;$('netRange').value=40000;$('status').value='single';render();});

/* Native print-to-PDF — clean report, still 100% local */
$('pdf').addEventListener('click',()=>{
  const r=render();
  const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Ireland Net-to-Gross Report — 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Target take-home (net)</span><b>${fmt.format(r.target)} / yr</b></div>
       <div class="rrow"><span>Gross salary needed</span><b>${fmt.format(r.gross)} / yr · ${fmt.format(r.monthly)} / mo</b></div>
       <div class="rrow"><span>Income tax (PAYE)</span><b>${fmt.format(r.it)}</b></div>
       <div class="rrow"><span>USC</span><b>${fmt.format(r.usc)}</b></div>
       <div class="rrow"><span>PRSI</span><b>${fmt.format(r.prsi)}</b></div>
       <div class="rrow rtot"><span>Effective tax rate</span><b>${(r.eff*100).toFixed(1)}%</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Estimate based on Revenue.ie Budget 2026 bands and standard single/married credits; not tax advice. Generated locally in your browser — no data was sent or stored.</p>
     </div>`;
  window.print();
});

$('yr').textContent=new Date().getFullYear();
render();
