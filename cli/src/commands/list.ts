import { join, basename } from 'path';
import { stat } from 'fs/promises';
import chalk from 'chalk';
import { glob } from 'glob';
import { findProjectRoot } from '../lib/standards.js';
import { parseVersionedFilename } from '../lib/versioning.js';

interface FileInfo {
  path: string;
  name: string;
  type: string;
  version: number | null;
  mtime: Date;
}

const TYPE_LABELS: Record<string, string> = {
  rsd: 'Research Summary',
  prd: 'Product Requirements',
  crd: 'Content Requirements',
  drd: 'Design Requirements',
  tasks: 'Task List'
};

export async function list(): Promise<void> {
  try {
    const projectRoot = await findProjectRoot();
    const tasksDir = join(projectRoot, 'tasks');

    // Find all markdown files in tasks directory
    const files = await glob(join(tasksDir, '*.md'));

    if (files.length === 0) {
      console.log(chalk.yellow('No documents found in tasks/ directory.'));
      console.log('');
      console.log('Get started with:');
      console.log('  ait research <name>    Start a research phase');
      console.log('  ait create prd <name>  Create a PRD');
      return;
    }

    // Get file info
    const fileInfos: FileInfo[] = [];
    for (const file of files) {
      const stats = await stat(file);
      const filename = basename(file);
      const parsed = parseVersionedFilename(filename);

      fileInfos.push({
        path: file,
        name: filename,
        type: parsed?.prefix || 'unknown',
        version: parsed?.version || null,
        mtime: stats.mtime
      });
    }

    // Sort by modification time (newest first)
    fileInfos.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    // Group by type
    const byType: Record<string, FileInfo[]> = {};
    for (const info of fileInfos) {
      if (!byType[info.type]) {
        byType[info.type] = [];
      }
      byType[info.type].push(info);
    }

    console.log(chalk.bold('Documents in tasks/'));
    console.log('');

    for (const [type, infos] of Object.entries(byType)) {
      const label = TYPE_LABELS[type] || type.toUpperCase();
      console.log(chalk.cyan(`${label} (${infos.length})`));

      for (const info of infos) {
        const versionStr = info.version ? chalk.dim(`v${info.version}`) : '';
        const dateStr = chalk.dim(info.mtime.toLocaleDateString());
        console.log(`  ${info.name} ${versionStr} ${dateStr}`);
      }
      console.log('');
    }

    console.log(chalk.dim(`Total: ${files.length} document(s)`));
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('project root')) {
        console.error(
          chalk.red('Error: Not in an AI Tools project directory.')
        );
      } else {
        console.error(chalk.red(`Error: ${error.message}`));
      }
    }
    process.exit(1);
  }
}
