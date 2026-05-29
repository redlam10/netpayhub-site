/* Bonus tax — marginal tax on a once-off bonus. Uses the shared 2026 engine. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const T=window.NPH_2026;

function compute(){
  const salary=Math.max(0,parseFloat($('salary').value)||0);
  const bonus=Math.max(0,parseFloat($('bonus').value)||0);
  const status=$('status').value;
  const base=T.employeeNet(salary,status,0);
  const withB=T.employeeNet(salary+bonus,status,0);
  const itB=Math.max(0,withB.it-base.it);
  const uscB=Math.max(0,withB.usc-base.usc);
  const prsiB=Math.max(0,withB.prsi-base.prsi);
  const tax=itB+uscB+prsiB;
  const kept=Math.max(0,bonus-tax);
  const eff=bonus?tax/bonus:0;
  return {salary,bonus,status,itB,uscB,prsiB,tax,kept,eff};
}
function render(){
  const r=compute();
  $('keep').textContent=fmt.format(r.kept);
  $('effLine').textContent=(r.eff*100).toFixed(1)+'% goes to tax';
  $('itB').textContent=fmt.format(r.itB);
  $('uscB').textContent=fmt.format(r.uscB);
  $('prsiB').textContent=fmt.format(r.prsiB);
  $('keep2').textContent=fmt.format(r.kept);
  $('keepPct').textContent=((1-r.eff)*100).toFixed(1)+'% of bonus';
  $('answerLine').innerHTML=
    `A <b>${fmt.format(r.bonus)}</b> bonus on a <b>${fmt.format(r.salary)}</b> ${r.status==='single'?'single':'married (one income)'} salary is taxed at about <b>${(r.eff*100).toFixed(1)}%</b>, so you keep roughly <b>${fmt.format(r.kept)}</b> after income tax, USC and PRSI in 2026.`;
  return r;
}
$('salary').addEventListener('input',()=>{$('salaryRange').value=$('salary').value;render();});
$('salaryRange').addEventListener('input',()=>{$('salary').value=$('salaryRange').value;render();});
$('bonus').addEventListener('input',render);
$('status').addEventListener('input',render);
$('reset').addEventListener('click',()=>{$('salary').value=50000;$('salaryRange').value=50000;$('bonus').value=5000;$('status').value='single';render();});

$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Bonus Tax Report — Ireland 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Salary (before bonus)</span><b>${fmt.format(r.salary)}</b></div>
       <div class="rrow"><span>Once-off bonus</span><b>${fmt.format(r.bonus)}</b></div>
       <div class="rrow"><span>Income tax on bonus</span><b>${fmt.format(r.itB)}</b></div>
       <div class="rrow"><span>USC on bonus</span><b>${fmt.format(r.uscB)}</b></div>
       <div class="rrow"><span>PRSI on bonus</span><b>${fmt.format(r.prsiB)}</b></div>
       <div class="rrow rtot"><span>Bonus kept</span><b>${fmt.format(r.kept)} (${((1-r.eff)*100).toFixed(1)}%)</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Marginal tax on the bonus ${(r.eff*100).toFixed(1)}%. Estimate based on Revenue.ie Budget 2026 bands; not tax advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
