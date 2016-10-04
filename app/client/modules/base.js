import { Router, registerState } from 'dwayne';
import BaseState from '../routers/base';
import NotFoundState from '../routers/404';
import '../i18n';

registerState(BaseState);
Router.default = NotFoundState;
Router.init();
