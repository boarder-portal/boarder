import { apiUrls } from 'common/constants/api';

import { ApiType, ApiUrl } from 'common/types/api';

abstract class HttpClient<Type extends ApiType> {
  abstract apiType: Type;

  private getUrl(url: ApiUrl<Type>): string {
    return `${apiUrls.root}${apiUrls[this.apiType].root}${apiUrls[this.apiType][url]}`;
  }

  protected getOptions(): RequestInit {
    return {
      credentials: 'include',
    };
  }

  protected async fetch(input: RequestInfo | URL, init?: RequestInit) {
    const rawResponse = await fetch(input, init);

    if (rawResponse.status !== 200) {
      throw new Error('Request error');
    }

    return rawResponse.json();
  }

  protected async get(url: ApiUrl<Type>, params?: any, signal?: AbortSignal) {
    return this.fetch(`${this.getUrl(url)}?${new URLSearchParams(params)}`, {
      ...this.getOptions(),
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });
  }

  protected async post(url: ApiUrl<Type>, data?: any, signal?: AbortSignal) {
    return this.fetch(this.getUrl(url), {
      ...this.getOptions(),
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal,
    });
  }
}

export default HttpClient;
