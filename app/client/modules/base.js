import { Router } from 'dwayne';
import NotFoundState from '../routers/404';
import '../routers/base';
import '../i18n';

Router.default = NotFoundState;
Router.init();
