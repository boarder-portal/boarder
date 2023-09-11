import { State } from 'client/utilities/store';

declare global {
  interface Window {
    initialState: State;
  }
}
