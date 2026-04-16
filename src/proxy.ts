import axios, { AxiosRequestConfig } from 'axios';

interface ProxyDefinition {
  name: string;
  endpoint: string;
  auth?: Record<string, string>;
}

export class ProxyManager {
  private proxies: ProxyDefinition[] = [];

  registerProxy(name: string, endpoint: string, auth?: Record<string, string>) {
    const existing = this.proxies.find((proxy) => proxy.name === name);
    if (existing) {
      existing.endpoint = endpoint;
      existing.auth = auth;
      return;
    }
    this.proxies.push({ name, endpoint, auth });
  }

  listProxies() {
    return this.proxies.map(({ name, endpoint }) => ({ name, endpoint }));
  }

  async callProxy(name: string, path: string, payload?: unknown) {
    const proxy = this.proxies.find((item) => item.name === name);
    if (!proxy) {
      throw new Error(`Proxy not registered: ${name}`);
    }

    const config: AxiosRequestConfig = {
      url: `${proxy.endpoint.replace(/\/$/, '')}/${path.replace(/^\//, '')}`,
      method: payload ? 'post' : 'get',
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        ...proxy.auth
      }
    };

    const response = await axios.request(config);
    return response.data;
  }
}
