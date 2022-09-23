import React, { useState, SetStateAction } from "react";
import { useLocation } from "react-router-dom";

export function tryParseJSON<T>(string: string | null, def: T): T {
  return string === null ? def : (JSON.parse(string) as T);
}

export function maybeParseJSON<T>(string: string | null): T | null {
  return string === null ? null : (JSON.parse(string) as T);
}

export type SetState<A> = React.Dispatch<SetStateAction<A>>;
type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;
export function useSerialState<Key, S, E = unknown>(
  key: StringLiteral<Key>,
  defaultState: S,
  element?: React.FC<E>
): [S, SetState<S>] {
  const location = useLocation();
  const prefix = element ? `${location.pathname}/${element?.displayName ?? element?.name ?? "."}` : `!`;
  const fullKey = `@${prefix}/${key}`;
  const [state, setStateDirect] = useState<S>(() =>
    tryParseJSON(localStorage.getItem(fullKey), defaultState)
  );
  console.trace(fullKey, state);
  const setState = (stateAction: SetStateAction<S>) => {
    setStateDirect((value) => {
      const modified = stateAction instanceof Function ? stateAction(value) : stateAction;
      localStorage.setItem(fullKey, JSON.stringify(modified));
      console.trace(fullKey, modified, element);
      return modified;
    });
  };
  return [state, setState];
}

export function useSessionState<Key, S, E = unknown>(
  key: StringLiteral<Key>,
  defaultState: S,
  element?: React.FC<E>
): [S, SetState<S>] {
  const location = useLocation();
  const prefix = element ? `${location.pathname}/${element?.displayName ?? element?.name ?? "."}` : `!`;
  const fullKey = `@${prefix}/${key}`;
  const [state, setStateDirect] = useState<S>(() =>
    tryParseJSON(sessionStorage.getItem(fullKey), defaultState)
  );
  const setState = (stateAction: SetStateAction<S>) => {
    setStateDirect((value) => {
      const modified = stateAction instanceof Function ? stateAction(value) : stateAction;
      sessionStorage.setItem(fullKey, JSON.stringify(modified));
      return modified;
    });
  };
  return [state, setState];
}
