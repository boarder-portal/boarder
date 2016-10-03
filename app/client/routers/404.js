import BaseState from './base';
import NotFoundStateTemplate from '../views/states/404.pug';

class NotFoundState extends BaseState {
  static stateName = '404';
  static path = '/';
  static template = NotFoundStateTemplate;
  static templateParams = {
    location
  };
}

export default NotFoundState;
