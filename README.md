![GitHub Workflow Status](https://img.shields.io/github/workflow/status/brielov/typed/build-test)
![Codecov](https://img.shields.io/codecov/c/gh/brielov/typed)
![GitHub issues](https://img.shields.io/github/issues/brielov/typed)
![GitHub](https://img.shields.io/github/license/brielov/typed)
![npm](https://img.shields.io/npm/v/typed)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/typed)

# Typed

A blazing fast, dependency free, 1kb runtime type-checking library written entirely in typescript, meant to be used with it.

There are dozens of validation libraries out there, so why create yet another one? Well, I tried almost every library out there and there is only one that I really like called `superstruct` (which is awesome) that provides almost everything that I want, but still, I wanted to create my own. The others are simply bloated or don't provide proper typescript support. So that's where `typed` comes in.

`typed` is all about function composition. Each function is "standalone" and provides a safe way to validate data, you don't need a special kind of function to execute a schema against some value. All functions return a special type which is either `Success<T>` or `Failure`. If `success` is `true` then `value` is available and fully typed and if not, `errors` is available with a message and path from where it failed.

## Install

```
npm install typed
```

Or to use it directly in the browser as ES module:

```typescript
import * as T from "https://unpkg.com/typed@latest/dist/typed.mjs?module";
```

## Usage

```typescript
import * as T from "typed";

const postType = T.object({
  id: T.number,
  title: T.string,
  tags: T.array(T.string),
});

const result = postType(/* some JSON data */);

if (result.success) {
  // value is available inside this block
  result.value;
} else {
  // errors is available inside this other block
  result.errors;
}
```

## Types

`typed` only ships with a few primitives which serves as building blocks for more complex types.

- `any: Typed<any>` (defeats the purpose, don't use unless necessary)
- `array<T>(type: Typed<T>): Typed<T[]>`
- `boolean: Typed<boolean>`
- `date: Typed<Date>`
- `defaulted<T>(type: Typed<T>, fallback: T): Typed<T>`
- `enums<T>(enum: T): Typed<T>` (Real typescript enums only)
- `literal(constant: string | number | boolean | null): Typed`
- `nullable<T>(type: Typed<T>): Typed<T | null>`
- `number: Typed<number>`
- `object<T extends Shape>(shape: T): Typed<Infer<T>>`
- `optional<T>(type: Typed<T>): Typed<T | undefined>`
- `string: Typed<string>`
- `tuple(...types: Typed[]): Typed<[...types]>`
- `union(...types: Typed[]): Typed<T1 | T2 | ... T3>`

## Type casting

- `asDate: Typed<Date>`
- `asNumber: Typed<number>`
- `asString: Typed<string>`

As you can see, `typed` provides a few type-casting methods for convenience.

```typescript
import * as T from "typed";

const postType = T.object({
  id: T.asNumber,
  createdAt: T.asDate,
});

postType({ id: "1", createdAt: "2021-10-23" }); // => { id: 1, createdAt: Date("2021-10-23T00:00:00.000Z") }
```

## Custom validations

`typed` allows you to refine types with the `map` function as you'll see next.

```typescript
import * as T from "typed";
import isEmail from "is-email";

const emailType = T.map(T.string, (value) =>
  isEmail(value)
    ? T.success(value)
    : T.failure(T.toError(`Expecting value to be a valid 'email'`)),
);

// Later in your code
const userType = T.object({
  id: T.number,
  name: T.string,
  email: emailType,
});
```

`map` also allows you to convert or re-shape an input type to another output type.

```typescript
import * as T from "typed";

const rangeType = (floor: number, ceiling: number) =>
  T.map(T.number, (value) => {
    if (value < floor || value > ceiling) {
      return T.failure(
        T.toError(
          `Expecting value to be between '${floor}' and '${ceiling}'. Got '${value}'`,
        ),
      );
    }
    return T.success(value);
  });

const latType = rangeType(-90, 90);
const lngType = rangeType(-180, 180);

const geoType = T.object({
  lat: latType,
  lng: lngType,
});

const latLngType = T.tuple(T.asNumber, T.asNumber);

// It will take a string as an input and it will return `{ lat: number, lng: number }` as an output.
const geoStrType = T.map(T.string, (value) => {
  const result = latLngType(value.split(","));
  return result.success
    ? geoType({ lat: result.value[0], lng: result.value[1] })
    : result;
});

const result = geoStrType("-39.031153, -67.576394"); // => { lat: -39.031153, lng: -67.576394 }
```

There is another utility function called `fold` which lets you run either a `onLeft` or `onRight` function depending on the result of the validation.

```tsx
import * as T from "typed";

const userType = T.object({
  id: T.number,
  name: T.string,
});

type UserType = T.Infer<typeof userType>;

const fetcher = (path: string) =>
  fetch(path)
    .then((res) => res.json())
    .then(userType);

const renderErrors = (errors: T.Err[]) => (
  <ul>
    {errors.map((err, key) => (
      <li key={key}>{`${err.message} @ ${err.path.join(".")}`}</li>
    ))}
  </ul>
);

const renderProfile = (user: UserType) => (
  <div>
    <h1>{user.name}</h1>
    <p>{user.id}</p>
  </div>
);

const Profile: React.FC = () => {
  const { data } = useSWR("/api/users", fetcher);

  if (!data) {
    return <div>Loading...</div>;
  }

  return T.fold(data, renderErrors, renderProfile);
};
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

## Demo

![Demo](./demo.gif)

## A note about speed

There are a few libraries out there bragging about being 60x faster than this or that library. While that might be true, they are often also 60x bigger.
Every library has its pros and cons and which one you choose will depend on the context. If you are on a server-side environment, size may not be your primary concern (although deploy times do matter). If you are on a client-side environment though, size should definitely be a concern.

Take [suretype](https://github.com/grantila/suretype) as an example: It is fast as fuck but it also comes at a whopping `225kb` price tag. If you had to download that many bytes while on 3G, by the time your browser downloads, parses, compiles and executes your code, `typed`, `superstruct` or any other of the kind, should have been done making the actuall http request to the server, parsed some JSON, validated the data and still have some time left to do something else (even on the server-side). Memory usage is something to keep in mind too (low powered devices would definitely feel the impact, like a raspberry pi or a low end phone).

![Compare](./compare.png)
