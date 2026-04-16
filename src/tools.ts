import type { ModelConnectorDefinition } from './models';

export interface ToolExecutionContext {
  goal: string;
  stepId: string;
  stepTitle: string;
  memory?: Record<string, unknown>;
  modelConnector?: ModelConnectorDefinition;
}

export interface ToolDefinition {
  name: string;
  description: string;
  category: string;
  execute(input: unknown, context: ToolExecutionContext): Promise<unknown>;
}

export class ToolManager {
  private tools = new Map<string, ToolDefinition>();

  registerTool(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  listTools() {
    return Array.from(this.tools.values()).map(({ name, description, category }) => ({ name, description, category }));
  }

  getTool(name: string) {
    return this.tools.get(name);
  }

  async executeTool(name: string, input: unknown, context: ToolExecutionContext) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return tool.execute(input, context);
  }

  findToolByCategory(category: string) {
    return Array.from(this.tools.values()).find((tool) => tool.category === category);
  }
}
