/* =================================================================
   CALCULATOR LOGIC
   To duplicate for another calculator, change: the calc() formula,
   the input IDs, the labels, the <title>/meta, and the JSON-LD.
   ================================================================= */
const $ = id => document.getElementById(id);
const fmt = new Intl.NumberFormat('en-IE', {style:'currency', currency:'EUR', maximumFractionDigits:0});

const els = {
  rate:$('rate'), rateRange:$('rateRange'), days:$('days'), weeks:$('weeks'),
  annual:$('annual'), monthly:$('monthly'), weekly:$('weekly'), answer:$('answer')
};

function readInputs(){
  return {
    rate: Math.max(0, parseFloat(els.rate.value) || 0),
    days: parseInt(els.days.value, 10) || 0,
    weeks: Math.min(52, Math.max(0, parseInt(els.weeks.value, 10) || 0))
  };
}

function calc(){
  const {rate, days, weeks} = readInputs();
  const annual = rate * days * weeks;
  const monthly = annual / 12;
  const weekly = rate * days;

  els.annual.textContent  = fmt.format(annual);
  els.monthly.textContent = fmt.format(monthly);
  els.weekly.textContent  = fmt.format(weekly);

  // dynamic GEO answer sentence
  els.answer.innerHTML =
    `A <b>${fmt.format(rate)}</b> day rate in Ireland equals about <b>${fmt.format(annual)}</b> per year, ` +
    `based on ${days} day${days===1?'':'s'} a week over ${weeks} working weeks (before tax).`;

  return {rate, days, weeks, annual, monthly, weekly};
}

/* keep number box and slider in sync */
els.rate.addEventListener('input', () => { els.rateRange.value = els.rate.value; calc(); });
els.rateRange.addEventListener('input', () => { els.rate.value = els.rateRange.value; calc(); });
els.days.addEventListener('input', calc);
els.weeks.addEventListener('input', calc);

$('reset').addEventListener('click', () => {
  els.rate.value = 400; els.rateRange.value = 400; els.days.value = '5'; els.weeks.value = 46; calc();
});

/* =================================================================
   PDF EXPORT — native print-to-PDF, 100% local (no third-party libs)
   Builds a clean report, then opens the browser's print/Save-as-PDF.
   ================================================================= */
$('pdf').addEventListener('click', () => {
  const d = calc();
  const today = new Date().toLocaleDateString('en-IE');
  $('report').innerHTML =
    `<div class="rband"><h2 style="margin:0">Day Rate → Salary Report</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · Ireland · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Day rate</span><b>${fmt.format(d.rate)}</b></div>
       <div class="rrow"><span>Days per week</span><b>${d.days}</b></div>
       <div class="rrow"><span>Working weeks per year</span><b>${d.weeks}</b></div>
       <div class="rrow"><span>Per week</span><b>${fmt.format(d.weekly)}</b></div>
       <div class="rrow"><span>Per month</span><b>${fmt.format(d.monthly)}</b></div>
       <div class="rrow rtot"><span>Equivalent gross salary</span><b>${fmt.format(d.annual)} / year</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Gross figures before PAYE, USC and PRSI. Estimate for planning only — not tax advice. Source for tax bands: revenue.ie. Generated locally in your browser — no data was sent or stored.</p>
     </div>`;
  window.print();
});

$('yr').textContent = new Date().getFullYear();
calc();
