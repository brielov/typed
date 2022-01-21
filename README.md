![GitHub Workflow Status](https://img.shields.io/github/workflow/status/brielov/typed/build-test)
![Codecov](https://img.shields.io/codecov/c/gh/brielov/typed)
![GitHub issues](https://img.shields.io/github/issues/brielov/typed)
![GitHub](https://img.shields.io/github/license/brielov/typed)
![npm](https://img.shields.io/npm/v/typed)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/typed)

# Typed

A blazing fast, dependency free, 1kb runtime type-checking library written entirely in typescript, meant to be used with it.

There are dozens of validation libraries out there, so why create yet another one? Well, I tried almost every library out there and there is only one that I really like called `superstruct` (which is awesome) that provides almost everything that I need, but still, I wanted to create my own. The others are simply bloated or don't provide proper typescript support. So that's where `typed` comes in.

`typed` is all about function composition. Each function is "standalone" and provides a safe way to validate data, you don't need a special kind of function to execute a schema against some value. All functions return a special type which is either `Success` or `Failure`. If `ok` is `true` then `data` is available and fully typed and if not, `errors` is available with a message and path from where the error originated.

## Install

```
npm install typed
```

## Usage

**You can check out the API docs [here](https://typed.pages.dev)**

```typescript
import * as T from "typed";

const postType = T.object({
  id: T.number,
  title: T.string,
  tags: T.array(T.string),
});

const result = postType(/* some JSON data */);
```

## Custom types

`typed` has a handy function called `map` which allows you to create a new type from an existing one. That means that you are ensured that the new type will always start from a valid base type.

```typescript
import * as T from "typed";
import isEmail from "is-email";

const emailType = T.map(T.string, (value) =>
  isEmail(value)
    ? T.ok(value)
    : T.err(T.toError(`Expecting value to be a valid 'email'.`)),
);

// Later in your code
const userType = T.object({
  id: T.number,
  name: T.string,
  email: emailType,
});
```

You can compose more complex types like so:

```typescript
import * as T from "typed";

const rangeType = (floor: number, ceiling: number) =>
  T.map(T.number, (value) => {
    if (value < floor || value > ceiling) {
      return T.err(
        T.toError(
          `Expecting value to be between '${floor}' and '${ceiling}'. Got '${value}'.`,
        ),
      );
    }
    return T.ok(value);
  });

const geoType = T.object({
  lat: rangeType(-90, 90),
  lng: rangeType(-180, 180),
});

const latLngType = T.tuple(T.asNumber, T.asNumber);

// It will take a string as an input and it will return `{ lat: number, lng: number }` as an output.
const geoStrType = T.map(T.string, (value) => {
  const result = latLngType(value.split(","));
  return result.ok ? T.ok(result.data) : result;
});

const result = geoStrType("-39.031153, -67.576394"); // => { lat: -39.031153, lng: -67.576394 }
```

## Inference

Sometimes you may want to infer the type of a validator function. You can do so with the `Infer` type.

```typescript
import * as T from "typed";

const postType = T.object({
  id: T.number,
  title: T.string,
  tags: T.array(T.string),
});

type Post = T.Infer<typeof postType>; // => { id: number, title: string, tags: string[] }
```

## Benchmarks

Benchmarks were done on a Mac Mini 2020 with M1 chip and 8GB of RAM. You can clone this repo and run `npm run benchmark` to see the results.
A somewhat complex dataset from [SpaceX](https://api.spacex.land/graphql/) was used to benchmark the library.

```
zod x 5,149 ops/sec ±0.16% (101 runs sampled)
superstruct x 6,424 ops/sec ±0.32% (100 runs sampled)
typed x 98,049 ops/sec ±0.24% (99 runs sampled)
Fastest is typed
```
