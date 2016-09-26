import { Router } from 'dwayne';
import NotFoundStateTemplate from '../views/states/404.pug';

class NotFoundState extends Router {
  static stateName = '404';
  static path = '/';
  static template = NotFoundStateTemplate;
  static templateParams = {
    thisPage: 'This page',
    doesNotExist: 'does not exist'
  };

  onLoad() {
    const { url } = this;

    this.templateParams.url = url.href.slice(url.origin.length);
  }
}

export default NotFoundState;
