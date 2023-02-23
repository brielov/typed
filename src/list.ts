import { Option } from "./option";
import { isPresent } from "./type-guards";
import { Maybe, Present } from "./types";
import { assert } from "./util";

export class List<T> implements Iterable<T> {
  private constructor(private readonly arr: readonly T[]) {}

  *[Symbol.iterator]() {
    yield* this.arr[Symbol.iterator]();
  }

  public static empty<T>(): List<Present<T>> {
    return new List([]);
  }

  public static from<T>(iterable: Iterable<Maybe<T>>): List<T> {
    const arr: T[] = [];
    for (const item of iterable) {
      if (isPresent(item)) {
        arr.push(item);
      }
    }
    return new List(arr);
  }

  public static range(from: number, to: number, step = 1): List<number> {
    const arr: number[] = [];
    let i = from;
    while (i <= to) {
      arr.push(i);
      i += step;
    }
    return new List(arr);
  }

  get length(): number {
    return this.arr.length;
  }

  private getIndex(idx: number) {
    if (idx < 0) return this.length + idx;
    return idx;
  }

  public isEmpty(): boolean {
    return this.length === 0;
  }

  public at(index: number): Option<T> {
    index = this.getIndex(index);
    return Option.from(this.arr[index]);
  }

  public first(): Option<T> {
    return this.at(0);
  }

  public last(): Option<T> {
    return this.at(-1);
  }

  public append(...values: readonly T[]): List<T> {
    return new List([...this.arr, ...values]);
  }

  public prepend(...values: readonly T[]): List<T> {
    return new List([...values, ...this.arr]);
  }

  public concat(list: List<T>): List<T> {
    return new List([...this.arr, ...list]);
  }

  /**
   * @throws
   */
  public remove(index: number): List<T> {
    index = this.getIndex(index);
    assert(
      this.hasIndex(index),
      "Cannot remove a value at a nonexistent index",
    );
    const arr = [...this.arr];
    arr.splice(index, 1);
    return new List(arr);
  }

  /**
   * @throws
   */
  public insert(item: T, at: number): List<T> {
    at = this.getIndex(at);
    assert(this.hasIndex(at), "Cannot insert a value at a nonexistent index");
    const arr = [...this.arr];
    arr.splice(at, 0, item);
    return new List(arr);
  }

  public take(count: number): List<T> {
    return new List(this.arr.slice(0, count));
  }

  public drop(count: number): List<T> {
    return new List(this.arr.slice(count));
  }

  /**
   * @throws
   */
  public move(fromIndex: number, toIndex: number): List<T> {
    fromIndex = this.getIndex(fromIndex);
    toIndex = this.getIndex(toIndex);
    assert(
      this.hasIndex(fromIndex, toIndex),
      "Cannot move a value to a nonexistent index",
    );
    const arr = [...this.arr];
    const [item] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, item);
    return new List(arr);
  }

  /**
   * @throws
   */
  public swap(aIndex: number, bIndex: number): List<T> {
    aIndex = this.getIndex(aIndex);
    bIndex = this.getIndex(bIndex);
    assert(
      this.hasIndex(aIndex, bIndex),
      "Cannot swap a value to a nonexistent index",
    );
    const arr = [...this.arr];
    const temp = arr[aIndex];
    arr[aIndex] = arr[bIndex];
    arr[bIndex] = temp;
    return new List(arr);
  }

  public reverse(): List<T> {
    return new List([...this.arr].reverse());
  }

  public sort(comparefn?: (a: T, b: T) => number): List<T> {
    return new List([...this.arr].sort(comparefn));
  }

  public shuffle(): List<T> {
    const arr = [...this.arr];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return new List(arr);
  }

  public each(callbackfn: (value: T, index: number) => void): this {
    for (let i = 0; i < this.length; i++) callbackfn(this.arr[i], i);
    return this;
  }

  public map<U>(callbackfn: (value: T, index: number) => Present<U>): List<U> {
    return new List(this.arr.map(callbackfn));
  }

  public filter<U extends T>(
    callbackfn: (value: T, index: number) => value is U,
  ): List<U> {
    return new List(this.arr.filter(callbackfn));
  }

  public reduce<U>(
    initialValue: U,
    reducefn: (accumulator: U, currentItem: T, index: number) => U,
  ): U {
    return this.arr.reduce(reducefn, initialValue);
  }

  public find(comparefn: (value: T, index: number) => boolean): Option<T> {
    return Option.from(this.arr.find(comparefn));
  }

  public includes(item: T): boolean {
    return this.arr.includes(item);
  }

  public some(predicate: (value: T, index: number) => boolean): boolean {
    return this.arr.some(predicate);
  }

  public every(predicate: (value: T, index: number) => boolean): boolean {
    return this.arr.every(predicate);
  }

  public hasIndex(...indexes: number[]): boolean {
    return indexes.every((i) => i >= 0 && i < this.length);
  }

  public toArray(): T[] {
    return [...this.arr];
  }

  public toJSON(): T[] {
    return this.toArray();
  }

  public toString(): string {
    return this.arr.toString();
  }
}
