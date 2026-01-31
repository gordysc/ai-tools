import chalk from 'chalk';
import clipboard from 'clipboardy';
import { findProjectRoot } from '../lib/standards.js';
import { assemblePrompt } from '../lib/prompt-builder.js';
import { updateState, stateExists } from '../lib/state.js';
import { join } from 'path';

export async function research(name: string): Promise<void> {
  try {
    const projectRoot = await findProjectRoot();

    // Check if initialized
    if (!(await stateExists(projectRoot))) {
      console.log(
        chalk.yellow('Project not initialized. Running init first...')
      );
      const { init } = await import('./init.js');
      await init();
      console.log('');
    }

    // Assemble the prompt
    const assembled = await assemblePrompt(projectRoot, 'research', name);

    // Copy to clipboard
    await clipboard.write(assembled.content);

    // Update state
    const suggestedPath = join('tasks', assembled.suggestedFilename);
    await updateState(projectRoot, {
      project: name,
      phase: 'research',
      lastFile: suggestedPath
    });

    // Output
    console.log(
      chalk.green(
        `Assembled research prompt with ${assembled.standardsCount} standards (v${assembled.standardsVersion})`
      )
    );
    console.log(
      chalk.cyan(
        `Copied to clipboard (${assembled.content.length.toLocaleString()} chars)`
      )
    );
    console.log('');
    console.log('Applied standards:');
    for (const std of assembled.appliedStandards) {
      console.log(chalk.dim(`  - ${std}`));
    }
    console.log('');
    console.log(chalk.yellow(`Save AI response to: ${suggestedPath}`));
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }
}
