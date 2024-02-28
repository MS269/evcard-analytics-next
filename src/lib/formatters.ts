export function formatCardCount(n: number) {
  return `${new Intl.NumberFormat().format(n)} 장`;
}

export function formatSubscriberCount(n: number) {
  return `${new Intl.NumberFormat().format(n)} 명`;
}
