/* Hourly → Annual salary — pure client-side arithmetic, no tax data. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const els={rate:$('rate'),rateRange:$('rateRange'),hours:$('hours'),weeks:$('weeks'),annual:$('annual'),monthly:$('monthly'),weekly:$('weekly'),answer:$('answer')};

function read(){
  return {
    rate: Math.max(0, parseFloat(els.rate.value)||0),
    hours: Math.max(0, parseFloat(els.hours.value)||0),
    weeks: Math.min(52, Math.max(0, parseFloat(els.weeks.value)||0))
  };
}
function calc(){
  const {rate,hours,weeks}=read();
  const weekly=rate*hours;
  const annual=weekly*weeks;
  const monthly=annual/12;
  els.annual.textContent=fmt.format(annual);
  els.monthly.textContent=fmt.format(monthly);
  els.weekly.textContent=fmt.format(weekly);
  els.answer.innerHTML=`At <b>${fmt.format(rate)}</b> per hour for ${hours} hours a week over ${weeks} weeks, that's <b>${fmt.format(annual)}</b> a year (about <b>${fmt.format(monthly)}</b> a month).`;
  return {rate,hours,weeks,annual,monthly,weekly};
}
els.rate.addEventListener('input',()=>{els.rateRange.value=els.rate.value;calc();});
els.rateRange.addEventListener('input',()=>{els.rate.value=els.rateRange.value;calc();});
els.hours.addEventListener('input',calc);
els.weeks.addEventListener('input',calc);
$('reset').addEventListener('click',()=>{els.rate.value=20;els.rateRange.value=20;els.hours.value=40;els.weeks.value=52;calc();});

$('pdf').addEventListener('click',()=>{
  const d=calc();
  const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Hourly to Annual Salary</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · Ireland · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Hourly rate</span><b>${fmt.format(d.rate)}</b></div>
       <div class="rrow"><span>Hours per week</span><b>${d.hours}</b></div>
       <div class="rrow"><span>Weeks per year</span><b>${d.weeks}</b></div>
       <div class="rrow"><span>Per week</span><b>${fmt.format(d.weekly)}</b></div>
       <div class="rrow"><span>Per month</span><b>${fmt.format(d.monthly)}</b></div>
       <div class="rrow rtot"><span>Annual salary (gross)</span><b>${fmt.format(d.annual)}</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Gross figures before tax. Pure arithmetic — no tax data used. Generated locally in your browser. netpayhub.com</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
calc();
