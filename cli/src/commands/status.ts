import { existsSync } from 'fs';
import { join, basename } from 'path';
import chalk from 'chalk';
import { findProjectRoot } from '../lib/standards.js';
import { loadState, stateExists } from '../lib/state.js';
import {
  parseTaskFile,
  getProgress,
  getNextIncompleteTask
} from '../lib/tasks.js';

export async function status(): Promise<void> {
  try {
    const projectRoot = await findProjectRoot();

    // Check if initialized
    if (!(await stateExists(projectRoot))) {
      console.log(chalk.yellow('Project not initialized.'));
      console.log('Run `ait init` to initialize.');
      return;
    }

    const state = await loadState(projectRoot);
    if (!state) {
      console.log(chalk.yellow('No state found.'));
      return;
    }

    // Display state
    console.log(chalk.bold('Project Status'));
    console.log('');
    console.log(`  Project: ${chalk.cyan(state.project || 'Not set')}`);
    console.log(`  Phase:   ${chalk.cyan(state.phase || 'Not set')}`);
    console.log(`  Last:    ${chalk.dim(state.lastFile || 'None')}`);
    console.log(`  Updated: ${chalk.dim(state.updated)}`);

    // If there's a task file, show progress
    if (state.lastFile && state.lastFile.includes('tasks-')) {
      const taskPath = join(projectRoot, state.lastFile);
      if (existsSync(taskPath)) {
        console.log('');
        console.log(chalk.bold('Task Progress'));

        const parsed = await parseTaskFile(taskPath);
        const progress = getProgress(parsed);

        console.log(`  File: ${chalk.dim(basename(taskPath))}`);
        console.log(
          `  Parents: ${progress.completedParents}/${progress.totalParents} complete`
        );
        console.log(
          `  Subtasks: ${progress.completedSubtasks}/${progress.totalSubtasks} complete (${progress.percentComplete}%)`
        );

        // Progress bar
        const barWidth = 30;
        const filled = Math.round((progress.percentComplete / 100) * barWidth);
        const bar =
          chalk.green('█'.repeat(filled)) +
          chalk.dim('░'.repeat(barWidth - filled));
        console.log(`  [${bar}]`);

        // Next task
        const next = getNextIncompleteTask(parsed);
        if (next) {
          console.log('');
          console.log(`  ${chalk.yellow('Next:')} ${next.subtask.title}`);
          console.log(`        ${chalk.dim(`(in: ${next.parent.title})`)}`);
        }
      }
    }

    // Suggested next command
    console.log('');
    console.log(chalk.bold('Next Steps'));
    if (!state.project) {
      console.log('  ait research <name>    Start a new project');
    } else if (state.phase === 'research') {
      console.log(`  ait create prd ${state.project}    Create requirements`);
    } else if (state.phase?.startsWith('create-')) {
      console.log(`  ait generate <requirements-file>   Generate tasks`);
    } else if (
      state.phase === 'generate-tasks' ||
      state.phase === 'execute-tasks'
    ) {
      console.log('  ait execute    Continue task execution');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }
}
