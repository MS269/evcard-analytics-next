export function formatNumber(n: number) {
  return new Intl.NumberFormat('ko-KR').format(n);
}

export function formatDiff(from: number, to: number) {
  const formatter = new Intl.NumberFormat('ko-KR');
  const formatted = formatter.format(to - from);
  return to > from ? `+${formatted}` : formatted;
}

export function formatDiffPercent(from: number, to: number) {
  const formatter = new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const formatted = formatter.format(((to - from) / from) * 100);
  return to > from ? `+${formatted}%` : `${formatted}%`;
}
