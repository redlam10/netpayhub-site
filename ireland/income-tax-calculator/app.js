/* Income tax (PAYE) only — 20%/40% bands minus credits. Shared 2026 engine. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const T=window.NPH_2026;

function compute(){
  const gross=Math.max(0,parseFloat($('gross').value)||0);
  const status=$('status').value;
  const pct=Math.min(40,Math.max(0,parseFloat($('pension').value)||0));
  const pension=gross*pct/100;
  const itBase=Math.max(0,gross-pension);
  const cut=T.CUTOFF[status];
  const at20=Math.min(itBase,cut), at40=Math.max(0,itBase-cut);
  const g20=at20*0.20, g40=at40*0.40;
  const credits=T.credits(status);
  const tax=Math.max(0,g20+g40-credits);
  return {gross,status,pension,at20,at40,g20,g40,credits,tax,eff:gross?tax/gross:0};
}
function render(){
  const r=compute();
  $('tax').textContent=fmt.format(r.tax);
  $('effLine').textContent=(r.eff*100).toFixed(1)+'% of gross salary';
  $('b20amt').textContent='on '+fmt.format(r.at20);
  $('b40amt').textContent='on '+fmt.format(r.at40);
  $('b20').textContent=fmt.format(r.g20);
  $('b40').textContent=fmt.format(r.g40);
  $('cred').textContent='−'+fmt.format(r.credits);
  $('tax2').textContent=fmt.format(r.tax);
  $('answerLine').innerHTML=
    `A <b>${fmt.format(r.gross)}</b> ${r.status==='single'?'single':'married (one income)'} salary pays <b>${fmt.format(r.tax)}</b> income tax in Ireland (2026): ${fmt.format(r.g20)} at 20% plus ${fmt.format(r.g40)} at 40%, minus ${fmt.format(r.credits)} of tax credits.`;
  return r;
}
$('gross').addEventListener('input',()=>{$('grossRange').value=$('gross').value;render();});
$('grossRange').addEventListener('input',()=>{$('gross').value=$('grossRange').value;render();});
$('status').addEventListener('input',render);
$('pension').addEventListener('input',render);
$('reset').addEventListener('click',()=>{$('gross').value=50000;$('grossRange').value=50000;$('status').value='single';$('pension').value=0;render();});

$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Income Tax (PAYE) — Ireland 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Gross salary</span><b>${fmt.format(r.gross)}</b></div>
       <div class="rrow"><span>Taxed at 20% (${fmt.format(r.at20)})</span><b>${fmt.format(r.g20)}</b></div>
       <div class="rrow"><span>Taxed at 40% (${fmt.format(r.at40)})</span><b>${fmt.format(r.g40)}</b></div>
       <div class="rrow"><span>Tax credits</span><b>−${fmt.format(r.credits)}</b></div>
       <div class="rrow rtot"><span>Income tax due</span><b>${fmt.format(r.tax)}</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">PAYE income tax only (excludes USC and PRSI). Estimate based on Revenue.ie Budget 2026 bands; not tax advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
