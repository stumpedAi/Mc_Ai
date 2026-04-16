import type { ModelConnectorDefinition } from './models.js';
import type { ToolDefinition } from './tools.js';

export interface PluginHost {
  registerTool(tool: ToolDefinition): void;
  registerConnector(connector: ModelConnectorDefinition): void;
  registerProxy(name: string, endpoint: string, auth?: Record<string, string>): void;
}

export interface PluginDefinition {
  name: string;
  description: string;
  activate(host: PluginHost): Promise<void>;
}

export class PluginManager {
  private plugins = new Map<string, PluginDefinition>();

  async loadPlugin(plugin: PluginDefinition, host: PluginHost) {
    if (this.plugins.has(plugin.name)) {
      return;
    }
    await plugin.activate(host);
    this.plugins.set(plugin.name, plugin);
  }

  listPlugins() {
    return Array.from(this.plugins.values()).map(({ name, description }) => ({ name, description }));
  }
}
