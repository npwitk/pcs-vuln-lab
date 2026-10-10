// Banks a seller can be paid to. `value` is what's stored in
// seller_applications.bank_name (English, never change existing ones);
// `key` picks the display name under applySeller.banks in the locale files.
// Used by the seller application form and the admin bank-update form; the
// server validates against the same values in server/utils/banks.js.
export const THAI_BANKS = [
  { value: 'Bangkok Bank', key: 'bangkok' },
  { value: 'Kasikornbank (K-Bank)', key: 'kbank' },
  { value: 'Siam Commercial Bank (SCB)', key: 'scb' },
  { value: 'Krung Thai Bank', key: 'krungthai' },
  { value: 'Bank of Ayudhya (Krungsri)', key: 'krungsri' },
  { value: 'TMB Bank', key: 'tmb' },
  { value: 'Government Savings Bank', key: 'gsb' },
  { value: 'CIMB Thai Bank', key: 'cimb' },
  { value: 'United Overseas Bank (UOB)', key: 'uob' },
  { value: 'Thanachart Bank', key: 'thanachart' },
  { value: 'Standard Chartered Bank', key: 'standardChartered' },
  { value: 'ICBC (Thai)', key: 'icbc' },
  { value: 'Other', key: 'other' },
];
