/* Pension tax relief — relief at marginal rate; real cost to take-home. Shared 2026 engine. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const T=window.NPH_2026;

function compute(){
  const salary=Math.max(0,parseFloat($('salary').value)||0);
  const pct=Math.min(40,Math.max(0,parseFloat($('pct').value)||0));
  const status=$('status').value;
  const contribution=salary*pct/100;
  const withP=T.employeeNet(salary,status,contribution);
  const noP=T.employeeNet(salary,status,0);
  const relief=Math.max(0,noP.it-withP.it);     // income tax saved
  const realCost=Math.max(0,noP.net-withP.net);  // take-home drop = contribution - relief
  const rate=contribution>0?relief/contribution:0;
  return {salary,pct,status,contribution,relief,realCost,netWith:withP.net,netNo:noP.net,rate};
}
function render(){
  const r=compute();
  $('relief').textContent=fmt.format(r.relief);
  $('reliefSub').textContent='back at '+(r.rate>=0.399?'40%':(r.rate>0?Math.round(r.rate*100)+'%':'your'))+' marginal rate';
  $('contrib').textContent=fmt.format(r.contribution);
  $('netWith').textContent=fmt.format(r.netWith);
  $('netNo').textContent=fmt.format(r.netNo);
  $('realCost').textContent=fmt.format(r.realCost);
  const rateTxt=r.rate>=0.399?'40%':(r.rate>0?Math.round(r.rate*100)+'%':'your marginal rate');
  $('answerLine').innerHTML=
    `Paying <b>${r.pct}%</b> (<b>${fmt.format(r.contribution)}</b>) of a <b>${fmt.format(r.salary)}</b> salary into a pension grows your pot by <b>${fmt.format(r.contribution)}</b> but reduces take-home by only <b>${fmt.format(r.realCost)}</b> — <b>${fmt.format(r.relief)}</b> comes back as income-tax relief at ${rateTxt}.`;
  return r;
}
$('salary').addEventListener('input',()=>{$('salaryRange').value=$('salary').value;render();});
$('salaryRange').addEventListener('input',()=>{$('salary').value=$('salaryRange').value;render();});
$('pct').addEventListener('input',()=>{$('pctRange').value=$('pct').value;render();});
$('pctRange').addEventListener('input',()=>{$('pct').value=$('pctRange').value;render();});
$('status').addEventListener('input',render);
$('reset').addEventListener('click',()=>{$('salary').value=50000;$('salaryRange').value=50000;$('pct').value=10;$('pctRange').value=10;$('status').value='single';render();});

$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Pension Tax Relief — Ireland 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Salary</span><b>${fmt.format(r.salary)}</b></div>
       <div class="rrow"><span>Pension contribution (${r.pct}%)</span><b>${fmt.format(r.contribution)}</b></div>
       <div class="rrow"><span>Income-tax relief</span><b>${fmt.format(r.relief)}</b></div>
       <div class="rrow"><span>Take-home without pension</span><b>${fmt.format(r.netNo)}</b></div>
       <div class="rrow"><span>Take-home with pension</span><b>${fmt.format(r.netWith)}</b></div>
       <div class="rrow rtot"><span>Real cost to you</span><b>${fmt.format(r.realCost)}</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Relief on income tax only; USC and PRSI apply to full salary. Subject to age-related limits. Estimate based on Revenue.ie Budget 2026 bands; not financial advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
