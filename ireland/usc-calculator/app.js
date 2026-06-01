/* USC only — per-band breakdown. Shared 2026 engine. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const T=window.NPH_2026;

function compute(){
  const inc=Math.max(0,parseFloat($('income').value)||0);
  const exempt=inc<=13000;
  const b1=exempt?0:T.band(inc,0,12012,0.005);
  const b2=exempt?0:T.band(inc,12012,28700,0.02);
  const b3=exempt?0:T.band(inc,28700,70044,0.03);
  const b4=exempt?0:T.band(inc,70044,Infinity,0.08);
  const total=b1+b2+b3+b4;
  return {inc,exempt,b1,b2,b3,b4,total,eff:inc?total/inc:0};
}
function render(){
  const r=compute();
  $('usc').textContent=fmt.format(r.total);
  $('effLine').textContent=r.exempt?'exempt (income ≤ €13,000)':(r.eff*100).toFixed(1)+'% of gross income';
  $('b1').textContent=fmt.format(r.b1);
  $('b2').textContent=fmt.format(r.b2);
  $('b3').textContent=fmt.format(r.b3);
  $('b4').textContent=fmt.format(r.b4);
  $('usctot').textContent=fmt.format(r.total);
  if(r.exempt){
    $('answerLine').innerHTML=`On <b>${fmt.format(r.inc)}</b>, you pay <b>no USC</b> — total income of €13,000 or less is exempt in 2026.`;
  } else {
    $('answerLine').innerHTML=`On <b>${fmt.format(r.inc)}</b>, USC is about <b>${fmt.format(r.total)}</b> in 2026: ${fmt.format(r.b1)} at 0.5%, ${fmt.format(r.b2)} at 2%, ${fmt.format(r.b3)} at 3%${r.b4>0?` and ${fmt.format(r.b4)} at 8%`:''}. USC is charged on gross income.`;
  }
  return r;
}
$('income').addEventListener('input',()=>{$('incomeRange').value=$('income').value;render();});
$('incomeRange').addEventListener('input',()=>{$('income').value=$('incomeRange').value;render();});
$('reset').addEventListener('click',()=>{$('income').value=50000;$('incomeRange').value=50000;render();});

$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">USC — Ireland 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Gross income</span><b>${fmt.format(r.inc)}</b></div>
       <div class="rrow"><span>0.5% (first €12,012)</span><b>${fmt.format(r.b1)}</b></div>
       <div class="rrow"><span>2% (€12,012–€28,700)</span><b>${fmt.format(r.b2)}</b></div>
       <div class="rrow"><span>3% (€28,700–€70,044)</span><b>${fmt.format(r.b3)}</b></div>
       <div class="rrow"><span>8% (balance)</span><b>${fmt.format(r.b4)}</b></div>
       <div class="rrow rtot"><span>Total USC</span><b>${fmt.format(r.total)}</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">USC only (excludes income tax and PRSI). Charged on gross income; exempt if total income ≤ €13,000. Estimate based on Revenue.ie Budget 2026 bands; not tax advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
