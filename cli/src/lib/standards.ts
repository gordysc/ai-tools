import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import yaml from 'js-yaml';
import type { StandardsManifest, PhaseConfig } from '../types/index.js';

export async function findProjectRoot(): Promise<string> {
  // Look for standards-manifest.yml to find project root
  let dir = process.cwd();
  while (dir !== '/') {
    try {
      await readFile(join(dir, 'standards', 'standards-manifest.yml'));
      return dir;
    } catch {
      dir = dirname(dir);
    }
  }
  throw new Error(
    'Could not find project root (no standards/standards-manifest.yml found)'
  );
}

export async function loadManifest(
  projectRoot: string
): Promise<StandardsManifest> {
  const manifestPath = join(projectRoot, 'standards', 'standards-manifest.yml');
  const content = await readFile(manifestPath, 'utf-8');
  return yaml.load(content) as StandardsManifest;
}

export async function loadStandardsForPhase(
  projectRoot: string,
  phase: string
): Promise<{ standards: string[]; content: string; version: string }> {
  const manifest = await loadManifest(projectRoot);
  const phaseConfig = manifest.phases[phase];

  if (!phaseConfig) {
    throw new Error(
      `Unknown phase: ${phase}. Available phases: ${Object.keys(manifest.phases).join(', ')}`
    );
  }

  const standardContents: string[] = [];

  for (const standardPath of phaseConfig.includes) {
    const fullPath = join(projectRoot, 'standards', standardPath);
    try {
      const content = await readFile(fullPath, 'utf-8');
      standardContents.push(
        `\n---\n## Standard: ${standardPath}\n\n${content}`
      );
    } catch (error) {
      console.warn(`Warning: Could not load standard ${standardPath}`);
    }
  }

  return {
    standards: phaseConfig.includes,
    content: standardContents.join('\n'),
    version: manifest.version
  };
}

export async function getPhaseConfig(
  projectRoot: string,
  phase: string
): Promise<PhaseConfig> {
  const manifest = await loadManifest(projectRoot);
  const config = manifest.phases[phase];
  if (!config) {
    throw new Error(`Unknown phase: ${phase}`);
  }
  return config;
}

export async function listPhases(projectRoot: string): Promise<string[]> {
  const manifest = await loadManifest(projectRoot);
  return Object.keys(manifest.phases);
}
