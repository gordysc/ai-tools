import { mkdir } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';
import { findProjectRoot } from '../lib/standards.js';
import { initState, stateExists } from '../lib/state.js';

export async function init(): Promise<void> {
  try {
    const projectRoot = await findProjectRoot();

    // Check if already initialized
    if (await stateExists(projectRoot)) {
      console.log(chalk.yellow('Project already initialized.'));
      console.log(`  State file: ${join(projectRoot, '.ait', 'state.json')}`);
      return;
    }

    // Create .ait directory and tasks directory
    await mkdir(join(projectRoot, '.ait'), { recursive: true });
    await mkdir(join(projectRoot, 'tasks'), { recursive: true });

    // Initialize state
    await initState(projectRoot);

    console.log(chalk.green('Initialized .ait/ directory'));
    console.log(`  Project root: ${projectRoot}`);
    console.log(`  State file: ${join(projectRoot, '.ait', 'state.json')}`);
    console.log(`  Tasks directory: ${join(projectRoot, 'tasks')}`);
    console.log('');
    console.log(chalk.cyan('Next steps:'));
    console.log('  ait research <name>     Start with research phase');
    console.log('  ait create prd <name>   Jump to PRD creation');
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }
}
