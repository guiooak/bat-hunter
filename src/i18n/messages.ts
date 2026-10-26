import { en } from './en';

// The shape of en.ts with any text allowed: what every language provides
type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => string
    ? (...args: A) => string
    : { readonly [K in keyof T]: Widen<T[K]> };

export type Messages = Widen<typeof en>;
