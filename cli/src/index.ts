#!/usr/bin/env node

import { Command } from 'commander';
import { init } from './commands/init.js';
import { research } from './commands/research.js';
import { create } from './commands/create.js';
import { generate } from './commands/generate.js';
import { execute } from './commands/execute.js';
import { status } from './commands/status.js';
import { list } from './commands/list.js';

const program = new Command();

program
  .name('ait')
  .description('CLI tool for AI Tools workflow management')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize .ait/ directory and state')
  .action(init);

program
  .command('research <name>')
  .description('Assemble research prompt and copy to clipboard')
  .action(research);

program
  .command('create <type> <name>')
  .description('Assemble create prompt (prd|crd|drd) and copy to clipboard')
  .action(create);

program
  .command('generate <requirements-file>')
  .description('Assemble task generation prompt from requirements file')
  .action(generate);

program
  .command('execute [task-file]')
  .description('Track task progress and mark complete')
  .action(execute);

program
  .command('status')
  .description('Show current project state')
  .action(status);

program
  .command('list')
  .description('List documents in tasks/ directory')
  .action(list);

program.parse();
