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
