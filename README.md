# Mc_Ai

Mc_Ai is the autonomous coding agent scaffold built in this repository. It includes a local HTTP runtime, persistent memory store, proxy manager, and simple CLI for self-directed coding workflows.

## What this project includes

- `src/index.ts`: startup server and CLI entrypoint
- `src/mc_ai.ts`: core Mc_Ai engine, memory, planning, and prompt/soul control
- `src/memory.ts`: persistent JSON memory store
- `src/proxy.ts`: proxy manager for external service orchestration
- `src/cli.ts`: interactive terminal commands for goals, prompts, soul updates, and status
- `tsconfig.json` / `package.json`: TypeScript configuration and runtime scripts

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Run Mc_Ai in development mode:

```bash
npm run dev
```

3. Open the CLI and issue goals:

```text
Mc_Ai> goal Build a fullstack prototype with React and Node
Mc_Ai> run Build a fullstack prototype with React and Node
```

4. Change the system prompt or soul:

```text
Mc_Ai> system You are Mc_Ai, the most adaptive autonomous engineer.
Mc_Ai> soul Build with speed, correctness, and relentless pragmatism.
```

5. Inspect agent state:

```text
Mc_Ai> status
Mc_Ai> tools
Mc_Ai> connectors
Mc_Ai> memory
```

## HTTP API

- `GET /status` — get the current agent state
- `GET /memory` — read persistent memory entries
- `GET /tools` — list registered tools
- `GET /connectors` — list registered model connectors
- `POST /goal` — submit a goal and receive a plan
- `POST /execute` — execute a goal plan
- `POST /tool` — register a new tool placeholder
- `POST /connector` — register a model connector
- `POST /proxy` — register an external proxy
- `POST /system-prompt` — update the system prompt
- `POST /soul` — update the agent soul

## Notes

This repository is a starting implementation for Mc_Ai. It is designed to be extended with real planning, tool execution, multi-agent orchestration, and external model connectors.
