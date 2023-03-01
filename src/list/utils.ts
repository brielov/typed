import { toOption } from "../option";

function getIndex<T>(arr: readonly T[], at: number): number {
  return at < 0 ? arr.length + at : at;
}

export function at<T>(arr: readonly T[], index: number) {
  return toOption(arr[getIndex(arr, index)]);
}

export function insert<T>(arr: readonly T[], item: T, at: number) {
  at = getIndex(arr, at);
  const copy = [...arr];
  copy.splice(at, 0, item);
  return copy;
}

export function move<T>(arr: readonly T[], from: number, to: number) {
  from = getIndex(arr, from);
  to = getIndex(arr, to);
  const copy = [...arr];
  const item = copy.splice(from, 1)[0];
  copy.splice(to, 0, item);
  return copy;
}

export function remove<T>(arr: readonly T[], at: number) {
  at = getIndex(arr, at);
  const copy = [...arr];
  copy.splice(at, 1);
  return copy;
}

export function shuffle<T>(arr: readonly T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

export function swap<T>(arr: readonly T[], a: number, b: number) {
  a = getIndex(arr, a);
  b = getIndex(arr, b);
  const copy = [...arr];
  const temp = copy[a];
  copy[a] = copy[b];
  copy[b] = temp;
  return copy;
}

export function range(from: number, to: number, step = 1) {
  const arr: number[] = [];
  let i = from;
  while (i <= to) {
    arr.push(i);
    i += step;
  }
  return arr;
}

export function group<T, K extends PropertyKey>(
  arr: readonly T[],
  f: (item: T, index: number) => K,
) {
  const obj = Object.create(null);
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const key = f(item, i);
    if (!(key in obj)) {
      obj[key] = [];
    }
    obj[key].push(item);
  }
  return obj;
}

export function groupBy<T, K extends keyof T>(arr: readonly T[], key: K) {
  return group(arr, (item) => item[key] as PropertyKey);
}
