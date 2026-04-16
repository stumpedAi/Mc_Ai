import express from 'express';
import { McAi } from './mc_ai';
import { startCli } from './cli';

const PORT = Number(process.env.PORT ?? 4000);
const app = express();
const mcAi = new McAi();

app.use(express.json());

app.get('/status', async (req, res) => {
  res.json(await mcAi.status());
});

app.get('/memory', async (req, res) => {
  res.json(await mcAi.getMemory());
});

app.post('/goal', async (req, res) => {
  const goal = String(req.body.goal ?? '');
  const execute = Boolean(req.body.execute ?? false);
  if (!goal) {
    return res.status(400).json({ error: 'Missing goal in request body.' });
  }
  res.json(await mcAi.receiveGoal(goal, execute));
});

app.post('/execute', async (req, res) => {
  const goal = String(req.body.goal ?? '');
  if (!goal) {
    return res.status(400).json({ error: 'Missing goal in request body.' });
  }
  res.json({ execution: await mcAi.executeGoal(goal) });
});

app.post('/tool', async (req, res) => {
  const { name, description, category } = req.body;
  if (!name || !description || !category) {
    return res.status(400).json({ error: 'Missing tool name, description or category.' });
  }
  await mcAi.registerTool({
    name: String(name),
    description: String(description),
    category: String(category),
    execute: async (input) => ({ message: `Executed tool ${name}`, input })
  });
  res.json({ message: `Tool ${name} registered.` });
});

app.get('/tools', async (req, res) => {
  res.json(mcAi.toolManager.listTools());
});

app.post('/connector', async (req, res) => {
  const { name, type, endpoint, auth, description } = req.body;
  if (!name || !type || !endpoint) {
    return res.status(400).json({ error: 'Missing connector name, type, or endpoint.' });
  }
  await mcAi.registerConnector({
    name: String(name),
    type: String(type),
    endpoint: String(endpoint),
    auth: auth as Record<string, string> | undefined,
    description: String(description ?? '')
  });
  res.json({ message: `Connector ${name} registered.` });
});

app.get('/connectors', async (req, res) => {
  res.json(mcAi.modelManager.listConnectors());
});

app.post('/proxy', async (req, res) => {
  const { name, endpoint, auth } = req.body;
  if (!name || !endpoint) {
    return res.status(400).json({ error: 'Missing proxy name or endpoint.' });
  }
  await mcAi.registerProxy(String(name), String(endpoint), auth as Record<string, string> | undefined);
  res.json({ message: `Proxy ${name} registered.` });
});

app.post('/system-prompt', async (req, res) => {
  const prompt = String(req.body.prompt ?? '');
  await mcAi.setSystemPrompt(prompt);
  res.json({ message: 'System prompt updated.' });
});

app.post('/soul', async (req, res) => {
  const soul = String(req.body.soul ?? '');
  await mcAi.setSoul(soul);
  res.json({ message: 'Soul updated.' });
});

app.listen(PORT, async () => {
  await mcAi.initialize();
  console.log(`Mc_Ai online at http://localhost:${PORT}`);
  startCli(mcAi);
});
