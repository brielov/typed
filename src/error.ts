export class TypeAggregateErr extends AggregateError {
  public constructor(public errors: TypeErr[] = []) {
    super("");
  }

  get message(): string {
    return this.errors.map((err) => err.message).join("\n");
  }
}

export class TypeErr extends Error {
  public constructor(
    public readonly message: string,
    public path: string[] = [],
  ) {
    super(message);
  }
}
