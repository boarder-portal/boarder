import 'express-session';

declare module 'express-session' {
  export interface Session {
    userId?: string;

    asyncSave(): Promise<void>;
    asyncDestroy(): Promise<void>;
  }
}
