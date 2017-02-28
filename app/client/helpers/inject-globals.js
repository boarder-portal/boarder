import _ from 'lodash';
import { i18n } from '../i18n';
import { images, title } from '../constants';

export function injectGlobals(Block) {
  return class extends Block {
    constructor(opts) {
      super(opts);

      this._ = _;
      this.Math = Math;
      this.console = window.console;
      this.i18n = i18n;
      this.router = this.globals.router;
      this.images = images;
      this.title = title;
    }
  };
}
