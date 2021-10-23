# warden

A blazing fast, dependency free, 1kb runtime type-checking library written entirely in typescript, meant to be used with it.

There are dozens of validation libraries out there, so why create yet another one? Well, I tried almost every library out there and there is only one that I really like called `superstruct` (which is awesome) that provides almost everything that I want, but still, I wanted to create my own. The others are simply bloated or doesn't provide proper typescript support. So that's where `warden` comes in.

`warden` is all about functions and composition. Each function is independent and provides a safe way to validate data, you don't need a special kind of function to execute a schema against some piece of data. All functions returns a special kind of `Either` type which is `Success<T>` or `Failure`. If `success` is `true` then `data` is available and fully typed and if not, `errors` is available with a message and path from where it failed.

## Usage

```typescript
import * as G from "warden";

const checkPost = G.object({
  id: G.number,
  title: G.string,
  tags: G.array(G.string),
});

const result = checkPost(/* some JSON data */);

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
const checkPost = G.object({
  id: G.asNumber,
  createdAt: G.asDate,
});

checkPost({ id: "1", createdAt: "2021-10-23" }); // => { id: 1, createdAt: Date("2021-10-23T00:00:00.000Z") }
```

## Custom validations

`warden` allows you to refine types with `map` as you'll see next.

```typescript
import * as G from "warden";
import isEmail from "is-email";

const email = G.map(G.string, (value) =>
  isEmail(value)
    ? G.success(value)
    : G.failure(G.toError(`Expecting value to be a valid 'email'`)),
);

// Later in your code
const checkUser = G.object({
  id: G.number,
  name: G.string,
  email,
});
```

`map` also allows you to re-shape an input to an output.

```typescript
import * as G from "warden";

const latLng = G.tuple(G.asNumer, G.asNumber);

// It will take a string as an input and it will return `{ lat: number, lng: number }` as an output.
const coords = G.map(G.string, (value) => {
  const result = latLng(value.split(","));
  if (result.success) {
    const [lat, lng] = result.data;
    return G.success({ lat, lng });
  }
  return result;
});
```
