/* Joint Assessment (married couple) take-home — Ireland 2026.
   Income tax is jointly assessed: combined 20% band = €53,000 + the LOWER of
   €35,000 or the lower earner's income (max €88,000 at 20%). USC and PRSI are
   assessed INDIVIDUALLY on each spouse. Credits: €4,000 personal + €2,000
   Employee (PAYE) credit per earner. Uses the shared verified engine for the
   individual USC/PRSI and the single-assessment comparison.
   100% client-side: no fetch, no storage, no third-party scripts. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const T=window.NPH_2026;

function jointTax(a,b){
  const lower=Math.min(a,b);
  const earners=(a>0?1:0)+(b>0?1:0);
  const band=53000+Math.min(35000,lower);
  const combined=a+b;
  const grossIT=Math.min(combined,band)*0.20+Math.max(0,combined-band)*0.40;
  const credits=4000+2000*earners;
  const it=Math.max(0,grossIT-credits);
  const usc=T.usc(a,false)+T.usc(b,false);      // USC is individual
  const prsi=T.prsiEmployee(a)+T.prsiEmployee(b);// PRSI is individual
  const total=it+usc+prsi;
  return {combined,band,it,usc,prsi,total,net:combined-total};
}
function compute(){
  const a=Math.max(0,parseFloat($('inc1').value)||0);
  const b=Math.max(0,parseFloat($('inc2').value)||0);
  const j=jointTax(a,b);
  // comparison: taxed separately as two single people
  const sep=T.employeeNet(a,'single',0).net + T.employeeNet(b,'single',0).net;
  const saving=Math.max(0, j.net-sep);
  return {a,b,...j,separateNet:sep,saving,monthly:j.net/12,
          eff:j.combined?j.total/j.combined:0};
}
function render(){
  const r=compute();
  $('netAnnual').textContent=fmt.format(r.net);
  $('netMonthly').textContent=fmt.format(r.monthly)+' / month combined';
  $('combined').textContent=fmt.format(r.combined);
  $('it').textContent='– '+fmt.format(r.it);
  $('usc').textContent='– '+fmt.format(r.usc);
  $('prsi').textContent='– '+fmt.format(r.prsi);
  $('net2').textContent=fmt.format(r.net);
  $('saveBig').textContent=r.saving>=1?fmt.format(r.saving):'€0';
  $('saveSub').textContent=r.saving>=1
    ? 'a year vs being taxed as two single people'
    : 'no benefit at these incomes (both use their full band)';
  $('answerLine').innerHTML=
    `A jointly assessed couple earning <b>${fmt.format(r.a)}</b> and <b>${fmt.format(r.b)}</b> `+
    `keeps about <b>${fmt.format(r.net)}</b> a year combined (<b>${fmt.format(r.monthly)}</b>/month) after income tax, USC and PRSI`+
    (r.saving>=1?` — roughly <b>${fmt.format(r.saving)}</b> more than if they were taxed separately.`:`.`);
  return r;
}
$('inc1').addEventListener('input',render);
$('inc2').addEventListener('input',render);
$('reset').addEventListener('click',()=>{$('inc1').value=55000;$('inc2').value=30000;render();});

$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Joint Assessment Take-Home — Ireland 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Spouse 1 income</span><b>${fmt.format(r.a)}</b></div>
       <div class="rrow"><span>Spouse 2 income</span><b>${fmt.format(r.b)}</b></div>
       <div class="rrow"><span>Combined gross</span><b>${fmt.format(r.combined)}</b></div>
       <div class="rrow"><span>Income tax (PAYE)</span><b>${fmt.format(r.it)}</b></div>
       <div class="rrow"><span>USC (both)</span><b>${fmt.format(r.usc)}</b></div>
       <div class="rrow"><span>PRSI (both)</span><b>${fmt.format(r.prsi)}</b></div>
       <div class="rrow rtot"><span>Combined take-home</span><b>${fmt.format(r.net)} / yr · ${fmt.format(r.monthly)} / mo</b></div>
       <div class="rrow"><span>Saving vs separate assessment</span><b>${fmt.format(r.saving)}</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Joint-assessment bands per Revenue.ie 2026 (€53,000 + up to €35,000 transferable). Assumes two PAYE employees, no pension. Not tax advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
