/* Annual salary → hourly/daily — pure client-side arithmetic, no tax data. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const fmt2=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2});
const els={salary:$('salary'),salaryRange:$('salaryRange'),hours:$('hours'),weeks:$('weeks'),hourly:$('hourly'),daily:$('daily'),weekly:$('weekly'),answer:$('answer')};

function read(){
  return {
    salary: Math.max(0, parseFloat(els.salary.value)||0),
    hours: Math.max(1, parseFloat(els.hours.value)||1),
    weeks: Math.min(52, Math.max(1, parseFloat(els.weeks.value)||1))
  };
}
function calc(){
  const {salary,hours,weeks}=read();
  const weekly=salary/weeks;
  const hourly=salary/(hours*weeks);
  const daily=weekly/5;
  els.hourly.textContent=fmt2.format(hourly);
  els.daily.textContent=fmt.format(daily);
  els.weekly.textContent=fmt.format(weekly);
  els.answer.innerHTML=`A <b>${fmt.format(salary)}</b> salary over ${hours} hours a week for ${weeks} weeks works out at <b>${fmt2.format(hourly)}</b> per hour, or about <b>${fmt.format(daily)}</b> a day.`;
  return {salary,hours,weeks,weekly,hourly,daily};
}
els.salary.addEventListener('input',()=>{els.salaryRange.value=els.salary.value;calc();});
els.salaryRange.addEventListener('input',()=>{els.salary.value=els.salaryRange.value;calc();});
els.hours.addEventListener('input',calc);
els.weeks.addEventListener('input',calc);
$('reset').addEventListener('click',()=>{els.salary.value=41600;els.salaryRange.value=41600;els.hours.value=40;els.weeks.value=52;calc();});

$('pdf').addEventListener('click',()=>{
  const d=calc();
  const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Salary to Hourly Rate</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · Ireland · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Annual salary</span><b>${fmt.format(d.salary)}</b></div>
       <div class="rrow"><span>Hours per week</span><b>${d.hours}</b></div>
       <div class="rrow"><span>Weeks per year</span><b>${d.weeks}</b></div>
       <div class="rrow"><span>Per week</span><b>${fmt.format(d.weekly)}</b></div>
       <div class="rrow"><span>Per day (5-day week)</span><b>${fmt.format(d.daily)}</b></div>
       <div class="rrow rtot"><span>Hourly rate (gross)</span><b>${fmt2.format(d.hourly)}</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Gross figures before tax. Pure arithmetic — no tax data used. Generated locally in your browser. netpayhub.com</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
calc();
