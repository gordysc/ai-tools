import chalk from 'chalk';
import clipboard from 'clipboardy';
import { findProjectRoot } from '../lib/standards.js';
import { assemblePrompt } from '../lib/prompt-builder.js';
import { updateState, stateExists } from '../lib/state.js';
import { join } from 'path';

type CreateType = 'prd' | 'crd' | 'drd';

const TYPE_TO_PHASE: Record<CreateType, string> = {
  prd: 'create-prd',
  crd: 'create-crd',
  drd: 'create-drd'
};

const TYPE_DESCRIPTIONS: Record<CreateType, string> = {
  prd: 'Product Requirements Document',
  crd: 'Content Requirements Document',
  drd: 'Design Requirements Document'
};

export async function create(type: string, name: string): Promise<void> {
  try {
    // Validate type
    if (!['prd', 'crd', 'drd'].includes(type)) {
      console.error(chalk.red(`Invalid type: ${type}`));
      console.log('Valid types: prd, crd, drd');
      process.exit(1);
    }

    const createType = type as CreateType;
    const phase = TYPE_TO_PHASE[createType];
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
    const assembled = await assemblePrompt(projectRoot, phase, name);

    // Copy to clipboard
    await clipboard.write(assembled.content);

    // Update state
    const suggestedPath = join('tasks', assembled.suggestedFilename);
    await updateState(projectRoot, {
      project: name,
      phase: phase,
      lastFile: suggestedPath
    });

    // Output
    console.log(
      chalk.green(
        `Assembled ${TYPE_DESCRIPTIONS[createType]} prompt with ${assembled.standardsCount} standards (v${assembled.standardsVersion})`
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
