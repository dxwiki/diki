// lib 에 dom 이 없어 console 만 최소 선언한다
interface Console {
  log(...data: unknown[]): void;
  warn(...data: unknown[]): void;
  error(...data: unknown[]): void;
}

declare var console: Console;
