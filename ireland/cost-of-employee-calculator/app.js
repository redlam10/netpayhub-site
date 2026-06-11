/* Cost of an employee — Ireland 2026 (employer view).
   Verified rules:
     • Employer PRSI (Class A): one rate on ALL pay, set by the weekly pay level.
       1 Jan – 30 Sep 2026: 9% where weekly pay ≤ €552, otherwise 11.25%.
       From 1 Oct 2026:     9.15% / 11.4% at the same €552 threshold.
     • Auto-enrolment (My Future Fund): employer contributes 1.5% of gross
       (2026–2028 rate, rising to 6% by year 10) on pay up to €80,000 — for
       eligible staff not already in a payroll pension scheme.
   Total statutory cost = salary + employer PRSI + employer auto-enrolment.
   100% client-side: no fetch, no storage, no third-party scripts. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});

const PERIODS={
  jan:{lo:0.09,  hi:0.1125, label:'Jan–Sep 2026'},
  oct:{lo:0.0915,hi:0.114,  label:'from 1 Oct 2026'}
};
const WEEKLY_THRESHOLD=552, AE_RATE=0.015, AE_CAP=80000;

function compute(){
  const salary=Math.max(0,parseFloat($('salary').value)||0);
  const per=PERIODS[$('period').value]||PERIODS.jan;
  const ae=$('ae').value==='yes';
  const weekly=salary/52;
  const rate=weekly>WEEKLY_THRESHOLD?per.hi:per.lo;
  const prsi=salary*rate;
  const aeAmt=ae?Math.min(salary,AE_CAP)*AE_RATE:0;
  const total=salary+prsi+aeAmt;
  return {salary,per,ae,weekly,rate,prsi,aeAmt,total,monthly:total/12,
          over:(total/salary-1)*100||0};
}
function render(){
  const r=compute();
  $('totalCost').textContent=fmt.format(r.total);
  $('totalSub').textContent=fmt.format(r.monthly)+' / month · '+r.over.toFixed(1)+'% on top of salary';
  $('bSalary').textContent=fmt.format(r.salary);
  $('bPrsi').textContent='+ '+fmt.format(r.prsi);
  $('prsiTag').textContent=(r.rate*100).toFixed(2).replace(/\.?0+$/,'')+'%';
  $('aeRow').style.display=r.ae?'':'none';
  $('bAe').textContent='+ '+fmt.format(r.aeAmt);
  $('bTotal').textContent=fmt.format(r.total);
  $('answerLine').innerHTML=
    `An employee on <b>${fmt.format(r.salary)}</b> costs the employer about <b>${fmt.format(r.total)}</b> a year (${r.per.label}) — `+
    `the salary plus <b>${fmt.format(r.prsi)}</b> employer PRSI at ${(r.rate*100).toFixed(2).replace(/\.?0+$/,'')}%`+
    (r.ae?` and <b>${fmt.format(r.aeAmt)}</b> auto-enrolment pension contribution`:``)+
    `. That's roughly <b>${r.over.toFixed(1)}%</b> on top of the gross salary, before equipment, insurance or benefits.`;
  return r;
}
$('salary').addEventListener('input',()=>{$('salaryRange').value=$('salary').value;render();});
$('salaryRange').addEventListener('input',()=>{$('salary').value=$('salaryRange').value;render();});
$('period').addEventListener('input',render);
$('ae').addEventListener('input',render);
$('reset').addEventListener('click',()=>{$('salary').value=40000;$('salaryRange').value=40000;$('period').value='jan';$('ae').value='yes';render();});

/* Native print-to-PDF — clean report, still 100% local */
$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Cost of an Employee — Ireland 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Gross salary</span><b>${fmt.format(r.salary)}</b></div>
       <div class="rrow"><span>Employer PRSI (${(r.rate*100).toFixed(2).replace(/\.?0+$/,'')}%, ${r.per.label})</span><b>${fmt.format(r.prsi)}</b></div>
       ${r.ae?`<div class="rrow"><span>Auto-enrolment employer contribution (1.5%)</span><b>${fmt.format(r.aeAmt)}</b></div>`:''}
       <div class="rrow rtot"><span>Total statutory cost</span><b>${fmt.format(r.total)} / yr · ${fmt.format(r.monthly)} / mo</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Statutory payroll cost only — excludes benefits, insurance, equipment, training and holiday cover. Employer PRSI per Budget 2026 (9%/11.25% to Sep, 9.15%/11.4% from 1 Oct; €552/week threshold). Auto-enrolment employer rate 1.5% (2026–2028). Not professional advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
