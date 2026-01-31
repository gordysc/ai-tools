import { existsSync, statSync } from 'fs';
import { resolve, basename, join } from 'path';
import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { glob } from 'glob';
import { findProjectRoot } from '../lib/standards.js';
import { updateState, loadState, stateExists } from '../lib/state.js';
import {
  parseTaskFile,
  getNextIncompleteTask,
  markTaskComplete,
  getProgress
} from '../lib/tasks.js';

export async function execute(taskFile?: string): Promise<void> {
  try {
    const projectRoot = await findProjectRoot();

    // Check if initialized
    if (!(await stateExists(projectRoot))) {
      console.error(
        chalk.red('Project not initialized. Run `ait init` first.')
      );
      process.exit(1);
    }

    // Resolve task file
    let filePath: string | null = null;

    if (taskFile) {
      // User provided a task file
      if (existsSync(taskFile)) {
        filePath = resolve(taskFile);
      } else if (existsSync(join(projectRoot, 'tasks', taskFile))) {
        filePath = resolve(join(projectRoot, 'tasks', taskFile));
      } else if (existsSync(join(projectRoot, 'tasks', `${taskFile}.md`))) {
        filePath = resolve(join(projectRoot, 'tasks', `${taskFile}.md`));
      }
    } else {
      // Try to find task file from state or latest
      const state = await loadState(projectRoot);
      if (state?.lastFile && state.lastFile.includes('tasks-')) {
        const candidate = join(projectRoot, state.lastFile);
        if (existsSync(candidate)) {
          filePath = candidate;
        }
      }

      // If still no file, find the most recent tasks file
      if (!filePath) {
        const taskFiles = await glob(join(projectRoot, 'tasks', 'tasks-*.md'));
        if (taskFiles.length > 0) {
          // Sort by modification time
          const sorted = taskFiles.sort((a, b) => {
            const statA = statSync(a);
            const statB = statSync(b);
            return statB.mtime.getTime() - statA.mtime.getTime();
          });
          filePath = sorted[0];
        }
      }
    }

    if (!filePath || !existsSync(filePath)) {
      console.error(chalk.red('No task file found.'));
      console.log('Usage: ait execute [task-file]');
      console.log('');
      console.log(
        'The task file should be in tasks/ directory and match pattern tasks-*.md'
      );
      process.exit(1);
    }

    // Parse the task file
    const parsed = await parseTaskFile(filePath);
    const progress = getProgress(parsed);

    console.log(chalk.bold(`Task File: ${basename(filePath)}`));
    console.log(
      chalk.dim(
        `Progress: ${progress.completedSubtasks}/${progress.totalSubtasks} subtasks (${progress.percentComplete}%)`
      )
    );
    console.log('');

    // Find next incomplete task
    const next = getNextIncompleteTask(parsed);

    if (!next) {
      console.log(chalk.green('All tasks completed!'));
      return;
    }

    // Show current task
    console.log(chalk.cyan('Current Task:'));
    console.log(chalk.bold(`  Parent: ${next.parent.title}`));
    console.log(
      chalk.yellow(`  Subtask [${next.subtask.id}]: ${next.subtask.title}`)
    );
    console.log('');

    // Check if parent has other incomplete subtasks
    const remainingInParent = next.parent.subtasks.filter(
      s => !s.completed
    ).length;
    console.log(
      chalk.dim(
        `  ${remainingInParent} subtask(s) remaining in this parent task`
      )
    );
    console.log('');

    // Ask if user wants to mark as complete
    const shouldComplete = await confirm({
      message: 'Mark this subtask as complete?',
      default: false
    });

    if (shouldComplete) {
      await markTaskComplete(filePath, next.subtask.id);
      console.log(chalk.green(`Marked [${next.subtask.id}] as complete`));

      // Check if parent is now complete
      const updatedParsed = await parseTaskFile(filePath);
      const parent = updatedParsed.parents.find(p => p.id === next.parent.id);

      if (
        parent &&
        parent.subtasks.every(s => s.completed) &&
        !parent.completed
      ) {
        const shouldCompleteParent = await confirm({
          message: `All subtasks complete. Mark parent "${next.parent.title}" as complete?`,
          default: true
        });

        if (shouldCompleteParent) {
          await markTaskComplete(filePath, next.parent.id);
          console.log(
            chalk.green(`Marked parent [${next.parent.id}] as complete`)
          );
          console.log(
            chalk.yellow('Remember to commit and push your changes!')
          );
        }
      }

      // Update state
      await updateState(projectRoot, {
        phase: 'execute-tasks',
        lastFile: join('tasks', basename(filePath))
      });

      // Show next task
      const nextParsed = await parseTaskFile(filePath);
      const nextTask = getNextIncompleteTask(nextParsed);
      if (nextTask) {
        console.log('');
        console.log(chalk.cyan('Next Task:'));
        console.log(chalk.bold(`  Parent: ${nextTask.parent.title}`));
        console.log(
          chalk.yellow(
            `  Subtask [${nextTask.subtask.id}]: ${nextTask.subtask.title}`
          )
        );
      } else {
        console.log('');
        console.log(chalk.green('All tasks completed!'));
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }
}
