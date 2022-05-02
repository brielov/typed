![NPM](https://img.shields.io/npm/l/typed)
![Codecov](https://img.shields.io/codecov/c/github/brielov/typed)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/typed)
![GitHub issues](https://img.shields.io/github/issues/brielov/typed)
![npm](https://img.shields.io/npm/dm/typed)
![Libraries.io SourceRank](https://img.shields.io/librariesio/sourcerank/npm/typed)

# typed

`typed` is yet another runtime type checking library for JavaScript / TypeScript. It is heavily inspired by [superstruct](https://github.com/ianstormtaylor/superstruct) and [zod](https://github.com/colinhacks/zod), but it focuses on being lightweight (1kb gzipped), fast, and easy to use.

## Installation

```sh
npm install typed
```

## Usage

```ts
import * as t from "typed";

const post = t.object({
  id: t.number(),
  title: t.string(),
});

const postList = t.array(post);

// Get the actual type of the postList
type PostList = t.Infer<typeof postList>;

// Some json data from somewhere
const data = {} as any;

const result = postList(data);

if (result.ok) {
  // Do something with the data
  result.data;
} else {
  // Handle the error
  result.error;
}

// Or you can just unwrap the value directly. It will throw if the data is invalid.
const parsed = t.unwrap(result);

// Or if you don't want it to throw, you can use `unwrapOr`
const parsed = t.unwrapOr(result, {
  /* a default value */
});
```

### Fetch example

One of the more common use cases for including a library like this one is to validate data from a remote API.

```ts
import * as t from "typed";

const post = t.object({
  id: t.number(),
  title: t.string(),
});

const postList = t.array(post);

// If everything goes ok, posts will be correctly typed as `Post[]`.
// If not, an error will be thrown.
const posts = await fetch("https://jsonplaceholder.typicode.com/posts")
  .then((res) => res.json())
  .then(postList)
  .then(t.unwrap);
```

## Custom Types

There's a chance you'll want to define more complex types to deal with your data. You can do this in a few ways:

- Using the `map` function.
- Using the `chain` function.
- Creating a struct from scratch.

### Using the `map` function

The map function allows you to convert one "base" type into another. It always starts from a base type.

```ts
import * as t from "typed";

// Suppose we have this geolocation struct.
const latLng = t.object({
  lat: t.number(),
  lng: t.number(),
});

// `asNumber` means we can pass a string and it will be converted to a number.
const latLngPair = t.tuple([t.asNumber(), t.asNumber()]);

// And we'd like to have a type that takes a string a returns a `LatLng`.
const asLatLng = t.map(t.string(), (str) => {
  // Here `str` is guaranteed to be a string.

  // Here we validate our splited string against a tuple of two numbers.
  const result = latLngPair(str.split(","));

  // If it succeeds we return a `LatLng` struct. If not, forwards the error.
  return t.isOk(result) ? latLng(result.data) : result;
});

// Now we can use `asLatLng` to validate a string.
const str = "42.123,42.123";

const result = asLatLng(str); // `result` will be a `LatLng` struct.
```

### Using the `chain` function

The `chain` function is useful when you don't want to change the type of your data, but further process it.

For example, if you have a string that you want to trim and lowercase it, then `chain` is the function you want to use.

```ts
import * as t from "typed";

const trim = (value: string) => value.trim();
const lower = (value: string) => value.toLowerCase();

const trimLower = t.chain(
  t.string(),
  trim,
  lower /* whatever else function you want as longs as it at takes the same type and returns the same type */,
);

const result = trimLower("  Hello World  "); // { ok: true, value: "hello world" }
```

### Creating a struct from scratch

A struct is nothing more than a function that takes whatever input and returns a `Result`. The convention in typed is to have factory functions that return a struct just to be able to customize error messages. This was not the case in previous versions of typed, but it is now.

```ts
import * as t from "typed";

const regex =
  (regex: RegExp, msg = "Expecting value to match regex"): t.Struct<string> =>
  (input) => {
    if (typeof input !== "string" || !regex.test(input)) {
      return t.err(new t.StructError(msg, { input }));
    }
    return t.ok(input);
  };
```

_You can browse the `typed` source code to see how structs are implemented if you're curious._

## Notes

`typed` will deep clone non primitive values as it validates them. So if you pass an object or array to a struct, it will be cloned. This is to say that typed will get rid of any extra properties on your data, so it'll exactly match the shape you defined.

## Benchmarks

A quick benchmark comparing typed with superstruct and zod:

```bash
$ npm run benchmark

zod x 19,588 ops/sec ±0.25% (94 runs sampled)
superstruct x 6,398 ops/sec ±0.32% (98 runs sampled)
typed x 91,797 ops/sec ±0.08% (99 runs sampled)
Fastest is typed
```

_The data used in the benchmarks is from SpaceX's GraphQL API._
