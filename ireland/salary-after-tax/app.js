/* =================================================================
   100% CLIENT-SIDE TAX ENGINE — Ireland 2026 (Budget 2026 bands)
   No fetch(), no storage, no third-party scripts: data stays local.
   ================================================================= */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});

const CUTOFF={single:44000, married1:53000};
const CREDITS={single:4000, married1:6000};   // personal + employee PAYE credit
const USC_EXEMPT=13000, PRSI_RATE=0.042, PRSI_WEEKLY_EXEMPT=352*52;

function band(amount, lower, upper, rate){ return Math.max(0, Math.min(amount,upper)-lower)*rate; }

function compute(){
  const gross=Math.max(0,parseFloat($('gross').value)||0);
  const status=$('status').value;
  const pensionPct=Math.min(40,Math.max(0,parseFloat($('pension').value)||0));
  const pension=gross*pensionPct/100;

  // Income tax (pension reduces the IT base only)
  const itBase=Math.max(0,gross-pension);
  const cut=CUTOFF[status];
  const grossIT=Math.min(itBase,cut)*0.20 + Math.max(0,itBase-cut)*0.40;
  const incomeTax=Math.max(0,grossIT-CREDITS[status]);

  // USC (on gross, exempt if total <= 13,000)
  let usc=0;
  if(gross>USC_EXEMPT){
    usc = band(gross,0,12012,0.005)
        + band(gross,12012,28700,0.02)
        + band(gross,28700,70044,0.03)
        + band(gross,70044,Infinity,0.08);
  }

  // PRSI
  const prsi = gross<=PRSI_WEEKLY_EXEMPT ? 0 : gross*PRSI_RATE;

  const totalDed=incomeTax+usc+prsi;
  const net=Math.max(0,gross-totalDed);
  return {gross,status,pension,incomeTax,usc,prsi,net,monthly:net/12,eff:gross?totalDed/gross:0};
}

function render(){
  const r=compute();
  $('netAnnual').textContent=fmt.format(r.net);
  $('netMonthly').textContent=fmt.format(r.monthly)+' / month';
  $('it').textContent=fmt.format(r.incomeTax);
  $('usc').textContent=fmt.format(r.usc);
  $('prsi').textContent=fmt.format(r.prsi);
  $('net2').textContent=fmt.format(r.net);
  $('effrate').textContent=(r.eff*100).toFixed(1)+'% effective rate';
  const label = r.status==='single' ? 'single' : 'married (one income)';
  $('answerLine').innerHTML=
    `A <b>${fmt.format(r.gross)}</b> ${label} salary in Ireland gives about <b>${fmt.format(r.net)}</b> take-home per year `+
    `(<b>${fmt.format(r.monthly)}</b>/month) after income tax, USC and PRSI in 2026.`;
  return r;
}

$('gross').addEventListener('input',()=>{$('grossRange').value=$('gross').value;render();});
$('grossRange').addEventListener('input',()=>{$('gross').value=$('grossRange').value;render();});
$('status').addEventListener('input',render);
$('pension').addEventListener('input',render);
$('reset').addEventListener('click',()=>{$('gross').value=50000;$('grossRange').value=50000;$('status').value='single';$('pension').value=0;render();});

/* Native print-to-PDF — builds a clean report, still 100% local */
$('pdf').addEventListener('click',()=>{
  const r=render();
  const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Ireland Net Salary Report — 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Gross annual salary</span><b>${fmt.format(r.gross)}</b></div>
       <div class="rrow"><span>Income tax (PAYE)</span><b>${fmt.format(r.incomeTax)}</b></div>
       <div class="rrow"><span>USC</span><b>${fmt.format(r.usc)}</b></div>
       <div class="rrow"><span>PRSI</span><b>${fmt.format(r.prsi)}</b></div>
       <div class="rrow rtot"><span>Take-home pay</span><b>${fmt.format(r.net)} / yr · ${fmt.format(r.monthly)} / mo</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Effective tax rate ${(r.eff*100).toFixed(1)}%. Estimate based on Revenue.ie Budget 2026 bands; not tax advice. Generated locally in your browser — no data was sent or stored.</p>
     </div>`;
  window.print();
});

$('yr').textContent=new Date().getFullYear();
render();
