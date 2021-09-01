export function assert(predicate: unknown, message: string | (() => string)): asserts predicate {
  if (
    process.env.NODE_ENV !== 'production' &&
    (typeof predicate === 'function' ? !predicate() : !predicate)
  ) {
    throw new Error(typeof message === 'function' ? message() : message);
  }
}

let ranOnce: Set<string> | undefined;

export function assertRanOnce(label: string) {
  if (process.env.NODE_ENV !== 'production') {
    if (!ranOnce) {
      ranOnce = new Set();
    }
    assert(!ranOnce.has(label), `Code labelled "${label}" should only run once`);
    ranOnce.add(label);
  }
}
