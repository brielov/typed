import { describe, expect, it, vi } from "vitest";
import { List, range } from "../src/list";

describe("List", () => {
  const list = List([1, 2, 3]);

  it("should be able to create an empty list", () => {
    expect(List().toArray()).toEqual([]);
  });

  it("should be able to create a list from an iterable", () => {
    function* gen() {
      yield 1;
      yield 2;
      yield 3;
    }

    const arr = [1, 2, 3];
    const str = "123";
    const list = List<number>().append(1, 2, 3);

    expect(List(gen()).toArray()).toEqual([1, 2, 3]);
    expect(List(arr).toArray()).toEqual([1, 2, 3]);
    expect(List(str).toArray()).toEqual(["1", "2", "3"]);
    expect(List(list).toArray()).toEqual([1, 2, 3]);
  });

  it("should be able to create a range of numbers", () => {
    expect(range(0, 5)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("should be able to compute the list length", () => {
    expect(list.len()).toEqual(3);
    expect(List().len()).toEqual(0);
  });

  it("should be able to tell if the list is empty", () => {
    expect(list.isEmpty()).toBe(false);
    expect(List().isEmpty()).toBe(true);
  });

  it("should be able to get a value at a given index", () => {
    expect(list.at(1)).toBeSome(2);
    expect(list.at(-1)).toBeSome(3);
    expect(list.at(99)).toBeNone();
  });

  it("should be able to grab the first element in the list", () => {
    expect(list.first()).toBeSome(1);
    expect(List().first()).toBeNone();
  });

  it("should be able to grab the last element in the list", () => {
    expect(list.last()).toBeSome(3);
    expect(List().last()).toBeNone();
  });

  it("should be able to append to the list", () => {
    expect(list.append(4).toArray()).toEqual([1, 2, 3, 4]);
  });

  it("should be able to prepend to the list", () => {
    expect(list.prepend(0).toArray()).toEqual([0, 1, 2, 3]);
  });

  it("should be able to concat two lists", () => {
    const list2 = List([4, 5, 6]);
    expect(list.concat(list2).toArray()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("should be able to remove from the list", () => {
    expect(list.remove(1).toArray()).toEqual([1, 3]);
  });

  it("should be able to insert to the list", () => {
    const list = List([1, 2, 3]);
    expect(list.insert(4, 1).toArray()).toEqual([1, 4, 2, 3]);
  });

  it("should be able to move a value from one index to another", () => {
    expect(list.move(0, 2).toArray()).toEqual([2, 3, 1]);
  });

  it("should be able to swap two elements by index", () => {
    expect(list.swap(1, 0).toArray()).toEqual([2, 1, 3]);
  });

  it("should be able to reverse the list", () => {
    expect(list.reverse().toArray()).toEqual([3, 2, 1]);
  });

  it("should be able to sort the list", () => {
    const list = List([3, 2, 1]);
    expect(list.sort().toArray()).toEqual([1, 2, 3]);
  });

  it("should be able to sort by taking a function", () => {
    expect(list.sort((a, b) => b - a).toArray()).toEqual([3, 2, 1]);
  });

  it("should be able to shuffle the list", () => {
    const list = List(range(0, 50));
    expect(list.shuffle()).not.toEqual(list.toArray());
  });

  it("should be able to iterate the list", () => {
    const fn = vi.fn();
    list.each(fn);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("should be able to map one list into another", () => {
    expect(list.map((x) => x * 2).toArray()).toEqual([2, 4, 6]);
  });

  it("should be able to filter the list", () => {
    expect(list.filter((x): x is number => x % 2 === 0).toArray()).toEqual([2]);
  });

  it("should be able to reduce the list", () => {
    expect(list.reduce(0, (a, b) => a + b)).toEqual(6);
  });

  it("should be able to find items in the list", () => {
    expect(list.find((x) => x === 2)).toBeSome(2);
    expect(list.find((x) => x === -1)).toBeNone();
  });

  it("should be able to check if the list includes some value", () => {
    expect(list.includes(2)).toBe(true);
    expect(list.includes(-1)).toBe(false);
  });

  it("should be able to check some condition passes at least once", () => {
    expect(list.some((x) => x === 3)).toBe(true);
    expect(list.some((x) => x === 0)).toBe(false);
  });

  it("should be able to check some condition passes every time", () => {
    expect(list.some((x) => x > 0)).toBe(true);
    expect(list.some((x) => x < 0)).toBe(false);
  });

  it("should be able to take n number of elements from the list", () => {
    const list = List(range(1, 10));
    expect(list.take(5).toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it("should be able to drop n number of elements from the list", () => {
    const list = List(range(1, 10));
    expect(list.drop(5).toArray()).toEqual([6, 7, 8, 9, 10]);
  });
});
