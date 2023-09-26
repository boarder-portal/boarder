import { State } from 'client/utilities/store';

declare global {
  interface Window {
    initialState: State;
  }

  interface ScreenOrientation {
    lock(orientationType: 'any' | 'natural' | 'landscape' | 'primary' | OrientationType): Promise<void>;
  }
}
