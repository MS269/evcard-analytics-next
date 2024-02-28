export const formatCardCount = (n: number) =>
  `${new Intl.NumberFormat().format(n)} 장`;

export const formatSubscriberCount = (n: number) =>
  `${new Intl.NumberFormat().format(n)} 명`;
