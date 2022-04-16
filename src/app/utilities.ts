export const groupBy = <T>(array: T[], selector: (value: T) => any) =>
  array.reduce<{ [key: string]: T[] }>((acc, cur) => ({
    ...acc,
    [selector(cur)]: [...(acc[selector(cur)] || []), cur]
  }), {});
