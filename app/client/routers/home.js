import { Router } from 'dwayne';

export default class HomeState extends Router {
  static stateName = 'home';
  static path = '/';
  static template = 'Welcome to Boarder!';
}
