import React, { useState, SetStateAction, useMemo } from "react";
import { useLocation } from "react-router-dom";

export function tryParseJSON<T>(string: string | null, def: T): T {
  return string === null ? def : (JSON.parse(string) as T);
}

export function maybeParseJSON<T>(string: string | null): T | null {
  return string === null ? null : (JSON.parse(string) as T);
}

export type DispatchPromise<A, P> = (value: A) => Promise<P>;
export type SetStatePromise<A> = DispatchPromise<SetStateAction<A>, A>;
type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;
export function useSerialState<Key, S, E = unknown>(
  key: StringLiteral<Key>,
  defaultState: S,
  element?: React.FC<E>
): [S, SetStatePromise<S>] {
  const location = useLocation();
  const prefix = element ? `${location.pathname}/${element?.displayName ?? element?.name ?? "."}` : `!`;
  const fullKey = `@${prefix}/${key}`;
  const [state, setStateDirect] = useState<S>(() =>
    tryParseJSON(localStorage.getItem(fullKey), defaultState)
  );
  const promise = useMemo(
    () =>
      new Promise<S>((resolve) => {
        localStorage.setItem(fullKey, JSON.stringify(state));
        resolve(state);
      }),
    [fullKey, state]
  );
  const setState = (stateAction: SetStateAction<S>) => {
    setStateDirect(stateAction);
    return promise;
  };
  return [state, setState];
}

export function useSessionState<Key, S, E = unknown>(
  key: StringLiteral<Key>,
  defaultState: S,
  element?: React.FC<E>
): [S, SetStatePromise<S>] {
  const location = useLocation();
  const prefix = element ? `${location.pathname}/${element?.displayName ?? element?.name ?? "."}` : `!`;
  const fullKey = `@${prefix}/${key}`;
  const [state, setStateDirect] = useState<S>(() =>
    tryParseJSON(sessionStorage.getItem(fullKey), defaultState)
  );
  const promise = useMemo(
    () =>
      new Promise<S>((resolve) => {
        sessionStorage.setItem(fullKey, JSON.stringify(state));
        resolve(state);
      }),
    [fullKey, state]
  );
  const setState = (stateAction: SetStateAction<S>) => {
    setStateDirect(stateAction);
    return promise;
  };
  return [state, setState];
}
