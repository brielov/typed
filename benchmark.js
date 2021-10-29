const S = require("superstruct");
const B = require("benny");
const fetch = require("node-fetch");
const { z } = require("zod");
const T = require("./dist/typed");

async function run() {
  const json = await fetch("https://jsonplaceholder.typicode.com/posts").then(
    (res) => res.json(),
  );

  return B.suite(
    "main",
    B.add("superstruct (valid)", () => {
      const struct = S.array(
        S.type({
          id: S.number(),
          title: S.string(),
          body: S.string(),
          userId: S.number(),
        }),
      );

      try {
        S.create(json, struct);
      } catch (err) {
        if (err instanceof S.StructError) {
          err.failures();
        }
      }
    }),

    B.add("zod (valid)", () => {
      const Post = z.array(
        z.object({
          id: z.number(),
          title: z.string(),
          body: z.string(),
          userId: z.number(),
        }),
      );

      Post.safeParse(json);
    }),

    B.add("typed (valid)", () => {
      const postType = T.array(
        T.object({
          id: T.number,
          title: T.string,
          body: T.string,
          userId: T.number,
        }),
      );

      postType(json);
    }),

    B.add("superstruct (invalid)", () => {
      const struct = S.array(
        S.type({
          id: S.string(),
          title: S.string(),
          body: S.number(),
          userId: S.string(),
        }),
      );

      try {
        S.create(json, struct);
      } catch (err) {
        if (err instanceof S.StructError) {
          err.failures();
        }
      }
    }),

    B.add("zod (invalid)", () => {
      const Post = z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          body: z.number(),
          userId: z.string(),
        }),
      );

      Post.safeParse(json);
    }),

    B.add("typed (invalid)", () => {
      const postType = T.array(
        T.object({
          id: T.string,
          title: T.string,
          body: T.number,
          userId: T.string,
        }),
      );

      postType(json);
    }),
    B.cycle(),
    B.complete(),
  );
}

run();
