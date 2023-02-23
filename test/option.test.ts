import { describe, expect, it, vi } from "vitest";
import { Option } from "../src/option";

const some = (num = 1): Option<number> => Option.some(num);
const none: Option<number> = Option.none;

describe("Option", () => {
  it("should return true if value is some", () => {
    expect(Option.from(0).isSome()).toBe(true);
    expect(Option.from(null).isSome()).toBe(false);
  });

  it("should return true if value is none", () => {
    expect(Option.from(0).isNone()).toBe(false);
    expect(Option.from(null).isNone()).toBe(true);
  });

  it("should be able to create an option from a value", () => {
    expect(Option.from(0)).toBeSome(0);
    expect(Option.from(null)).toBeNone();
  });

  it("should be able to check if it is some and run a function", () => {
    expect(some().isSomeAnd((v) => v === 1)).toBe(true);
    expect(some().isSomeAnd((v) => v !== 1)).toBe(false);
    expect(none.isSomeAnd(() => true)).toBe(false);
  });

  it("should be able to match upon its variant", () => {
    const fsome = vi.fn();
    const fnone = vi.fn();

    some().match(fsome, fnone);
    expect(fsome).toHaveBeenCalledOnce();
    expect(fsome).toHaveBeenCalledWith(1);
    expect(fnone).toHaveBeenCalledTimes(0);

    fsome.mockReset();
    fnone.mockReset();

    none.match(fsome, fnone);
    expect(fnone).toHaveBeenCalledOnce();
    expect(fsome).toHaveBeenCalledTimes(0);
  });

  it("should be able to use the and operator", () => {
    expect(some().and(some(2))).toBeSome(2);
    expect(none.and(some(2))).toBeNone();
  });

  it("should be able to use the andThen operator", () => {
    const f = () => some(2);
    expect(some().andThen(f)).toBeSome(2);
    expect(none.andThen(f)).toBeNone();
  });

  it("should be able to use the expect operator", () => {
    expect(() => some().expect("")).not.toThrow();
    expect(() => none.expect("")).toThrow();
    expect(some().expect("")).toEqual(1);
  });

  it("should be able to use the filter operator", () => {
    const f = (value: number) => value % 2 === 0;
    expect(some(2).filter(f)).toBeSome(2);
    expect(some(3).filter(f)).toBeNone();
    expect(none.filter(f)).toBeNone();
  });

  it("should be able to use the inspect operator", () => {
    const f = vi.fn();
    some().inspect(f);
    expect(f).toHaveBeenCalledOnce();
    expect(f).toHaveBeenCalledWith(1);
    f.mockReset();
    none.inspect(f);
    expect(f).toHaveBeenCalledTimes(0);
  });

  it("should be able to use the map operator", () => {
    const f = (n: number) => n.toString();
    expect(some().map(f)).toBeSome("1");
    expect(none.map(f)).toBeNone();
  });

  it("should be able to use the mapOr operator", () => {
    const f = (n: number) => n.toString();
    expect(some().mapOr("", f)).toBeSome("1");
    expect(none.mapOr("", f)).toBeSome("");
  });

  it("should be able to use the mapOrElse operator", () => {
    const f = (n: number) => n.toString();
    const e = () => "2";

    expect(some().mapOrElse(e, f)).toBeSome("1");
    expect(none.mapOrElse(e, f)).toBeSome("2");
  });

  it("should be able to use the okOr operator", () => {
    expect(some().okOr(2)).toBeOk(1);
    expect(none.okOr(2)).toBeErr(2);
  });

  it("should be able to use the okOrElse operator", () => {
    const f = () => 2;
    expect(some().okOrElse(f)).toBeOk(1);
    expect(none.okOrElse(f)).toBeErr(2);
  });

  it("should be able to use the or operator", () => {
    expect(some().or(some(2))).toBeSome(1);
    expect((none as Option<number>).or(some(2))).toBeSome(2);
  });

  it("should be able to use the orElse operator", () => {
    const f = () => some(2);
    expect(some().orElse(f)).toBeSome(1);
    expect(none.orElse(f)).toBeSome(2);
  });

  it("should be able to use the unwrap operator", () => {
    expect(() => some().unwrap()).not.toThrow();
    expect(() => none.unwrap()).toThrow();
    expect(some().unwrap()).toEqual(1);
  });

  it("should be able to use the unwrapOr operator", () => {
    expect(some().unwrapOr(2)).toBeSome(1);
    expect(none.unwrapOr(2)).toBeSome(2);
  });

  it("should be able to use the unwrapOrElse operator", () => {
    const f = () => 2;
    expect(some().unwrapOrElse(f)).toBeSome(1);
    expect(none.unwrapOrElse(f)).toBeSome(2);
  });
});
