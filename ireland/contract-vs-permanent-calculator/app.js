/* Contract vs permanent — PAYE employee vs self-employed contractor. Shared 2026 engine. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const T=window.NPH_2026;
const signed=v=>(v>=0?'+':'−')+fmt.format(Math.abs(v));

function compute(){
  const permSalary=Math.max(0,parseFloat($('perm').value)||0);
  const rate=Math.max(0,parseFloat($('rate').value)||0);
  const days=Math.max(0,parseFloat($('days').value)||0);
  const weeks=Math.min(52,Math.max(0,parseFloat($('weeks').value)||0));
  const status=$('status').value;
  const perm=T.employeeNet(permSalary,status,0);
  const conGross=rate*days*weeks;
  const con=T.selfEmployedNet(conGross,status);
  const diff=con.net-perm.net;
  return {permSalary,rate,days,weeks,status,permNet:perm.net,conGross,conNet:con.net,diff};
}
function render(){
  const r=compute();
  $('diff').textContent=signed(r.diff);
  $('diffK').textContent=r.diff>=0?'Contractor nets more':'Permanent nets more';
  $('diffSub').textContent='per year, before benefits';
  $('permNet').textContent=fmt.format(r.permNet);
  $('conGross').textContent=fmt.format(r.conGross);
  $('conNet').textContent=fmt.format(r.conNet);
  $('diff2').textContent=signed(r.diff);
  const who=r.diff>=0?`the contract nets <b>${signed(r.diff)}</b> more`:`the permanent role nets <b>${signed(-r.diff)}</b> more`;
  $('answerLine').innerHTML=
    `A <b>${fmt.format(r.permSalary)}</b> permanent salary nets about <b>${fmt.format(r.permNet)}</b>, while a <b>${fmt.format(r.rate)}/day</b> contract (${r.days} days, ${r.weeks} weeks = ${fmt.format(r.conGross)}) nets about <b>${fmt.format(r.conNet)}</b> as self-employed — so ${who}, before the contractor pays for their own holidays, pension and downtime.`;
  return r;
}
['perm','rate','days','weeks','status'].forEach(id=>$(id).addEventListener('input',render));
$('permRange').addEventListener('input',()=>{$('perm').value=$('permRange').value;render();});
$('perm').addEventListener('input',()=>{$('permRange').value=$('perm').value;});
$('reset').addEventListener('click',()=>{$('perm').value=60000;$('permRange').value=60000;$('rate').value=350;$('days').value=5;$('weeks').value=46;$('status').value='single';render();});

$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Contract vs Permanent — Ireland 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Permanent salary</span><b>${fmt.format(r.permSalary)}</b></div>
       <div class="rrow"><span>Permanent take-home</span><b>${fmt.format(r.permNet)}</b></div>
       <div class="rrow"><span>Contractor gross (${r.rate}×${r.days}×${r.weeks})</span><b>${fmt.format(r.conGross)}</b></div>
       <div class="rrow"><span>Contractor take-home (self-employed)</span><b>${fmt.format(r.conNet)}</b></div>
       <div class="rrow rtot"><span>Difference</span><b>${signed(r.diff)} / yr</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Permanent taxed as PAYE; contract as self-employed. Excludes paid leave, pension and benefits. Estimate based on Revenue.ie Budget 2026 bands; not tax advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
