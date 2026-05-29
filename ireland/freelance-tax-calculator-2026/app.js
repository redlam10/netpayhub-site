/* Freelance / self-employed tax — Earned Income Credit, Class S PRSI, USC surcharge. Shared 2026 engine. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const T=window.NPH_2026;

function compute(){
  const income=Math.max(0,parseFloat($('income').value)||0);
  const status=$('status').value;
  const r=T.selfEmployedNet(income,status);
  return {income,status,...r};
}
function render(){
  const r=compute();
  $('netAnnual').textContent=fmt.format(r.net);
  $('netMonthly').textContent=fmt.format(r.monthly)+' / month';
  $('it').textContent=fmt.format(r.it);
  $('usc').textContent=fmt.format(r.usc);
  $('uscTag').textContent=r.income>100000?'incl. 3% surcharge':'';
  $('prsi').textContent=fmt.format(r.prsi);
  $('net2').textContent=fmt.format(r.net);
  $('effrate').textContent=(r.eff*100).toFixed(1)+'% effective rate';
  const label=r.status==='single'?'(single)':'(married, one income)';
  $('answerLine').innerHTML=
    `A self-employed person on <b>${fmt.format(r.income)}</b> ${label} keeps about <b>${fmt.format(r.net)}</b> after income tax (${fmt.format(r.it)}), USC (${fmt.format(r.usc)}) and Class S PRSI (${fmt.format(r.prsi)}) in 2026, using the €2,000 Earned Income Credit.`;
  return r;
}
$('income').addEventListener('input',()=>{$('incomeRange').value=$('income').value;render();});
$('incomeRange').addEventListener('input',()=>{$('income').value=$('incomeRange').value;render();});
$('status').addEventListener('input',render);
$('reset').addEventListener('click',()=>{$('income').value=60000;$('incomeRange').value=60000;$('status').value='single';render();});

$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Freelance Tax Report — Ireland 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Self-employed income</span><b>${fmt.format(r.income)}</b></div>
       <div class="rrow"><span>Income tax (Earned Income Credit)</span><b>${fmt.format(r.it)}</b></div>
       <div class="rrow"><span>USC</span><b>${fmt.format(r.usc)}</b></div>
       <div class="rrow"><span>PRSI (Class S)</span><b>${fmt.format(r.prsi)}</b></div>
       <div class="rrow rtot"><span>Take-home pay</span><b>${fmt.format(r.net)} / yr · ${fmt.format(r.monthly)} / mo</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Effective rate ${(r.eff*100).toFixed(1)}%. Self-employed estimate on profit after expenses; not tax advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
