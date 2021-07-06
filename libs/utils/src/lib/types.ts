export type Pair<T, U> = {
  fst: T;
  snd: U;
};

export const getEnumValues = (enumObj: any) =>
  Object.keys(enumObj).map((key) => enumObj[key]);

export const arrayToObject = (array: { key: string; val: any }[]): any => {
  return array.reduce((prev, v) => {
    prev[v.key] = v.val;
    return prev;
  }, {});
};

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
