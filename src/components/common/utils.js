export const formatDate = (input) => {
  if (!input) return '-';

  let d;
  if (input instanceof Date) {
    d = input;
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    // Handle plain "YYYY-MM-DD" safely
    const [y, m, day] = input.split('-').map(Number);
    d = new Date(Date.UTC(y, m - 1, day));
  } else {
    d = new Date(input);
  }
  if (isNaN(d)) return '-';

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mon = months[d.getUTCMonth()];
  const yy = d.getUTCFullYear();

  return `${dd}-${mon}-${yy}`;  // e.g., "22-Aug-2025"
};
