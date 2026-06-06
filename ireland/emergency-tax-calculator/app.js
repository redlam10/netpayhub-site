/* =================================================================
   100% CLIENT-SIDE EMERGENCY-TAX ENGINE — Ireland 2026
   Emergency basis per Revenue.ie:
     • PPSN given, periods 1-4: 20% up to the period's rate band
       (€44,000/yr single basis), 40% above, NO tax credits.
     • PPSN given, period 5+   : 40% on all income.
     • No PPSN, any period      : 40% on all income.
     • Emergency USC            : flat 8% on all income.
     • PRSI                     : Class A 4.2% (unchanged by emergency basis;
                                  exempt if weekly pay <= €352).
   "Normal" comparison uses the standard 2026 bands + single credits to
   estimate the over-deduction (refund) you can reclaim.
   No fetch(), no storage, no third-party scripts: data stays local.
   ================================================================= */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const fmt2=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});

const ANNUAL_BAND=44000;          // single standard-rate cut-off (2026)
const SINGLE_CREDITS=4000;        // personal €2,000 + employee PAYE €2,000
const PERIODS={weekly:52, fortnightly:26, monthly:12};
const PERIOD_NOUN={weekly:'week', fortnightly:'fortnight', monthly:'month'};

function band(a,lo,hi,r){return Math.max(0,Math.min(a,hi)-lo)*r;}

// Normal annual deductions for a single PAYE worker (for the refund comparison)
function normalAnnual(annualGross){
  const it=Math.max(0, (Math.min(annualGross,ANNUAL_BAND)*0.20 + Math.max(0,annualGross-ANNUAL_BAND)*0.40) - SINGLE_CREDITS);
  let usc=0;
  if(annualGross>13000){
    usc=band(annualGross,0,12012,0.005)+band(annualGross,12012,28700,0.02)
       +band(annualGross,28700,70044,0.03)+band(annualGross,70044,Infinity,0.08);
  }
  const prsi=annualGross<=352*52?0:annualGross*0.042;
  return it+usc+prsi;
}

function emergencyTaxForPeriod(g, idx, ppsn, bandPerPeriod){
  if(!ppsn) return g*0.40;                 // no PPSN -> 40% from period 1
  if(idx<=4) return Math.min(g,bandPerPeriod)*0.20 + Math.max(0,g-bandPerPeriod)*0.40;
  return g*0.40;                           // period 5+ -> all at 40%
}

function compute(){
  const g=Math.max(0,parseFloat($('gross').value)||0);
  const freq=$('freq').value;
  const ppsn=$('ppsn').value==='yes';
  const periods=Math.min(52,Math.max(1,Math.round(parseFloat($('periods').value)||1)));
  const ppy=PERIODS[freq];
  const bandPerPeriod=ANNUAL_BAND/ppy;
  const weeklyEquiv=g*ppy/52;
  const prsi=weeklyEquiv<=352?0:g*0.042;
  const usc=g*0.08;                        // emergency USC flat 8%

  // current (latest) period = period number `periods`
  const taxNow=emergencyTaxForPeriod(g,periods,ppsn,bandPerPeriod);
  const dedNow=taxNow+usc+prsi;
  const netNow=Math.max(0,g-dedNow);

  // refund estimate: sum over-deduction across all periods so far vs normal
  const normalPerPeriod=normalAnnual(g*ppy)/ppy;
  let over=0;
  for(let i=1;i<=periods;i++){
    const ded=emergencyTaxForPeriod(g,i,ppsn,bandPerPeriod)+usc+prsi;
    over+=Math.max(0, ded-normalPerPeriod);
  }
  return {g,freq,ppy,ppsn,periods,bandPerPeriod,taxNow,usc,prsi,dedNow,netNow,
          normalPerPeriod,over,noun:PERIOD_NOUN[freq]};
}

function render(){
  const r=compute();
  $('netPeriod').textContent=fmt.format(r.netNow);
  $('netSub').textContent='take-home this '+r.noun;
  $('etax').textContent='– '+fmt.format(r.taxNow);
  $('eusc').textContent='– '+fmt.format(r.usc);
  $('eprsi').textContent='– '+fmt.format(r.prsi);
  $('enet').textContent=fmt.format(r.netNow);
  $('refundBig').textContent=fmt.format(r.over);
  $('refundSub').textContent='over-deducted across '+r.periods+' '+r.noun+(r.periods>1?'s':'')+' — reclaimable';
  const extra=Math.max(0, r.dedNow-r.normalPerPeriod);
  $('answerLine').innerHTML=
    `On <b>${fmt.format(r.g)}</b> a ${r.noun} ${r.ppsn?'with your PPSN registered':'with no PPSN given'}, `+
    `emergency tax leaves you about <b>${fmt.format(r.netNow)}</b> this ${r.noun}. `+
    `That's roughly <b>${fmt.format(extra)}</b> a ${r.noun} more than normal tax — about `+
    `<b>${fmt.format(r.over)}</b> over-deducted so far, which you can reclaim once your tax record is sorted.`;
  return r;
}

$('gross').addEventListener('input',()=>{$('grossRange').value=$('gross').value;render();});
$('grossRange').addEventListener('input',()=>{$('gross').value=$('grossRange').value;render();});
$('freq').addEventListener('input',render);
$('ppsn').addEventListener('input',render);
$('periods').addEventListener('input',render);
$('reset').addEventListener('click',()=>{
  $('gross').value=1000;$('grossRange').value=1000;$('freq').value='weekly';
  $('ppsn').value='yes';$('periods').value=2;render();
});

/* Native print-to-PDF — clean report, still 100% local */
$('pdf').addEventListener('click',()=>{
  const r=render();
  const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Ireland Emergency Tax Report — 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Gross pay (per ${r.noun})</span><b>${fmt.format(r.g)}</b></div>
       <div class="rrow"><span>Emergency income tax</span><b>${fmt.format(r.taxNow)}</b></div>
       <div class="rrow"><span>Emergency USC (8%)</span><b>${fmt.format(r.usc)}</b></div>
       <div class="rrow"><span>PRSI</span><b>${fmt.format(r.prsi)}</b></div>
       <div class="rrow rtot"><span>Take-home this ${r.noun}</span><b>${fmt.format(r.netNow)}</b></div>
       <div class="rrow"><span>Estimated over-deduction (${r.periods} ${r.noun}${r.periods>1?'s':''})</span><b>${fmt.format(r.over)}</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Emergency basis per Revenue.ie 2026. Refund is an estimate of tax over-deducted vs normal single-person tax; your actual refund depends on your credits and circumstances. Generated locally in your browser — no data was sent or stored.</p>
     </div>`;
  window.print();
});

$('yr').textContent=new Date().getFullYear();
render();
