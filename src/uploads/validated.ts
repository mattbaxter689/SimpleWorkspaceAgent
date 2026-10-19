declare const brand: unique symbol

// To be passed through parse functions to ensure that yaml
// Does not need to be consistently re-parsed
export type Validated<T> = T & { readonly [brand]: true }

// To only be called inside parse functions
export const markValidated = <T>(value: T) => value as Validated<T>
