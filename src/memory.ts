import fs from 'fs/promises';
import path from 'path';
import type { MemoryEntry } from './types.js';

export class MemoryStore {
  private path: string;
  private store: MemoryEntry[] = [];

  constructor(memoryPath: string) {
    this.path = memoryPath;
  }

  get size() {
    return this.store.length;
  }

  async load() {
    const folder = path.dirname(this.path);
    await fs.mkdir(folder, { recursive: true });
    try {
      const raw = await fs.readFile(this.path, 'utf8');
      const parsed = JSON.parse(raw) as MemoryEntry[];
      this.store = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      this.store = [];
      await this.persist();
    }
  }

  async append(entry: MemoryEntry) {
    this.store.push(entry);
    await this.persist();
  }

  async persist() {
    await fs.writeFile(this.path, JSON.stringify(this.store, null, 2), 'utf8');
  }

  all() {
    return [...this.store];
  }
}
