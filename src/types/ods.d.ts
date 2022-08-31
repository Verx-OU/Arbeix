export type StringReplacement = string;
export type NumberFloatReplacement = number;
export type ExactFloatReplacement = { exact: string };
export type EmailReplacement = { email: string };
// export type FormulaReplacement = { formula: string; type?: string };
export type DateReplacement = { date: [number, number, number] };
export type AggregateReplacement = Schema[];
export type Replacement =
  | StringReplacement
  | NumberFloatReplacement
  | ExactFloatReplacement
  | EmailReplacement
  // | FormulaReplacement
  | DateReplacement
  | AggregateReplacement;
export type Schema = Record<string, Replacement>;
