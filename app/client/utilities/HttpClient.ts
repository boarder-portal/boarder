import api, { API_ROOT, ApiMethodRequest, ApiMethodResponse, ApiMethodType, ApiType } from 'common/api';

class HttpClient {
  private getUrl(method: string): string {
    return `${API_ROOT}/${method.replace(/\./, '/')}`;
  }

  private getOptions(): RequestInit {
    return {
      credentials: 'include',
    };
  }

  private async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const rawResponse = await fetch(input, init);

    if (rawResponse.status !== 200) {
      throw new Error('Request error');
    }

    return rawResponse;
  }

  private async get(url: string, params?: any, signal?: AbortSignal): Promise<Response> {
    return this.fetch(`${url}?${new URLSearchParams(params)}`, {
      ...this.getOptions(),
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });
  }

  private async post(url: string, data?: any, signal?: AbortSignal): Promise<Response> {
    return this.fetch(url, {
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

  async request<
    Type extends ApiType,
    MethodType extends ApiMethodType<Type>,
    MethodString extends `${Type}.${MethodType}`,
  >(
    method: MethodString,
    request: ApiMethodRequest<Type, MethodType>,
    signal?: AbortSignal,
  ): Promise<ApiMethodResponse<Type, MethodType>> {
    const url = this.getUrl(method);
    const [type, methodType] = method.split('.') as [Type, MethodType];
    const methodDescription = api[type][methodType];

    if (
      typeof methodDescription !== 'object' ||
      !methodDescription ||
      !('method' in methodDescription) ||
      (methodDescription.method !== 'get' && methodDescription.method !== 'post')
    ) {
      throw new Error('Wrong request');
    }

    const response = await this[methodDescription.method](url, request, signal);

    if (!('response' in methodDescription)) {
      return undefined as any;
    }

    return response.json();
  }
}

export default new HttpClient();
