/* Freelance hourly/day rate to charge — pure client-side arithmetic, no tax data. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const els={income:$('income'),incomeRange:$('incomeRange'),days:$('days'),overhead:$('overhead'),dayrate:$('dayrate'),hourly:$('hourly'),revenue:$('revenue'),answer:$('answer')};

function read(){
  return {
    income: Math.max(0, parseFloat(els.income.value)||0),
    days: Math.max(1, parseFloat(els.days.value)||1),
    overhead: Math.max(0, parseFloat(els.overhead.value)||0)
  };
}
function calc(){
  const {income,days,overhead}=read();
  const revenue=income*(1+overhead/100);
  const dayrate=revenue/days;
  const hourly=dayrate/8;
  els.revenue.textContent=fmt.format(revenue);
  els.dayrate.textContent=fmt.format(dayrate);
  els.hourly.textContent=fmt.format(hourly);
  els.answer.innerHTML=`To take home <b>${fmt.format(income)}</b> with ${overhead}% overhead over ${days} billable days, charge about <b>${fmt.format(dayrate)}</b> a day — roughly <b>${fmt.format(hourly)}</b> an hour.`;
  return {income,days,overhead,revenue,dayrate,hourly};
}
els.income.addEventListener('input',()=>{els.incomeRange.value=els.income.value;calc();});
els.incomeRange.addEventListener('input',()=>{els.income.value=els.incomeRange.value;calc();});
els.days.addEventListener('input',calc);
els.overhead.addEventListener('input',calc);
$('reset').addEventListener('click',()=>{els.income.value=60000;els.incomeRange.value=60000;els.days.value=220;els.overhead.value=20;calc();});

$('pdf').addEventListener('click',()=>{
  const d=calc();
  const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Freelance Rate to Charge</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · Ireland · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Target annual income</span><b>${fmt.format(d.income)}</b></div>
       <div class="rrow"><span>Overhead</span><b>${d.overhead}%</b></div>
       <div class="rrow"><span>Billable days per year</span><b>${d.days}</b></div>
       <div class="rrow"><span>Revenue needed</span><b>${fmt.format(d.revenue)}</b></div>
       <div class="rrow"><span>Hourly rate (8h day)</span><b>${fmt.format(d.hourly)}</b></div>
       <div class="rrow rtot"><span>Day rate to charge</span><b>${fmt.format(d.dayrate)}</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">A pricing aid before tax. Pure arithmetic — no tax data used. Generated locally in your browser. netpayhub.com</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
calc();
