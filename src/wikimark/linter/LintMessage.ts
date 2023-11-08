

export class LintMessage {
  constructor(severity: number, message: string) {
    this._severity = severity;
    this._message = message;
  }

  private _severity: Severity;
  private _message: string;
  // private _start: Location;
  // private _end: Location;

  /**
   * The impact level of the underlying issue, described by this lint message:
   *   MINOR: mostly cosmetic issues, such as missing/extraneous whitespace. These
   *     issues should have no effect on how the document is ultimately rendered.
   *   NORMAL: issues that may adversely affect the document's appearance when it is 
   *     rendered, without making it unreadable.
   *   MAJOR: issues that may completely break document rendering, make parts of the
   *     document disappear, render mangled, or otherwise non-functional.
   */
  get severity(): Severity {
    return this._severity;
  }

  get message(): string {
    return this._message;
  }
}

export enum Severity {
  MINOR = 1,
  NORMAL = 2,
  MAJOR = 3,
}
