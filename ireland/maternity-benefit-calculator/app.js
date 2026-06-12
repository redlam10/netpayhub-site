/* Maternity Benefit — Ireland 2026. Verified rules:
     • Benefit: €299/week, paid for 26 weeks (DSP).
     • Taxable for INCOME TAX only — exempt from USC and PRSI. Revenue collects
       the tax by reducing your credits/rate band, at your marginal rate.
     • Employer top-up is optional: payroll pays (normal pay − €299) and taxes
       that part as usual. Because the €299 escapes USC and PRSI, full top-up
       usually means SLIGHTLY MORE take-home than a normal week.
   Estimates use the shared verified 2026 engine (window.NPH_2026) for your
   normal net pay, the marginal income-tax rate for tax on the benefit, and
   your marginal USC rate for the USC/PRSI saving.
   100% client-side: no fetch, no storage, no third-party scripts. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const fmt2=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:2});
const T=window.NPH_2026;
const BENEFIT=299;

function uscMarginal(g){
  if(g<=13000) return 0;
  if(g>70044) return 0.08;
  if(g>28700) return 0.03;
  if(g>12012) return 0.02;
  return 0.005;
}
function compute(){
  const salary=Math.max(0,parseFloat($('salary').value)||0);
  const status=$('status').value;
  const weeks=Math.min(26,Math.max(1,Math.round(parseFloat($('weeks').value)||26)));
  const topup=$('topup').value==='full';
  const totalBenefit=BENEFIT*weeks;
  const normalWk=T.employeeNet(salary,status,0).net/52;
  const itMarginal=salary>T.CUTOFF[status]?0.40:0.20;
  let leaveWk, note;
  if(topup){
    leaveWk=normalWk + BENEFIT*(uscMarginal(salary)+0.042);   // USC+PRSI saved on the benefit slice
    note='with full employer top-up';
  }else{
    leaveWk=BENEFIT*(1-itMarginal);
    note='benefit only, no top-up';
  }
  const topupWk=topup?Math.max(0,salary/52-BENEFIT):0;
  return {salary,status,weeks,topup,totalBenefit,normalWk,leaveWk,topupWk,itMarginal,note};
}
function render(){
  const r=compute();
  $('leaveWk').textContent=fmt2.format(r.leaveWk);
  $('leaveSub').textContent='per week during leave ('+r.note+')';
  $('bBenefit').textContent=fmt.format(BENEFIT)+' / wk';
  $('topupRow').style.display=r.topup?'':'none';
  $('bTopup').textContent='+ '+fmt2.format(r.topupWk)+' / wk gross';
  $('bNormal').textContent=fmt2.format(r.normalWk)+' / wk';
  $('totBig').textContent=fmt.format(r.totalBenefit);
  $('totSub').textContent='total Maternity Benefit over '+r.weeks+' weeks';
  const diff=r.leaveWk-r.normalWk;
  $('answerLine').innerHTML= r.topup
    ? `On <b>${fmt.format(r.salary)}</b> with a full employer top-up, your income during maternity leave is about <b>${fmt2.format(r.leaveWk)}</b> a week — `+
      `slightly <b>more</b> than your normal ${fmt2.format(r.normalWk)} (≈${fmt2.format(diff)} extra), because the €299 Maternity Benefit is exempt from USC and PRSI. `+
      `Over ${r.weeks} weeks the State pays <b>${fmt.format(r.totalBenefit)}</b> of it.`
    : `With no employer top-up, Maternity Benefit pays <b>€299</b> a week — about <b>${fmt2.format(r.leaveWk)}</b> after income tax at your ${(r.itMarginal*100).toFixed(0)}% rate. `+
      `Over ${r.weeks} weeks that's <b>${fmt.format(r.totalBenefit)}</b> gross from the State. If your yearly income drops, unused credits often reduce the actual tax at year-end review.`;
  return r;
}
$('salary').addEventListener('input',()=>{$('salaryRange').value=$('salary').value;render();});
$('salaryRange').addEventListener('input',()=>{$('salary').value=$('salaryRange').value;render();});
$('weeks').addEventListener('input',render);
$('status').addEventListener('input',render);
$('topup').addEventListener('input',render);
$('reset').addEventListener('click',()=>{$('salary').value=45000;$('salaryRange').value=45000;$('weeks').value=26;$('status').value='single';$('topup').value='full';render();});

$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Maternity Benefit — Ireland 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Normal gross salary</span><b>${fmt.format(r.salary)}</b></div>
       <div class="rrow"><span>Maternity Benefit</span><b>€299 / week × ${r.weeks} weeks = ${fmt.format(r.totalBenefit)}</b></div>
       <div class="rrow"><span>Employer top-up</span><b>${r.topup?fmt2.format(r.topupWk)+' / wk gross':'None'}</b></div>
       <div class="rrow rtot"><span>Estimated income during leave</span><b>${fmt2.format(r.leaveWk)} / week</b></div>
       <div class="rrow"><span>Normal weekly net (comparison)</span><b>${fmt2.format(r.normalWk)}</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Benefit is taxable for income tax only (no USC/PRSI), collected via reduced credits at your marginal rate. Estimate for a standard PAYE worker; actual tax depends on your credits and full-year income. Per DSP/Revenue 2026; not tax advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
