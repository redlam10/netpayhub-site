/* Overtime pay — pure client-side arithmetic, no tax data. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const fmt2=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2});
const els={rate:$('rate'),rateRange:$('rateRange'),othours:$('othours'),mult:$('mult'),total:$('total'),otrate:$('otrate'),othrs:$('othrs'),answer:$('answer')};
const NAMES={'1.25':'a quarter extra (1.25×)','1.5':'time-and-a-half (1.5×)','2':'double time (2×)','2.5':'2.5×','3':'triple time (3×)'};

function read(){
  return {
    rate: Math.max(0, parseFloat(els.rate.value)||0),
    othours: Math.max(0, parseFloat(els.othours.value)||0),
    mult: parseFloat(els.mult.value)||1
  };
}
function calc(){
  const {rate,othours,mult}=read();
  const otrate=rate*mult;
  const total=otrate*othours;
  els.otrate.textContent=fmt2.format(otrate);
  els.total.textContent=fmt.format(total);
  els.othrs.textContent=othours;
  els.answer.innerHTML=`At <b>${fmt2.format(rate)}</b> an hour, ${NAMES[els.mult.value]||(mult+'×')} for ${othours} overtime hours pays <b>${fmt2.format(otrate)}</b> an hour — a total of <b>${fmt.format(total)}</b>.`;
  return {rate,othours,mult,otrate,total};
}
els.rate.addEventListener('input',()=>{els.rateRange.value=els.rate.value;calc();});
els.rateRange.addEventListener('input',()=>{els.rate.value=els.rateRange.value;calc();});
els.othours.addEventListener('input',calc);
els.mult.addEventListener('input',calc);
els.mult.addEventListener('change',calc);
$('reset').addEventListener('click',()=>{els.rate.value=20;els.rateRange.value=20;els.othours.value=5;els.mult.value='1.5';calc();});

$('pdf').addEventListener('click',()=>{
  const d=calc();
  const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Overtime Pay</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · Ireland · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Hourly rate</span><b>${fmt2.format(d.rate)}</b></div>
       <div class="rrow"><span>Multiplier</span><b>${d.mult}×</b></div>
       <div class="rrow"><span>Overtime hours</span><b>${d.othours}</b></div>
       <div class="rrow"><span>Overtime rate</span><b>${fmt2.format(d.otrate)}</b></div>
       <div class="rrow rtot"><span>Total overtime pay (gross)</span><b>${fmt.format(d.total)}</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Gross figures before tax. Pure arithmetic — no tax data used. Generated locally in your browser. netpayhub.com</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
calc();
