export function formatCardCount(n: number) {
  return `${new Intl.NumberFormat().format(n)} 장`;
}

export function formatSubscriberCount(n: number) {
  return `${new Intl.NumberFormat().format(n)} 명`;
}

export function formatAuthorizationToken(token: string) {
  return `Bearer ${token}`;
}
