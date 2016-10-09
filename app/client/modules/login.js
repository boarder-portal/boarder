import { registerState } from 'dwayne';
import LoginState from '../routers/login';
import '../plugins/get-user-from-string';
import '../plugins/not-confirmed-alert';

registerState(LoginState);
