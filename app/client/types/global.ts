import { SharedStoreValues } from 'common/utilities/SharedStore';

declare global {
  interface Window {
    __STORE_VALUES__?: SharedStoreValues;
  }

  interface ScreenOrientation {
    lock(orientationType: 'any' | 'natural' | 'landscape' | 'primary' | OrientationType): Promise<void>;
  }
}
