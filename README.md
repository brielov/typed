![GitHub Workflow Status](https://img.shields.io/github/workflow/status/brielov/typed/build-test)
![Codecov](https://img.shields.io/codecov/c/gh/brielov/typed)
![GitHub issues](https://img.shields.io/github/issues/brielov/typed)
![GitHub](https://img.shields.io/github/license/brielov/typed)
![npm](https://img.shields.io/npm/v/typed)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/typed)

# Typed

A blazing fast, 1kb runtime type-checking library written entirely in typescript, meant to be used with it.

There are dozens of validation libraries out there, so why create yet another one? Well, I tried almost every library out there and there is only one that I really like called `superstruct` (which is awesome) that provides almost everything that I want, but still, I wanted to create my own. The others are simply bloated or don't provide proper typescript support. So that's where `typed` comes in.

`typed` is all about function composition. Each function is "standalone" and provides a safe way to validate data, you don't need a special kind of function to execute a schema against some value. All functions return a special type which is either `Ok<T>` or `Err`. If `success` is `true` then `value` is available and fully typed and if not, `errors` is available with a message and path from where the error originated.

> Typed V2 now relies on `rsts`. `rsts` is a simple and lightweight port of Rust's Result and Option types.

## Install

```
npm install typed rsts
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
import { Ok, Err } from "rsts";
import isEmail from "is-email";

const emailType = T.map(T.string, (value) =>
  isEmail(value)
    ? Ok(value)
    : Err(T.toError(`Expecting value to be a valid 'email'`)),
);

// Later in your code
const userType = T.object({
  id: T.number,
  name: T.string,
  email: emailType,
});
```

A more complex example is the following:

```typescript
import * as T from "typed";

const rangeType = (floor: number, ceiling: number) =>
  T.map(T.number, (value) => {
    if (value < floor || value > ceiling) {
      return Err(
        T.toError(
          `Expecting value to be between '${floor}' and '${ceiling}'. Got '${value}'`,
        ),
      );
    }
    return Ok(value);
  });

const geoType = T.object({
  lat: rangeType(-90, 90),
  lng: rangeType(-180, 180),
});

const latLngType = T.tuple(T.asNumber, T.asNumber);

// It will take a string as an input and it will return `{ lat: number, lng: number }` as an output.
const geoStrType = T.map(T.string, (value) => {
  const result = latLngType(value.split(","));
  return result.map(([lat, lng]) => ({ lat, lng }));
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

type Post = T.Infer<typeof postType>; // => Post { id: number, title: string, tags: string[] }
```

## Addons

Because I use `typed` mostly on the server to cast and validate incoming data, I've created some addons to make some tasks easier and less repetitive, like normalizing emails and validating passwords. A `typed-extras` may be coming soon with a collection of commonly used data structures and validations.

- [typed-email](https://github.com/brielov/typed-email)
- [typed-password](https://github.com/brielov/typed-password)

## Benchmarks

```
superstruct (valid):
  3 484 ops/s, ±0.86%    | 88.54% slower

zod (valid):
  2 384 ops/s, ±0.30%    | 92.16% slower

typed (valid):
  30 389 ops/s, ±0.55%   | fastest

superstruct (invalid):
  2 130 ops/s, ±3.31%    | 92.99% slower

zod (invalid):
  1 359 ops/s, ±1.83%    | slowest, 95.53% slower

typed (invalid):
  13 441 ops/s, ±0.23%   | 55.77% slower

Finished 6 cases!
  Fastest: typed (valid)
  Slowest: zod (invalid)
```
