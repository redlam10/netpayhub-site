/* Minimum wage take-home — Ireland 2026. National Minimum Wage from 1 Jan 2026
   (verified): €14.15 (20+), €12.74 (19), €11.32 (18), €9.91 (<18). Take-home
   uses the shared verified 2026 tax engine (window.NPH_2026).
   100% client-side: no fetch, no storage, no third-party scripts. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const fmt2=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:2});
const T=window.NPH_2026;
const RATES={a20:14.15, a19:12.74, a18:11.32, u18:9.91};

function compute(){
  const rate=RATES[$('age').value]||14.15;
  const hours=Math.max(0,parseFloat($('hours').value)||0);
  const status=$('status').value;
  const weeklyGross=rate*hours;
  const annualGross=weeklyGross*52;
  const r=T.employeeNet(annualGross,status,0);
  return {rate,hours,status,weeklyGross,annualGross,it:r.it,usc:r.usc,prsi:r.prsi,
          net:r.net,monthly:r.monthly,weeklyNet:r.net/52,eff:r.eff};
}
function render(){
  const r=compute();
  $('netAnnual').textContent=fmt.format(r.net);
  $('netMonthly').textContent=fmt.format(r.monthly)+' / month · '+fmt.format(r.weeklyNet)+' / week';
  $('hourly').textContent=fmt2.format(r.rate);
  $('wgross').textContent=fmt.format(r.weeklyGross);
  $('agross').textContent=fmt.format(r.annualGross);
  $('it').textContent='– '+fmt.format(r.it);
  $('usc').textContent='– '+fmt.format(r.usc);
  $('prsi').textContent='– '+fmt.format(r.prsi);
  $('net2').textContent=fmt.format(r.net);
  $('answerLine').innerHTML=
    `Working <b>${r.hours}</b> hours a week on the 2026 minimum wage of <b>${fmt2.format(r.rate)}</b>/hour, `+
    `you earn <b>${fmt.format(r.annualGross)}</b> a year and take home about <b>${fmt.format(r.net)}</b> `+
    `(<b>${fmt.format(r.monthly)}</b>/month) after income tax, USC and PRSI.`;
  return r;
}
$('age').addEventListener('input',render);
$('hours').addEventListener('input',()=>{$('hoursRange').value=$('hours').value;render();});
$('hoursRange').addEventListener('input',()=>{$('hours').value=$('hoursRange').value;render();});
$('status').addEventListener('input',render);
$('reset').addEventListener('click',()=>{$('age').value='a20';$('hours').value=39;$('hoursRange').value=39;$('status').value='single';render();});

$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Minimum Wage Take-Home — Ireland 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Hourly rate</span><b>${fmt2.format(r.rate)}</b></div>
       <div class="rrow"><span>Hours per week</span><b>${r.hours}</b></div>
       <div class="rrow"><span>Annual gross</span><b>${fmt.format(r.annualGross)}</b></div>
       <div class="rrow"><span>Income tax (PAYE)</span><b>${fmt.format(r.it)}</b></div>
       <div class="rrow"><span>USC</span><b>${fmt.format(r.usc)}</b></div>
       <div class="rrow"><span>PRSI</span><b>${fmt.format(r.prsi)}</b></div>
       <div class="rrow rtot"><span>Take-home pay</span><b>${fmt.format(r.net)} / yr · ${fmt.format(r.monthly)} / mo</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">National Minimum Wage from 1 January 2026. Estimate based on Revenue.ie Budget 2026 bands; assumes standard PAYE Class A. Not tax advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
