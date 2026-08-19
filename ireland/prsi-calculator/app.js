/* PRSI only — Class A 4.2% (4.35% from Oct 2026). Shared 2026 engine. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const WEEKLY_EXEMPT=352*52; // €352/week threshold

function compute(){
  const inc=Math.max(0,parseFloat($('income').value)||0);
  const rate=parseFloat($('rate').value)||0.042;
  const prsi=window.NPH_2026 ? NPH_2026.prsiEmployee(inc,rate)
                             : (inc<=WEEKLY_EXEMPT?0:inc*rate);
  const wk=inc/52;
  const tapered = inc>WEEKLY_EXEMPT && wk<424;   // tapered EUR12/week credit still applies
  return {inc,rate,prsi,weekly:prsi/52,exempt:inc<=WEEKLY_EXEMPT,tapered};
}
function render(){
  const r=compute();
  $('prsi').textContent=fmt.format(r.prsi);
  $('weekLine').textContent=r.exempt?'exempt (≤ €352 / week)':'about '+fmt.format(r.weekly)+' / week';
  $('gp').textContent=fmt.format(r.inc);
  $('rt').textContent=(r.rate*100).toFixed(2).replace(/\.?0+$/,'')+'%';
  $('wk').textContent=fmt.format(r.weekly);
  $('prsi2').textContent=fmt.format(r.prsi);
  if(r.exempt){
    $('answerLine').innerHTML=`On <b>${fmt.format(r.inc)}</b>, you pay <b>no PRSI</b> — earnings of €352 a week or less are exempt in 2026.`;
  } else {
    const basis = r.tapered
      ? `${(r.rate*100).toFixed(2).replace(/\.?0+$/,'')}% of gross pay less the tapered PRSI credit`
      : `${(r.rate*100).toFixed(2).replace(/\.?0+$/,'')}% of gross pay`;
    $('answerLine').innerHTML=`On <b>${fmt.format(r.inc)}</b>, Class A PRSI is <b>${fmt.format(r.prsi)}</b> for 2026 (${basis}) — about ${fmt.format(r.weekly)} a week.`;
  }
  return r;
}
$('income').addEventListener('input',()=>{$('incomeRange').value=$('income').value;render();});
$('incomeRange').addEventListener('input',()=>{$('income').value=$('incomeRange').value;render();});
$('rate').addEventListener('input',render);
$('rate').addEventListener('change',render);
$('reset').addEventListener('click',()=>{$('income').value=50000;$('incomeRange').value=50000;$('rate').value='0.042';render();});

$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">PRSI — Ireland 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Gross pay</span><b>${fmt.format(r.inc)}</b></div>
       <div class="rrow"><span>PRSI rate (Class A)</span><b>${(r.rate*100).toFixed(2).replace(/\.?0+$/,'')}%</b></div>
       <div class="rrow"><span>Per week</span><b>${fmt.format(r.weekly)}</b></div>
       <div class="rrow rtot"><span>PRSI for the year</span><b>${fmt.format(r.prsi)}</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Class A employee PRSI only (excludes income tax and USC). 4.2% to 30 Sep 2026, 4.35% from 1 Oct 2026; exempt ≤ €352/week. Estimate based on Revenue.ie Budget 2026; not tax advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
