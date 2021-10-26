# warden

A blazing fast, dependency free, 1kb runtime type-checking library written entirely in typescript, meant to be used with it.

There are dozens of validation libraries out there, so why create yet another one? Well, I tried almost every library out there and there is only one that I really like called `superstruct` (which is awesome) that provides almost everything that I want, but still, I wanted to create my own. The others are simply bloated or doesn't provide proper typescript support. So that's where `warden` comes in.

`warden` is all about functions and composition. Each function is independent and provides a safe way to validate data, you don't need a special kind of function to execute a schema against some piece of data. All functions returns a special kind of `Either` type which is `Success<T>` or `Failure`. If `success` is `true` then `data` is available and fully typed and if not, `errors` is available with a message and path from where it failed.

## Usage

```typescript
import * as T from "warden";

const postType = T.object({
  id: T.number,
  title: T.string,
  tags: T.array(T.string),
});

const result = postType(/* some JSON data */);

if (result.success) {
  // data is available inside this block
  result.data;
} else {
  // errors is available inside this other block
  result.errors;
}
```

## Types

- `any: Type<any>` (defeats the purpose, don't use unless necessary)
- `array<T>(type: Type<T>): Type<T[]>`
- `boolean: Type<boolean>`
- `date: Type<Date>`
- `defaulted<T>(type: Type<T>, fallback: T): Type<T>`
- `enums<T>(enum: T): Type<T>` (Real typescript enums only)
- `literal(constant: string | number | boolean | null): Type`
- `nullable<T>(type: Type<T>): Type<T | null>`
- `number: Type<number>`
- `object<T extends Shape>(shape: T): Type<Infer<T>>`
- `optional<T>(type: Type<T>): Type<T | undefined>`
- `string: Type<string>`
- `tuple(...types: Type[]): Type<[...type]>`
- `union(...types: Type[]): Type<T1 | T2 | ... T3>`

## Type casting

- `asDate: Type<Date>`
- `asNumber: Type<number>`
- `asString: Type<string>`

As you can see, `warden` provides a few type-casting methods for convenience.

```typescript
const postType = T.object({
  id: T.asNumber,
  createdAt: T.asDate,
});

postType({ id: "1", createdAt: "2021-10-23" }); // => { id: 1, createdAt: Date("2021-10-23T00:00:00.000Z") }
```

## Custom validations

`warden` allows you to refine types with `map` as you'll see next.

```typescript
import * as T from "warden";
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

`map` also allows you to re-shape an input to an output.

```typescript
import * as T from "./index";

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
    ? geoType({ lat: result.data[0], lng: result.data[1] })
    : result;
});

const result = geoStrType("-39.031153, -67.576394"); // => { lat: -39.031153, lng: -67.576394 }
```

## Infering Types

Sometimes you may want to infer the type of a validator function. You can do so with the `Infer` type.

```typescript
import * as T from "warden";

const postType = T.object({
  id: T.number,
  title: T.string,
  tags: T.array(T.string),
});

type Post = T.Infer<typeof postType>; // => Post = { id: number, title: string, tags: string[] }
```
