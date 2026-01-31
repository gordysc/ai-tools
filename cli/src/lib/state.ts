import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { AitState } from '../types/index.js';

const STATE_DIR = '.ait';
const STATE_FILE = 'state.json';

function getStatePath(projectRoot: string): string {
  return join(projectRoot, STATE_DIR, STATE_FILE);
}

function getStateDir(projectRoot: string): string {
  return join(projectRoot, STATE_DIR);
}

export async function initState(projectRoot: string): Promise<AitState> {
  const stateDir = getStateDir(projectRoot);
  await mkdir(stateDir, { recursive: true });

  const now = new Date().toISOString();
  const state: AitState = {
    project: null,
    phase: null,
    lastFile: null,
    created: now,
    updated: now
  };

  await saveState(projectRoot, state);
  return state;
}

export async function loadState(projectRoot: string): Promise<AitState | null> {
  try {
    const content = await readFile(getStatePath(projectRoot), 'utf-8');
    return JSON.parse(content) as AitState;
  } catch {
    return null;
  }
}

export async function saveState(
  projectRoot: string,
  state: AitState
): Promise<void> {
  state.updated = new Date().toISOString();
  await writeFile(getStatePath(projectRoot), JSON.stringify(state, null, 2));
}

export async function updateState(
  projectRoot: string,
  updates: Partial<Omit<AitState, 'created' | 'updated'>>
): Promise<AitState> {
  let state = await loadState(projectRoot);
  if (!state) {
    state = await initState(projectRoot);
  }

  Object.assign(state, updates);
  await saveState(projectRoot, state);
  return state;
}

export async function stateExists(projectRoot: string): Promise<boolean> {
  try {
    await readFile(getStatePath(projectRoot));
    return true;
  } catch {
    return false;
  }
}
