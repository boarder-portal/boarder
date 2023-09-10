import 'react';

declare module 'react' {
  interface CSSProperties {
    [variable: `--${string}`]: string | number | undefined;
  }
}

export interface WithClassName {
  className?: string;
}
