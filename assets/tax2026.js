/* =================================================================
   VERIFIED IRELAND 2026 TAX ENGINE — single source of truth.
   Mirrors the net-salary calculator (Budget 2026 bands). Pure maths,
   no fetch/storage. Loaded before each page's app.js (script-src 'self').

   Anchor (employee, €50,000 single, no pension):
     PAYE €7,200 · USC €1,033 · PRSI €2,100 · net €39,667 (€3,306/mo)
   ================================================================= */
window.NPH_2026 = (function () {
  const CUTOFF   = { single: 44000, married1: 53000 };          // standard-rate cut-off
  const PERSONAL = { single: 2000,  married1: 4000  };          // Personal Tax Credit
  const SECOND_CREDIT = 2000;   // Employee (PAYE) credit, or Earned Income credit if self-employed
  const USC_EXEMPT = 13000;
  const PRSI_RATE = 0.042;                                      // 4.2% (4.35% from 1 Oct 2026)
  const PRSI_WEEKLY_EXEMPT = 352 * 52;                          // employee PRSI threshold
  const PRSI_CREDIT_MAX  = 12;                                  // max tapered weekly PRSI credit
  const PRSI_CREDIT_FROM = 352.01;                              // full credit at this weekly wage
  const PRSI_CREDIT_TO   = 424;                                 // credit gone above this
  const SELF_PRSI_MIN = 650;                                    // Class S minimum €650/yr

  function band(a, lo, hi, r) { return Math.max(0, Math.min(a, hi) - lo) * r; }

  function incomeTaxGross(itBase, status) {
    const c = CUTOFF[status];
    return Math.min(itBase, c) * 0.20 + Math.max(0, itBase - c) * 0.40;
  }
  function credits(status) { return PERSONAL[status] + SECOND_CREDIT; }

  // USC on gross; self-employed pay an extra 3% on income above €100,000.
  function usc(income, selfEmployed) {
    if (income <= USC_EXEMPT) return 0;
    let u = band(income, 0, 12012, 0.005)
          + band(income, 12012, 28700, 0.02)
          + band(income, 28700, 70044, 0.03)
          + band(income, 70044, Infinity, 0.08);
    if (selfEmployed && income > 100000) u += (income - 100000) * 0.03;
    return u;
  }
  // Class A employee PRSI. Nil at or below EUR352/week. Between EUR352.01 and EUR424 a
  // tapered weekly credit of up to EUR12 applies, reduced by one sixth of weekly
  // earnings above EUR352.01 (gov.ie "PRSI Class A Rates", note **; worked example on
  // citizensinformation.ie). Without it a EUR20,000 salary is overcharged by EUR341/yr.
  function prsiCredit(weekly) {
    if (weekly <= PRSI_CREDIT_FROM) return PRSI_CREDIT_MAX;
    if (weekly >= PRSI_CREDIT_TO)   return 0;
    return Math.max(0, PRSI_CREDIT_MAX - (weekly - PRSI_CREDIT_FROM) / 6);
  }
  function prsiEmployee(gross, rate) {
    if (gross <= PRSI_WEEKLY_EXEMPT) return 0;
    const weekly = gross / 52;
    const charge = weekly * (rate || PRSI_RATE) - prsiCredit(weekly);
    return Math.max(0, charge) * 52;
  }
  function prsiClassS(income) { return income <= 0 ? 0 : Math.max(SELF_PRSI_MIN, income * PRSI_RATE); }

  // Employee (PAYE). Pension % reduces the income-tax base only; the contribution
  // also leaves take-home (it goes into your pension pot).
  function employeeNet(gross, status, pension) {
    pension = Math.max(0, pension || 0);
    const itBase = Math.max(0, gross - pension);
    const it  = Math.max(0, incomeTaxGross(itBase, status) - credits(status));
    const u   = usc(gross, false);
    const p   = prsiEmployee(gross);
    const total = it + u + p;
    const net = Math.max(0, gross - pension - total);
    return { gross, pension, it, usc: u, prsi: p, total, net, monthly: net / 12, eff: gross ? total / gross : 0 };
  }

  // Self-employed (Earned Income credit, Class S PRSI, USC surcharge >€100k).
  function selfEmployedNet(income, status) {
    const it = Math.max(0, incomeTaxGross(income, status) - credits(status));
    const u  = usc(income, true);
    const p  = prsiClassS(income);
    const total = it + u + p;
    const net = Math.max(0, income - total);
    return { gross: income, it, usc: u, prsi: p, total, net, monthly: net / 12, eff: income ? total / income : 0 };
  }

  return { CUTOFF, PERSONAL, band, incomeTaxGross, credits, usc,
           prsiCredit, prsiEmployee, prsiClassS, employeeNet, selfEmployedNet, PRSI_RATE };
})();
