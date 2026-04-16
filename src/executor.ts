import type { PlanStep, ExecutionStep } from './types';
import { ToolManager } from './tools';
import { ModelConnectorManager } from './models';
import { ProxyManager } from './proxy';

export class GoalExecutor {
  constructor(
    private toolManager: ToolManager,
    private modelManager: ModelConnectorManager,
    private proxyManager: ProxyManager
  ) {}

  async execute(plan: PlanStep[], goal: string) {
    const executionResults: ExecutionStep[] = [];
    for (const step of plan) {
      const execution: ExecutionStep = {
        ...step,
        status: 'running'
      };
      executionResults.push(execution);

      try {
        const result = await this.executeStep(step, goal);
        execution.status = 'complete';
        execution.result = result;
      } catch (error) {
        execution.status = 'failed';
        execution.error = error instanceof Error ? error.message : String(error);
      }
    }
    return executionResults;
  }

  private async executeStep(step: PlanStep, goal: string) {
    const category = step.id;
    const tool = this.toolManager.getTool(category) ?? this.toolManager.findToolByCategory(category);
    const modelConnector = this.modelManager.listConnectors()[0];

    const context = {
      goal,
      stepId: step.id,
      stepTitle: step.title,
      modelConnector,
      memory: {
        proxies: this.proxyManager.listProxies()
      }
    };

    if (tool) {
      return this.toolManager.executeTool(tool.name, { goal, step }, context);
    }

    if (modelConnector) {
      return this.modelManager.callConnector(modelConnector.name, {
        prompt: `Execute step ${step.title} for goal: ${goal}`,
        step,
        context
      });
    }

    return {
      message: `No tool or model connector available for ${step.title}.`,
      step
    };
  }
}
