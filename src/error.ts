export interface StructErrorInfo {
  readonly path: string[];
  readonly input?: any;
}

export class StructError extends Error {
  constructor(
    public readonly message: string,
    public readonly info: StructErrorInfo = { path: [] },
  ) {
    super(message);
  }

  toJSON() {
    return {
      message: this.message,
      info: this.info,
    };
  }
}

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest;

  it("has a default path", () => {
    const error = new StructError("test");
    expect(error.info.path).toEqual([]);
  });

  it("implements .toJSON() method", () => {
    const error = new StructError("test", { input: 1, path: ["2"] });
    expect(error.toJSON()).toEqual({
      message: "test",
      info: {
        input: 1,
        path: ["2"],
      },
    });
  });
}
