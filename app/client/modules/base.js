import { Router } from 'dwayne';
import NotFoundState from '../routers/404';
import '../routers/base';

Router.default = NotFoundState;
Router.init();
