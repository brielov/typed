import { Option, toOption } from "../option";
import { isPresent, isUndefined } from "../type-guards";
import { Present } from "../types";
import * as U from "./utils";

export interface List<T> extends Iterable<T> {
  append(...values: T[]): List<T>;
  at(index: number): Option<T>;
  concat(list: List<T>): List<T>;
  compact(): List<Present<T>>;
  drop(n: number): List<T>;
  each(callbackfn: (value: T, index: number) => void): List<T>;
  every(predicate: (value: T, index: number) => boolean): boolean;
  filter<U extends T>(
    callbackfn: (value: T, index: number) => value is U,
  ): List<U>;
  find(callbackfn: (value: T, index: number) => boolean): Option<T>;
  first(): Option<T>;
  group<K extends PropertyKey>(
    callbackfn: (value: T, index: number) => K,
  ): Record<K, T[]>;
  groupBy<K extends keyof T>(
    key: K,
  ): Record<T[K] extends PropertyKey ? T[K] : never, T[]>;
  includes(item: T): boolean;
  insert(item: T, at: number): List<T>;
  isEmpty(): boolean;
  last(): Option<T>;
  len(): number;
  map<U>(callbackfn: (value: T, index: number) => U): List<U>;
  move(from: number, to: number): List<T>;
  prepend(...values: T[]): List<T>;
  reduce<U>(
    initialValue: U,
    callbackfn: (previous: U, current: T, index: number) => U,
  ): U;
  remove(index: number): List<T>;
  reverse(): List<T>;
  shuffle(): List<T>;
  some(predicate: (value: T, index: number) => boolean): boolean;
  sort(comparefn?: (a: T, b: T) => number): List<T>;
  swap(a: number, b: number): List<T>;
  take(n: number): List<T>;
  toArray(): T[];
  toJSON(): T[];
}

export type ListInit<T> = Iterable<T> | ArrayLike<T>;

export function List<T>(init?: ListInit<T>): List<T> {
  const arr: T[] = isUndefined(init)
    ? []
    : Array.isArray(init)
    ? init
    : Array.from(init);

  return {
    *[Symbol.iterator]() {
      yield* arr[Symbol.iterator]();
    },
    append: (...values) => List([...arr, ...values]),
    at: (index) => U.at(arr, index),
    concat: (other) => List([...arr, ...other]),
    compact: () => List(arr.filter(isPresent)) as List<Present<T>>,
    drop: (n) => List(arr.slice(n)),
    each: (f) => {
      arr.forEach(f);
      return List(arr);
    },
    every: (f) => arr.every(f),
    filter: (f) => List(arr.filter(f)),
    find: (f) => toOption(arr.find(f)),
    first: () => U.at(arr, 0),
    group: (f) => U.group(arr, f),
    groupBy: (key) => U.groupBy(arr, key),
    includes: (item) => arr.includes(item),
    insert: (item, at) => List(U.insert(arr, item, at)),
    isEmpty: () => arr.length === 0,
    last: () => U.at(arr, -1),
    len: () => arr.length,
    map: (f) => List(arr.map(f)),
    move: (from, to) => List(U.move(arr, from, to)),
    prepend: (...values) => List([...values, ...arr]),
    reduce: (init, f) => arr.reduce(f, init),
    remove: (index) => List(U.remove(arr, index)),
    reverse: () => List([...arr].reverse()),
    shuffle: () => List(U.shuffle(arr)),
    some: (p) => arr.some(p),
    sort: (f) => List([...arr].sort(f)),
    swap: (a, b) => List(U.swap(arr, a, b)),
    take: (n) => List(arr.slice(0, n)),
    toArray: () => [...arr],
    toJSON: () => [...arr],
  };
}
