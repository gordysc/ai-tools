import { glob } from 'glob';
import { join, basename } from 'path';

export interface VersionInfo {
  prefix: string;
  name: string;
  version: number;
  filename: string;
}

/**
 * Parse a versioned filename like "prd-user-auth-v2.md"
 */
export function parseVersionedFilename(filename: string): VersionInfo | null {
  const match = filename.match(/^([a-z]+)-(.+)-v(\d+)\.md$/);
  if (!match) return null;

  return {
    prefix: match[1],
    name: match[2],
    version: parseInt(match[3], 10),
    filename
  };
}

/**
 * Find the next version number for a given prefix and name
 */
export async function getNextVersion(
  tasksDir: string,
  prefix: string,
  name: string
): Promise<number> {
  const pattern = join(tasksDir, `${prefix}-${name}-v*.md`);
  const files = await glob(pattern);

  let maxVersion = 0;
  for (const file of files) {
    const info = parseVersionedFilename(basename(file));
    if (info && info.version > maxVersion) {
      maxVersion = info.version;
    }
  }

  return maxVersion + 1;
}

/**
 * Generate the next versioned filename
 */
export async function getNextVersionedFilename(
  tasksDir: string,
  prefix: string,
  name: string
): Promise<string> {
  const version = await getNextVersion(tasksDir, prefix, name);
  return `${prefix}-${name}-v${version}.md`;
}

/**
 * Get the latest version of a file
 */
export async function getLatestVersion(
  tasksDir: string,
  prefix: string,
  name: string
): Promise<string | null> {
  const pattern = join(tasksDir, `${prefix}-${name}-v*.md`);
  const files = await glob(pattern);

  if (files.length === 0) return null;

  let latest: VersionInfo | null = null;
  for (const file of files) {
    const info = parseVersionedFilename(basename(file));
    if (info && (!latest || info.version > latest.version)) {
      latest = info;
    }
  }

  return latest ? join(tasksDir, latest.filename) : null;
}

/**
 * List all versions of a file
 */
export async function listVersions(
  tasksDir: string,
  prefix: string,
  name: string
): Promise<VersionInfo[]> {
  const pattern = join(tasksDir, `${prefix}-${name}-v*.md`);
  const files = await glob(pattern);

  const versions: VersionInfo[] = [];
  for (const file of files) {
    const info = parseVersionedFilename(basename(file));
    if (info) {
      versions.push(info);
    }
  }

  return versions.sort((a, b) => a.version - b.version);
}
