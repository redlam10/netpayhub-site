/* Auto-enrolment (My Future Fund) calculator — Ireland 2026.
   Verified rules (gov.ie / citizensinformation.ie):
     • Scheme started 1 January 2026. Eligible: employees aged 23–60 earning
       over €20,000/yr who aren't already in a payroll pension.
     • Contribution rates phase in (employee / employer / State):
         Years 1–3 (2026–28): 1.5% / 1.5% / 0.5%
         Years 4–6 (2029–31): 3%   / 3%   / 1%
         Years 7–9 (2032–34): 4.5% / 4.5% / 1.5%
         Year 10+  (2035+)  : 6%   / 6%   / 2%
     • Contributions apply to gross pay up to €80,000/yr.
     • NO income tax relief on employee contributions — the State top-up
       (€1 per €3) replaces it, so the cost comes straight from net pay.
   100% client-side: no fetch, no storage, no third-party scripts. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const fmt2=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:2});

const PHASES={
  p1:{emp:0.015, er:0.015, st:0.005, label:'2026–2028 (years 1–3)'},
  p2:{emp:0.03,  er:0.03,  st:0.01,  label:'2029–2031 (years 4–6)'},
  p3:{emp:0.045, er:0.045, st:0.015, label:'2032–2034 (years 7–9)'},
  p4:{emp:0.06,  er:0.06,  st:0.02,  label:'2035+ (year 10 on)'}
};
const CAP=80000, MIN_ELIGIBLE=20000;

function compute(){
  const salary=Math.max(0,parseFloat($('salary').value)||0);
  const ph=PHASES[$('phase').value]||PHASES.p1;
  const base=Math.min(salary,CAP);
  const emp=base*ph.emp, er=base*ph.er, st=base*ph.st;
  const pot=emp+er+st;
  return {salary,ph,base,emp,er,st,pot,empMonthly:emp/12,potMonthly:pot/12,
          capped:salary>CAP, eligible:salary>MIN_ELIGIBLE};
}
function render(){
  const r=compute();
  $('youPay').textContent=fmt.format(r.emp);
  $('youPaySub').textContent=fmt2.format(r.empMonthly)+' / month from your take-home';
  $('bEmp').textContent=fmt.format(r.emp);
  $('bEr').textContent='+ '+fmt.format(r.er);
  $('bSt').textContent='+ '+fmt.format(r.st);
  $('bPot').textContent=fmt.format(r.pot);
  $('capNote').style.display=r.capped?'':'none';
  $('eligNote').style.display=r.eligible?'none':'';
  $('answerLine').innerHTML=
    `On <b>${fmt.format(r.salary)}</b> in ${r.ph.label.split(' ')[0]}, auto-enrolment costs you <b>${fmt.format(r.emp)}</b> a year `+
    `(<b>${fmt2.format(r.empMonthly)}</b>/month) from your take-home pay — and with your employer's ${fmt.format(r.er)} `+
    `plus the State's ${fmt.format(r.st)}, a total of <b>${fmt.format(r.pot)}</b> goes into your pension pot each year.`;
  return r;
}
$('salary').addEventListener('input',()=>{$('salaryRange').value=$('salary').value;render();});
$('salaryRange').addEventListener('input',()=>{$('salary').value=$('salaryRange').value;render();});
$('phase').addEventListener('input',render);
$('reset').addEventListener('click',()=>{$('salary').value=50000;$('salaryRange').value=50000;$('phase').value='p1';render();});

/* Native print-to-PDF — clean report, still 100% local */
$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Auto-Enrolment (My Future Fund) — Ireland</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Gross salary</span><b>${fmt.format(r.salary)}</b></div>
       <div class="rrow"><span>Phase</span><b>${r.ph.label}</b></div>
       <div class="rrow"><span>Your contribution (from net pay)</span><b>${fmt.format(r.emp)} / yr · ${fmt2.format(r.empMonthly)} / mo</b></div>
       <div class="rrow"><span>Employer contribution</span><b>${fmt.format(r.er)}</b></div>
       <div class="rrow"><span>State top-up</span><b>${fmt.format(r.st)}</b></div>
       <div class="rrow rtot"><span>Total into your pot per year</span><b>${fmt.format(r.pot)}</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Contributions apply to gross pay up to €80,000. Employee contributions get no income tax relief — the State top-up (€1 per €3) replaces it. Per gov.ie / My Future Fund rules; not financial advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
