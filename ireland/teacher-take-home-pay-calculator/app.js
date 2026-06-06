/* Teacher take-home pay — Ireland 2026. Uses the shared verified 2026 tax
   engine (window.NPH_2026). The "pension/superannuation" field lets a teacher
   model their public-service pension + Additional Superannuation Contribution
   (ASC), which reduce take-home below a private worker on the same gross.
   100% client-side: no fetch, no storage, no third-party scripts. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const T=window.NPH_2026;

function compute(){
  const salary=Math.max(0,parseFloat($('salary').value)||0);
  const status=$('status').value;
  const pct=Math.min(40,Math.max(0,parseFloat($('pension').value)||0));
  const pension=salary*pct/100;
  const r=T.employeeNet(salary,status,pension);
  return {salary,status,pct,pension,...r};
}
function render(){
  const r=compute();
  $('netAnnual').textContent=fmt.format(r.net);
  $('netMonthly').textContent=fmt.format(r.monthly)+' / month';
  $('it').textContent=fmt.format(r.it);
  $('usc').textContent=fmt.format(r.usc);
  $('prsi').textContent=fmt.format(r.prsi);
  $('superRow').style.display=r.pension>0?'':'none';
  $('super').textContent=fmt.format(r.pension);
  $('net2').textContent=fmt.format(r.net);
  $('effrate').textContent=(r.eff*100).toFixed(1)+'% effective rate';
  const label=r.status==='single'?'(single)':'(married, one income)';
  const superNote=r.pension>0
    ? ` after a ${r.pct}% pension/superannuation deduction (${fmt.format(r.pension)}),`
    : ` (before any pension/superannuation),`;
  $('answerLine').innerHTML=
    `A teacher on <b>${fmt.format(r.salary)}</b> ${label}${superNote} takes home about <b>${fmt.format(r.net)}</b> a year — `+
    `roughly <b>${fmt.format(r.monthly)}</b> a month — after income tax (${fmt.format(r.it)}), USC (${fmt.format(r.usc)}) and PRSI (${fmt.format(r.prsi)}) in 2026.`;
  return r;
}
$('salary').addEventListener('input',()=>{$('salaryRange').value=$('salary').value;render();});
$('salaryRange').addEventListener('input',()=>{$('salary').value=$('salaryRange').value;render();});
$('status').addEventListener('input',render);
$('pension').addEventListener('input',render);
document.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>{
  const v=c.getAttribute('data-sal'); $('salary').value=v; $('salaryRange').value=v; render();
}));
$('reset').addEventListener('click',()=>{$('salary').value=45379;$('salaryRange').value=45379;$('status').value='single';$('pension').value=0;render();});

$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Teacher Take-Home Pay — Ireland 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Gross salary</span><b>${fmt.format(r.salary)}</b></div>
       <div class="rrow"><span>Income tax (PAYE)</span><b>${fmt.format(r.it)}</b></div>
       <div class="rrow"><span>USC</span><b>${fmt.format(r.usc)}</b></div>
       <div class="rrow"><span>PRSI</span><b>${fmt.format(r.prsi)}</b></div>
       ${r.pension>0?`<div class="rrow"><span>Pension / superannuation (${r.pct}%)</span><b>${fmt.format(r.pension)}</b></div>`:''}
       <div class="rrow rtot"><span>Take-home pay</span><b>${fmt.format(r.net)} / yr · ${fmt.format(r.monthly)} / mo</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Effective tax rate ${(r.eff*100).toFixed(1)}%. Before allowances, overtime or substitute work; superannuation/ASC is the rate you entered. Estimate based on Revenue.ie Budget 2026 bands; not tax advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
