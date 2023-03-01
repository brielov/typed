import { List } from "../../list";
import { Ok } from "../../result";
import { Struct } from "../types";
import { array } from "./array";

export const list = <T>(struct: Struct<T>): Struct<List<T>> => {
  const s = array(struct);
  return (input) => s(input).andThen((value) => Ok(List(value)));
};
