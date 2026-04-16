import readline from 'readline';
import type { McAi } from './mc_ai.js';

export function startCli(mcAi: McAi) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Mc_Ai> '
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    if (input.startsWith('goal ')) {
      const goal = input.slice(5).trim();
      const outcome = await mcAi.receiveGoal(goal);
      console.log(JSON.stringify(outcome, null, 2));
    } else if (input.startsWith('run ')) {
      const goal = input.slice(4).trim();
      const outcome = await mcAi.receiveGoal(goal, true);
      console.log(JSON.stringify(outcome, null, 2));
    } else if (input.startsWith('system ')) {
      const prompt = input.slice(7).trim();
      await mcAi.setSystemPrompt(prompt);
      console.log('System prompt saved.');
    } else if (input.startsWith('soul ')) {
      const soul = input.slice(5).trim();
      await mcAi.setSoul(soul);
      console.log('Soul saved.');
    } else if (input.startsWith('proxy ')) {
      const [name, endpoint] = input.slice(6).trim().split(' ');
      if (!name || !endpoint) {
        console.log('Usage: proxy <name> <endpoint>');
      } else {
        await mcAi.registerProxy(name, endpoint);
        console.log(`Proxy ${name} registered.`);
      }
    } else if (input === 'tools') {
      console.log(JSON.stringify(mcAi.toolManager.listTools(), null, 2));
    } else if (input === 'connectors') {
      console.log(JSON.stringify(mcAi.modelManager.listConnectors(), null, 2));
    } else if (input === 'memory') {
      console.log(JSON.stringify(await mcAi.getMemory(), null, 2));
    } else if (input === 'status') {
      console.log(JSON.stringify(await mcAi.status(), null, 2));
    } else if (input === 'help') {
      console.log('Commands: goal <text>, run <text>, system <prompt>, soul <text>, proxy <name> <endpoint>, tools, connectors, memory, status, help, exit');
    } else if (input === 'exit' || input === 'quit') {
      rl.close();
      process.exit(0);
    } else {
      console.log('Unknown command. Type help.');
    }

    rl.prompt();
  });
}
