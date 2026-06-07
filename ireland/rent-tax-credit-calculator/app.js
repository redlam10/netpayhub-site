/* Rent Tax Credit — Ireland 2026 (verified, revenue.ie).
   Credit = 20% of qualifying rent paid in the year, capped at €1,000 (single)
   or €2,000 (jointly assessed couple/civil partners). Also limited by your
   income tax liability (noted on-page; not modelled here).
   100% client-side: no fetch, no storage, no third-party scripts. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const CAP={single:1000, joint:2000};

function compute(){
  const monthly=Math.max(0,parseFloat($('rent').value)||0);
  const status=$('status').value;
  const annualRent=monthly*12;
  const cap=CAP[status];
  const twenty=annualRent*0.20;
  const credit=Math.min(twenty, cap);
  return {monthly,status,annualRent,cap,twenty,credit,capped:twenty>=cap};
}
function render(){
  const r=compute();
  $('credit').textContent=fmt.format(r.credit);
  $('bRent').textContent=fmt.format(r.annualRent);
  $('bPct').textContent=fmt.format(r.twenty);
  $('bCap').textContent=fmt.format(r.cap);
  $('bCredit').textContent=fmt.format(r.credit);
  const who=r.status==='single'?'a single renter':'a jointly assessed couple';
  const tail=r.capped
    ? `the full <b>${fmt.format(r.cap)}</b> — that's 20% of your rent, capped at ${fmt.format(r.cap)}.`
    : `<b>${fmt.format(r.credit)}</b> — that's 20% of the ${fmt.format(r.annualRent)} rent you paid.`;
  $('answerLine').innerHTML=
    `Paying <b>${fmt.format(r.monthly)}</b> a month (${fmt.format(r.annualRent)} a year) as ${who}, your 2026 rent tax credit is `+tail;
  return r;
}
$('rent').addEventListener('input',()=>{$('rentRange').value=$('rent').value;render();});
$('rentRange').addEventListener('input',()=>{$('rent').value=$('rentRange').value;render();});
$('status').addEventListener('input',render);
$('reset').addEventListener('click',()=>{$('rent').value=1400;$('rentRange').value=1400;$('status').value='single';render();});

$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Rent Tax Credit — Ireland 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Monthly rent</span><b>${fmt.format(r.monthly)}</b></div>
       <div class="rrow"><span>Rent paid in the year</span><b>${fmt.format(r.annualRent)}</b></div>
       <div class="rrow"><span>20% of rent</span><b>${fmt.format(r.twenty)}</b></div>
       <div class="rrow"><span>Maximum credit (${r.status==='single'?'single':'jointly assessed'})</span><b>${fmt.format(r.cap)}</b></div>
       <div class="rrow rtot"><span>Your rent tax credit</span><b>${fmt.format(r.credit)}</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Credit is 20% of qualifying rent up to the cap, and cannot exceed your income tax for the year. Tenancy must be RTB-registered (private landlord). Per revenue.ie 2026; not tax advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
