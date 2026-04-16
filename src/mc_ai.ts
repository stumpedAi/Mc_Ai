import path from 'path';
import { MemoryStore } from './memory';
import { ProxyManager } from './proxy';
import { ToolManager } from './tools';
import { ModelConnectorManager } from './models';
import { PluginManager, type PluginDefinition, type PluginHost } from './plugins';
import { GoalExecutor } from './executor';
import { safeJsonParse } from './utils';
import type { McAiStatus, GoalOutcome, PlanStep, ExecutionStep } from './types';
import type { ToolDefinition } from './tools';
import type { ModelConnectorDefinition } from './models';

const DEFAULT_SOUL = 'Mc_Ai is a self-directed fullstack genius that builds, tests, and deploys code with relentless precision.';
const DEFAULT_SYSTEM_PROMPT = 'You are Mc_Ai, the ultimate autonomous coding agent. Prioritize clarity, action, and adaptivity.';

export class McAi implements PluginHost {
  memory: MemoryStore;
  proxyManager: ProxyManager;
  toolManager: ToolManager;
  modelManager: ModelConnectorManager;
  pluginManager: PluginManager;
  executor: GoalExecutor;
  systemPrompt: string;
  soul: string;

  constructor() {
    const memoryPath = path.join(process.cwd(), '.cache', 'memory.json');
    this.memory = new MemoryStore(memoryPath);
    this.proxyManager = new ProxyManager();
    this.toolManager = new ToolManager();
    this.modelManager = new ModelConnectorManager();
    this.pluginManager = new PluginManager();
    this.executor = new GoalExecutor(this.toolManager, this.modelManager, this.proxyManager);
    this.systemPrompt = DEFAULT_SYSTEM_PROMPT;
    this.soul = DEFAULT_SOUL;
  }

  async initialize() {
    await this.memory.load();
    this.addMemory('Initialization', {
      timestamp: new Date().toISOString(),
      value: 'Mc_Ai engine initialized and ready for goals.'
    });
    this.loadDefaultTools();
    this.loadDefaultConnectors();
  }

  async status(): Promise<McAiStatus> {
    return {
      active: true,
      systemPrompt: this.systemPrompt,
      soul: this.soul,
      memorySize: this.memory.size,
      proxies: this.proxyManager.listProxies(),
      tools: this.toolManager.listTools(),
      connectors: this.modelManager.listConnectors(),
      plugins: this.pluginManager.listPlugins()
    };
  }

  async setSystemPrompt(prompt: string) {
    this.systemPrompt = prompt || DEFAULT_SYSTEM_PROMPT;
    this.addMemory('SystemPromptUpdate', { prompt: this.systemPrompt, updatedAt: new Date().toISOString() });
  }

  async setSoul(soul: string) {
    this.soul = soul || DEFAULT_SOUL;
    this.addMemory('SoulUpdate', { soul: this.soul, updatedAt: new Date().toISOString() });
  }

  async receiveGoal(goal: string, execute = false): Promise<GoalOutcome> {
    const goalRecord = {
      timestamp: new Date().toISOString(),
      goal,
      source: 'api'
    };

    await this.addMemory('GoalReceived', goalRecord);

    const plan = this.createPlan(goal);
    const response: GoalOutcome = {
      goal,
      plan,
      summary: `Generated ${plan.length} core steps for goal: ${goal}`,
      executed: false
    };

    await this.addMemory('PlanCreated', { goal, plan, createdAt: new Date().toISOString() });

    if (execute) {
      const execution = await this.executeGoal(goal, plan);
      response.execution = execution;
      response.executed = true;
    }

    return response;
  }

  async executeGoal(goal: string, plan?: PlanStep[]): Promise<ExecutionStep[]> {
    const finalPlan = plan ?? this.createPlan(goal);
    const execution = await this.executor.execute(finalPlan, goal);
    await this.addMemory('GoalExecuted', { goal, execution, executedAt: new Date().toISOString() });
    return execution;
  }

