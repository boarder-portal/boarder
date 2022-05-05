import { IUser } from 'common/types';
import { ILoginParams, IRegisterParams } from 'common/types/requestParams';

class HttpClient {
  async get(url: string, params?: any) {
    const rawResponse = await fetch(`${url}?${new URLSearchParams(params)}`);

    return rawResponse.json();
  }

  async post(url: string, params?: any) {
    const rawResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    return rawResponse.json();
  }

  async getUser(): Promise<IUser | null> {
    return this.get('/api/user');
  }

  async register(params: IRegisterParams): Promise<IUser> {
    return this.post('/api/register', params);
  }

  async login(params: ILoginParams): Promise<IUser | null> {
    return this.post('/api/login', params);
  }

  async logout(): Promise<undefined> {
    return this.post('/api/logout');
  }
}

const httpClient = new HttpClient();

export default httpClient;
