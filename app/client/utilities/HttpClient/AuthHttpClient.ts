import { LoginRequest, LoginResponse } from 'server/api/auth/login';
import { RegisterRequest, RegisterResponse } from 'server/api/auth/register';

import HttpClient from './HttpClient';

class AuthHttpClient extends HttpClient<'auth'> {
  apiType = 'auth' as const;

  async login(request: LoginRequest, signal?: AbortSignal): Promise<LoginResponse> {
    return this.post('login', request, signal);
  }

  async logout(signal?: AbortSignal): Promise<void> {
    return this.post('logout', signal);
  }

  async register(request: RegisterRequest, signal?: AbortSignal): Promise<RegisterResponse> {
    return this.post('register', request, signal);
  }
}

export default new AuthHttpClient();
