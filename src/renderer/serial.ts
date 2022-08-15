import { useState, SetStateAction, useMemo } from "react";

export function tryParseJSON<T>(string: string | null, def: T): T {
  return string === null ? def : (JSON.parse(string) as T);
}

export function maybeParseJSON<T>(string: string | null): T | null {
  return string === null ? null : (JSON.parse(string) as T);
}

export type DispatchPromise<A, P> = (value: A) => Promise<P>;
export type SetStatePromise<A> = DispatchPromise<SetStateAction<A>, A>;
type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;
export function useSerialState<Key, S>(key: StringLiteral<Key>, defaultState: S): [S, SetStatePromise<S>] {
  const [state, setStateDirect] = useState<S>(() => tryParseJSON(localStorage.getItem(key), defaultState));
  const promise = useMemo(
    () =>
      new Promise<S>((resolve) => {
        localStorage.setItem(key, JSON.stringify(state));
        resolve(state);
      }),
    [key, state]
  );
  const setState = (stateAction: SetStateAction<S>) => {
    setStateDirect(stateAction);
    return promise;
  };
  return [state, setState];
}
