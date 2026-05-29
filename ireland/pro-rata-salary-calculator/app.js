/* Pro rata salary — pure client-side arithmetic, no tax data. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const els={ftsalary:$('ftsalary'),ftsalaryRange:$('ftsalaryRange'),fthours:$('fthours'),acthours:$('acthours'),prorata:$('prorata'),monthly:$('monthly'),pct:$('pct'),answer:$('answer')};

function read(){
  return {
    ftsalary: Math.max(0, parseFloat(els.ftsalary.value)||0),
    fthours: Math.max(0.5, parseFloat(els.fthours.value)||0.5),
    acthours: Math.max(0, parseFloat(els.acthours.value)||0)
  };
}
function calc(){
  const {ftsalary,fthours,acthours}=read();
  const ratio=acthours/fthours;
  const prorata=ftsalary*ratio;
  const monthly=prorata/12;
  const pct=ratio*100;
  els.prorata.textContent=fmt.format(prorata);
  els.monthly.textContent=fmt.format(monthly);
  els.pct.textContent=pct.toFixed(1)+'%';
  els.answer.innerHTML=`A <b>${fmt.format(ftsalary)}</b> full-time role at ${fthours} hours, worked at ${acthours} hours a week, is a pro rata salary of <b>${fmt.format(prorata)}</b> (about <b>${fmt.format(monthly)}</b> a month) — ${pct.toFixed(1)}% of full time.`;
  return {ftsalary,fthours,acthours,prorata,monthly,pct};
}
els.ftsalary.addEventListener('input',()=>{els.ftsalaryRange.value=els.ftsalary.value;calc();});
els.ftsalaryRange.addEventListener('input',()=>{els.ftsalary.value=els.ftsalaryRange.value;calc();});
els.fthours.addEventListener('input',calc);
els.acthours.addEventListener('input',calc);
$('reset').addEventListener('click',()=>{els.ftsalary.value=50000;els.ftsalaryRange.value=50000;els.fthours.value=39;els.acthours.value=24;calc();});

$('pdf').addEventListener('click',()=>{
  const d=calc();
  const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Pro Rata Salary</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · Ireland · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Full-time salary</span><b>${fmt.format(d.ftsalary)}</b></div>
       <div class="rrow"><span>Full-time hours / week</span><b>${d.fthours}</b></div>
       <div class="rrow"><span>Your hours / week</span><b>${d.acthours}</b></div>
       <div class="rrow"><span>Share of full time</span><b>${d.pct.toFixed(1)}%</b></div>
       <div class="rrow"><span>Per month</span><b>${fmt.format(d.monthly)}</b></div>
       <div class="rrow rtot"><span>Pro rata salary (gross)</span><b>${fmt.format(d.prorata)}</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Gross figures before tax. Pure arithmetic — no tax data used. Generated locally in your browser. netpayhub.com</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
calc();
