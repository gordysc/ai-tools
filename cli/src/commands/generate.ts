import { existsSync } from 'fs';
import { resolve, basename } from 'path';
import chalk from 'chalk';
import clipboard from 'clipboardy';
import { findProjectRoot } from '../lib/standards.js';
import { assembleGeneratePrompt } from '../lib/prompt-builder.js';
import { updateState, stateExists } from '../lib/state.js';
import { join } from 'path';

export async function generate(requirementsFile: string): Promise<void> {
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

    // Resolve the requirements file path
    let filePath = requirementsFile;
    if (!existsSync(filePath)) {
      // Try in tasks directory
      filePath = join(projectRoot, 'tasks', requirementsFile);
    }
    if (!existsSync(filePath)) {
      // Try adding .md extension
      filePath = join(projectRoot, 'tasks', `${requirementsFile}.md`);
    }
    if (!existsSync(filePath)) {
      console.error(
        chalk.red(`Requirements file not found: ${requirementsFile}`)
      );
      console.log('Looked in:');
      console.log(`  - ${requirementsFile}`);
      console.log(`  - ${join(projectRoot, 'tasks', requirementsFile)}`);
      console.log(
        `  - ${join(projectRoot, 'tasks', `${requirementsFile}.md`)}`
      );
      process.exit(1);
    }

    filePath = resolve(filePath);

    // Assemble the prompt
    const assembled = await assembleGeneratePrompt(projectRoot, filePath);

    // Copy to clipboard
    await clipboard.write(assembled.content);

    // Extract name from requirements file
    const match = basename(filePath).match(/([a-z]+)-(.+)-v\d+\.md$/);
    const name = match ? match[2] : 'project';

    // Update state
    const suggestedPath = join('tasks', assembled.suggestedFilename);
    await updateState(projectRoot, {
      project: name,
      phase: 'generate-tasks',
      lastFile: suggestedPath
    });

    // Output
    console.log(
      chalk.green(
        `Assembled task generation prompt with ${assembled.standardsCount} standards (v${assembled.standardsVersion})`
      )
    );
    console.log(chalk.dim(`Source: ${basename(filePath)}`));
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
