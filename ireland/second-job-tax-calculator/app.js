/* Second job tax — Ireland 2026. Income tax and USC are charged on your TOTAL
   income (credits and bands apply once); PRSI is per employment (a job paying
   €352/week or less is exempt for that job). Uses the shared verified 2026
   engine (window.NPH_2026). The "extra tax on job 2" = tax on both jobs minus
   tax on job 1 alone — i.e. the true marginal cost of the second job.
   100% client-side: no fetch, no storage, no third-party scripts. */
const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
const T=window.NPH_2026;

function deductions(total,status,j1,j2){
  const it=Math.max(0,T.incomeTaxGross(total,status)-T.credits(status));
  const u=T.usc(total,false);
  const p=T.prsiEmployee(j1)+T.prsiEmployee(j2);   // PRSI is per job
  return it+u+p;
}
function compute(){
  const j1=Math.max(0,parseFloat($('job1').value)||0);
  const j2=Math.max(0,parseFloat($('job2').value)||0);
  const status=$('status').value;
  const total=j1+j2;
  const dedBoth=deductions(total,status,j1,j2);
  const dedJob1=deductions(j1,status,j1,0);
  const extra=Math.max(0,dedBoth-dedJob1);
  const keep=Math.max(0,j2-extra);
  const net=total-dedBoth;
  const rate=j2>0?extra/j2:0;
  return {j1,j2,status,total,dedBoth,extra,keep,net,monthly:net/12,rate};
}
function render(){
  const r=compute();
  $('netAnnual').textContent=fmt.format(r.net);
  $('netMonthly').textContent=fmt.format(r.monthly)+' / month combined';
  $('bTotal').textContent=fmt.format(r.total);
  $('bDed').textContent='– '+fmt.format(r.dedBoth);
  $('bNet').textContent=fmt.format(r.net);
  $('keepBig').textContent=fmt.format(r.keep);
  $('keepSub').textContent='of your '+fmt.format(r.j2)+' second job, after '+fmt.format(r.extra)+' tax ('+(r.rate*100).toFixed(0)+'%)';
  $('answerLine').innerHTML=
    `Earning <b>${fmt.format(r.j1)}</b> in your main job and <b>${fmt.format(r.j2)}</b> in a second job, you keep about `+
    `<b>${fmt.format(r.keep)}</b> of the second job's pay — the extra tax it triggers is <b>${fmt.format(r.extra)}</b> `+
    `(${(r.rate*100).toFixed(0)}%), and your combined take-home is <b>${fmt.format(r.net)}</b> a year. `+
    `You're never taxed "double" — but you may need to split your credits in myAccount so the right amount comes out of each payslip.`;
  return r;
}
$('job1').addEventListener('input',()=>{$('job1Range').value=$('job1').value;render();});
$('job1Range').addEventListener('input',()=>{$('job1').value=$('job1Range').value;render();});
$('job2').addEventListener('input',()=>{$('job2Range').value=$('job2').value;render();});
$('job2Range').addEventListener('input',()=>{$('job2').value=$('job2Range').value;render();});
$('status').addEventListener('input',render);
$('reset').addEventListener('click',()=>{$('job1').value=40000;$('job1Range').value=40000;$('job2').value=15000;$('job2Range').value=15000;$('status').value='single';render();});

/* Native print-to-PDF — clean report, still 100% local */
$('pdf').addEventListener('click',()=>{
  const r=render();const today=new Date().toLocaleDateString('en-IE');
  $('report').innerHTML=
    `<div class="rband"><h2 style="margin:0">Second Job Tax — Ireland 2026</h2>
       <div style="opacity:.9;font-size:13px">NetPayHub · ${today}</div></div>
     <div style="padding:18px 4px">
       <div class="rrow"><span>Main job (gross)</span><b>${fmt.format(r.j1)}</b></div>
       <div class="rrow"><span>Second job (gross)</span><b>${fmt.format(r.j2)}</b></div>
       <div class="rrow"><span>Total deductions (tax, USC, PRSI)</span><b>${fmt.format(r.dedBoth)}</b></div>
       <div class="rrow"><span>Extra tax caused by the second job</span><b>${fmt.format(r.extra)} (${(r.rate*100).toFixed(0)}%)</b></div>
       <div class="rrow rtot"><span>Combined take-home</span><b>${fmt.format(r.net)} / yr · ${fmt.format(r.monthly)} / mo</b></div>
       <p style="font-size:11px;color:#666;margin-top:18px">Income tax and USC are charged on total income; PRSI per employment (jobs paying €352/week or less are PRSI-exempt). Estimate per Revenue.ie 2026 rules for a standard PAYE worker; not tax advice. Generated locally in your browser.</p>
     </div>`;
  window.print();
});
$('yr').textContent=new Date().getFullYear();
render();
