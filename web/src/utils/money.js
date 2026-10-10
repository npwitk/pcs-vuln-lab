// Baht formatting shared by the seller pages. Whole amounts stay whole
// (฿40); anything with satang shows both digits (฿1,092.50). `compact` is for
// chart axes (฿1.2k). `always2` forces two decimals, for statements where
// columns of money should line up.
export function baht(value, { compact = false, always2 = false } = {}) {
  const v = Number(value) || 0;
  if (compact) {
    return Math.abs(v) >= 1000
      ? `฿${(v / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k`
      : `฿${Math.round(v).toLocaleString('en-US')}`;
  }
  const whole = !always2 && Math.abs(v - Math.round(v)) < 0.005;
  const digits = whole ? 0 : 2;
  const sign = v < 0 ? '−' : '';
  return `${sign}฿${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}
