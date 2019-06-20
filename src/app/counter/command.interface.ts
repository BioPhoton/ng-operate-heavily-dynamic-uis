export type Command =
  { isTicking: boolean } |
  { count: number } |
  { countUp: boolean } |
  { tickSpeed: number } |
  { countDiff: number };
