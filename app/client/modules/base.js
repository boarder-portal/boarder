import { Router, registerState } from 'dwayne';
import BaseState from '../routers/base';
import NotFoundState from '../routers/404';
import '../plugins/disabled';
import '../plugins/dropdown';
import '../plugins/popup';
import '../plugins/wait';
import '../plugins/sort';

registerState(BaseState);
Router.default = NotFoundState;
Router.init();
