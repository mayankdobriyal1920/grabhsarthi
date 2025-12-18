export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const format = (date, fmt = 'yyyy-MM-dd') => {
  const d = new Date(date);
  const map = {
    yyyy: d.getFullYear(),
    MM: `${d.getMonth() + 1}`.padStart(2, '0'),
    dd: `${d.getDate()}`.padStart(2, '0'),
    MMM: d.toLocaleString('en', { month: 'short' })
  };
  return fmt.replace(/yyyy|MM|dd|MMM/g, (m) => map[m]);
};
