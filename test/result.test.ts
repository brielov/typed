import { describe, expect, it, vi } from "vitest";
import { Err, Ok, Result } from "../src/result";
import { toAsyncResult, toResult } from "../src/result/util";
import { raise } from "../src/util";

const ok = (num = 1): Result<number, string> => Ok(num);
const err = (str = "foo"): Result<number, string> => Err(str);

describe("Result", () => {
  it("should be able to check if it is ok", () => {
    expect(ok().isOk()).toBe(true);
    expect(err().isOk()).toBe(false);
  });

  it("should be able to check it is err", () => {
    expect(ok().isErr()).toBe(false);
    expect(err().isErr()).toBe(true);
  });

  it("should be able to use the isOkAnd operator", () => {
    const f = (num: number) => num % 2 === 0;
    expect(ok(2).isOkAnd(f)).toBe(true);
    expect(ok(1).isOkAnd(f)).toBe(false);
    expect(err().isOkAnd(f)).toBe(false);
  });

  it("should be able to use the isErrAnd operator", () => {
    const f = (str: string) => str === "foo";
    expect(err().isErrAnd(f)).toBe(true);
    expect(err("bar").isErrAnd(f)).toBe(false);
    expect(ok().isErrAnd(f)).toBe(false);
  });

  it("should be able to use the match operator", () => {
    const fok = vi.fn();
    const ferr = vi.fn();

    ok().match(fok, ferr);
    expect(fok).toHaveBeenCalledOnce();
    expect(fok).toHaveBeenCalledWith(1);
    expect(ferr).not.toHaveBeenCalled();

    fok.mockReset();
    ferr.mockReset();

    err().match(fok, ferr);
    expect(fok).not.toHaveBeenCalled();
    expect(ferr).toHaveBeenCalledOnce();
    expect(ferr).toHaveBeenCalledWith("foo");
  });

  it("shoule be able to convert the result into an option", () => {
    expect(ok().ok()).toBeSome(1);
    expect(ok().err()).toBeNone();
    expect(err().ok()).toBeNone();
    expect(err().err()).toBeSome("foo");
  });

  it("should be able to use the map operator", () => {
    const f = (num: number) => num * 2;
    expect(ok(2).map(f)).toBeOk(4);
    expect(err().map(f)).toBeErr();
  });

  it("should be able to use the mapOr operator", () => {
    const f = (num: number) => num * 2;
    expect(ok(2).mapOr(0, f)).toEqual(4);
    expect(err().mapOr(0, f)).toEqual(0);
  });

  it("should be able to use the mapOrElse operator", () => {
    const f1 = (num: number) => num * 2;
    const f2 = () => 0;
    expect(ok(2).mapOrElse(f2, f1)).toEqual(4);
    expect(err().mapOrElse(f2, f1)).toEqual(0);
  });

  it("should be able to use the mapErr operator", () => {
    const f = () => "bar";
    expect(ok().mapErr(f)).toBeOk(1);
    expect(err().mapErr(f)).toBeErr("bar");
  });

  it("should be able to use the inspect operator", () => {
    const f = vi.fn();
    ok().inspect(f);
    expect(f).toHaveBeenCalledOnce();
    expect(f).toHaveBeenCalledWith(1);

    f.mockReset();
    err().inspect(f);
    expect(f).not.toHaveBeenCalled();
  });

  it("should be able to use the inspectErr operator", () => {
    const f = vi.fn();
    err().inspectErr(f);
    expect(f).toHaveBeenCalledOnce();
    expect(f).toHaveBeenCalledWith("foo");

    f.mockReset();
    ok().inspectErr(f);
    expect(f).not.toHaveBeenCalled();
  });

  it("should be able to use the expect operator", () => {
    expect(() => ok().expect("")).not.toThrow();
    expect(() => err().expect("")).toThrow();
    expect(ok().expect("")).toEqual(1);
  });

  it("should be able to use the expectErr operator", () => {
    expect(() => err().expectErr("")).not.toThrow();
    expect(() => ok().expectErr("")).toThrow();
    expect(err().expectErr("")).toEqual("foo");
  });

  it("should be able to use the unwrap operator", () => {
    expect(() => ok().unwrap()).not.toThrow();
    expect(() => err().unwrap()).toThrow();
    expect(ok().unwrap()).toEqual(1);
  });

  it("should be able to use the unwrapErr operator", () => {
    expect(() => err().unwrapErr()).not.toThrow();
    expect(() => ok().unwrapErr()).toThrow();
    expect(err().unwrapErr()).toEqual("foo");
  });

  it("should be able to use the and operator", () => {
    expect(ok().and(Ok(4))).toBeOk(4);
    expect(err().and(Ok(4))).toBeErr();
  });

  it("should be able to use the andThen operator", () => {
    const f = () => Ok(4);
    expect(ok().andThen(f)).toBeOk(4);
    expect(err().andThen(f)).toBeErr();
  });

  it("should be able to use the or operator", () => {
    expect(ok().or(Ok(4))).toBeOk(1);
    expect(err().or(Ok(4))).toBeOk(4);
    expect(err().or(Err("bar"))).toBeErr("bar");
  });

  it("should be able to use the orElse operator", () => {
    const f1 = () => Err("bar");
    const f2 = () => Ok(4);
    expect(ok().orElse(f1)).toBeOk(1);
    expect(err().orElse(f2)).toBeOk(4);
    expect(err().orElse(f1)).toBeErr("bar");
  });

  it("should be able to use the unwrapOr operator", () => {
    expect(ok().unwrapOr(4)).toEqual(1);
    expect(err().unwrapOr(4)).toEqual(4);
  });

  it("should be able to use the unwrapOrElse operator", () => {
    const f = () => 4;
    expect(ok().unwrapOrElse(f)).toEqual(1);
    expect(err().unwrapOrElse(f)).toEqual(4);
  });

  it("should be able to convert a function that throws into a result", () => {
    const f1 = () => raise("foo");
    const f2 = () => 0;
    expect(toResult(f1)).toBeErr();
    expect(toResult(f2)).toBeOk(0);
  });

  it("should be able to convert an async function / promise into a result", async () => {
    const f1 = () => Promise.reject("foo");
    const f2 = () => Promise.resolve(0);

    expect(await toAsyncResult(f1)).toBeErr("foo");
    expect(await toAsyncResult(f2)).toBeOk(0);
    expect(await toAsyncResult(Promise.reject("foo"))).toBeErr("foo");
    expect(await toAsyncResult(Promise.resolve(0))).toBeOk(0);
  });
});
