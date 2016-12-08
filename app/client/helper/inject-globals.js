import { i18n } from '../i18n';
import { images } from '../constants';

export function injectGlobals(Block) {
  return class extends Block {
    constructor(opts) {
      super(opts);

      this.i18n = i18n;
      this.router = this.global.router;
      this.images = images;
    }
  };
}
