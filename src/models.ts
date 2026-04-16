import axios, { AxiosRequestConfig } from 'axios';

export interface ModelConnectorDefinition {
  name: string;
  type: string;
  endpoint: string;
  auth?: Record<string, string>;
  description?: string;
}

export class ModelConnectorManager {
  private connectors = new Map<string, ModelConnectorDefinition>();

  registerConnector(connector: ModelConnectorDefinition) {
    this.connectors.set(connector.name, connector);
  }

  listConnectors() {
    return Array.from(this.connectors.values()).map(({ name, type, endpoint, description }) => ({ name, type, endpoint, description }));
  }

  getConnector(name: string) {
    return this.connectors.get(name);
  }

  async callConnector(name: string, payload: unknown) {
    const connector = this.connectors.get(name);
    if (!connector) {
      throw new Error(`Model connector not found: ${name}`);
    }

    const config: AxiosRequestConfig = {
      url: connector.endpoint,
      method: 'post',
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        ...(connector.auth ?? {})
      }
    };

    const response = await axios.request(config);
    return response.data;
  }
}