  createPlan(goal: string): PlanStep[] {
    const normalizedGoal = goal.trim();
    const steps: PlanStep[] = [
      { id: 'discover', title: 'Analyze requirements', description: `Understand the goal and required deliverables for: ${normalizedGoal}` },
      { id: 'design', title: 'Design architecture', description: 'Create a fullstack architecture, tech stack, and system design for the solution.' },
      { id: 'build', title: 'Implement the code', description: 'Generate and wire together the required frontend, backend, and infrastructure components.' },
      { id: 'test', title: 'Validate and test', description: 'Run tests, verify behavior, and ensure the solution meets expectations.' },
      { id: 'deploy', title: 'Deploy or package', description: 'Prepare deploy artifacts and output deployment instructions or automation.' }
    ];

    if (normalizedGoal.toLowerCase().includes('api') || normalizedGoal.toLowerCase().includes('service')) {
      steps.push({ id: 'integrate', title: 'Integrate APIs', description: 'Connect APIs, database layers, authentication, and delivery endpoints.' });
    }

    if (normalizedGoal.toLowerCase().includes('pwa') || normalizedGoal.toLowerCase().includes('frontend')) {
      steps.push({ id: 'performance', title: 'Optimize performance', description: 'Improve front-end performance, accessibility, and progressive web app behavior.' });
    }

    return steps;
  }

  async registerProxy(name: string, endpoint: string, auth?: Record<string, string>) {
    this.proxyManager.registerProxy(name, endpoint, auth);
    await this.addMemory('ProxyRegistered', { name, endpoint, auth, registeredAt: new Date().toISOString() });
  }

  async registerTool(tool: ToolDefinition) {
    this.toolManager.registerTool(tool);
    await this.addMemory('ToolRegistered', { tool, registeredAt: new Date().toISOString() });
  }

  async registerConnector(connector: ModelConnectorDefinition) {
    this.modelManager.registerConnector(connector);
    await this.addMemory('ConnectorRegistered', { connector, registeredAt: new Date().toISOString() });
  }

  async registerPlugin(plugin: PluginDefinition) {
    await this.pluginManager.loadPlugin(plugin, this);
    await this.addMemory('PluginRegistered', { name: plugin.name, description: plugin.description, registeredAt: new Date().toISOString() });
  }

  async addMemory(topic: string, data: unknown) {
    await this.memory.append({
      id: crypto.randomUUID(),
      topic,
      data: safeJsonParse(data),
      timestamp: new Date().toISOString()
    });
  }

  async getMemory() {
    return this.memory.all();
  }

  private loadDefaultTools() {
    const builtins: Array<ToolDefinition> = [
      {
        name: 'discover',
        category: 'analysis',
        description: 'Identify requirements and key constraints.',
        execute: async (input, context) => {
          return {
            message: `Analyzed goal: ${context.goal}`,
            details: `Determined architecture boundaries and primary deliverables for ${context.goal}.`,
            step: input
          };
        }
      },
      {
        name: 'design',
        category: 'design',
        description: 'Define systems, interfaces, and data flow.',
        execute: async (input, context) => {
          return {
            message: `Designed architecture for: ${context.goal}`,
            summary: 'Recommended fullstack design with layered backend, responsive frontend, and deployment pipeline.',
            step: input
          };
        }
      },
      {
        name: 'build',
        category: 'build',
        description: 'Shape the implementation plan and coding workflow.',
        execute: async (input, context) => {
          return {
            message: `Built a developer plan for: ${context.goal}`,
            artifacts: ['frontend scaffold', 'backend service', 'CI/CD definitions'],
            step: input
          };
        }
      },
      {
        name: 'test',
        category: 'test',
        description: 'Create validation and quality checks.',
        execute: async (input, context) => {
          return {
            message: `Created test plan for: ${context.goal}`,
            tests: ['unit tests', 'integration checks', 'end-to-end validation'],
            step: input
          };
        }
      },
      {
        name: 'deploy',
        category: 'deploy',
        description: 'Package and prepare deployment instructions.',
        execute: async (input, context) => {
          return {
            message: `Prepared deployment strategy for: ${context.goal}`,
            deployment: ['containerize', 'configure infrastructure', 'create launch steps'],
            step: input
          };
        }
      },
      {
        name: 'integrate',
        category: 'integration',
        description: 'Wire APIs, authentication, and persistence.',
        execute: async (input, context) => {
          return {
            message: `Integrated API and data layers for: ${context.goal}`,
            details: 'Connected backend routes, database models, auth flows, and mocked external services.',
            step: input
          };
        }
      },
      {
        name: 'performance',
        category: 'optimization',
        description: 'Optimize performance and accessibility.',
        execute: async (input, context) => {
          return {
            message: `Optimized performance for: ${context.goal}`,
            improvements: ['minified assets', 'accessible UI', 'service worker caching'],
            step: input
          };
        }
      }
    ];

    builtins.forEach((tool) => this.toolManager.registerTool(tool));
  }

  private loadDefaultConnectors() {
    if (!this.modelManager.listConnectors().length) {
      this.modelManager.registerConnector({
        name: 'default',
        type: 'placeholder',
        endpoint: 'http://localhost:4000/mock-model',
        description: 'Default connector placeholder for model-driven execution.'
      });
    }
  }
}
