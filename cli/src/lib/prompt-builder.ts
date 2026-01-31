import { readFile } from 'fs/promises';
import { join } from 'path';
import { loadStandardsForPhase } from './standards.js';
import { getNextVersionedFilename } from './versioning.js';
import type { AssembledPrompt, PhaseType } from '../types/index.js';

const TEMPLATE_MAP: Record<string, string> = {
  research: 'research.md',
  'create-prd': 'create-prd.md',
  'create-crd': 'create-crd.md',
  'create-drd': 'create-drd.md',
  'generate-tasks': 'generate-tasks.md',
  'execute-tasks': 'execute-tasks.md'
};

const PREFIX_MAP: Record<string, string> = {
  research: 'rsd',
  'create-prd': 'prd',
  'create-crd': 'crd',
  'create-drd': 'drd',
  'generate-tasks': 'tasks',
  'execute-tasks': 'tasks'
};

export async function loadTemplate(
  projectRoot: string,
  phase: string
): Promise<string> {
  const templateFile = TEMPLATE_MAP[phase];
  if (!templateFile) {
    throw new Error(`Unknown phase: ${phase}`);
  }

  const templatePath = join(projectRoot, templateFile);
  return readFile(templatePath, 'utf-8');
}

export async function assemblePrompt(
  projectRoot: string,
  phase: string,
  name: string
): Promise<AssembledPrompt> {
  // Load the template
  const template = await loadTemplate(projectRoot, phase);

  // Load standards for this phase
  const {
    standards,
    content: standardsContent,
    version
  } = await loadStandardsForPhase(projectRoot, phase);

  // Find the Corporate Standards section and inject standards after it
  const injectionMarker = '## Corporate Standards';
  let assembledContent: string;

  if (template.includes(injectionMarker)) {
    // Find the position after the Corporate Standards section header
    const markerIndex = template.indexOf(injectionMarker);
    const nextSectionIndex = template.indexOf(
      '\n## ',
      markerIndex + injectionMarker.length
    );

    if (nextSectionIndex !== -1) {
      // Insert standards between Corporate Standards and next section
      const beforeStandards = template.slice(0, nextSectionIndex);
      const afterStandards = template.slice(nextSectionIndex);

      assembledContent = `${beforeStandards}

### Loaded Standards (${standards.length} files, version ${version})

${standardsContent}

${afterStandards}`;
    } else {
      // No next section, append at the end
      assembledContent = `${template}

### Loaded Standards (${standards.length} files, version ${version})

${standardsContent}`;
    }
  } else {
    // No Corporate Standards section, prepend standards
    assembledContent = `# Applied Standards (version ${version})

${standardsContent}

---

${template}`;
  }

  // Add project context at the top
  const projectContext = `# Project: ${name}

> This prompt was assembled by \`ait\` with ${standards.length} applicable standards.

`;

  assembledContent = projectContext + assembledContent;

  // Determine suggested filename
  const tasksDir = join(projectRoot, 'tasks');
  const prefix = PREFIX_MAP[phase] || phase;
  const suggestedFilename = await getNextVersionedFilename(
    tasksDir,
    prefix,
    name
  );

  return {
    content: assembledContent,
    standardsCount: standards.length,
    standardsVersion: version,
    appliedStandards: standards,
    suggestedFilename
  };
}

export async function assembleGeneratePrompt(
  projectRoot: string,
  requirementsFile: string
): Promise<AssembledPrompt> {
  // Load the requirements document
  const requirementsContent = await readFile(requirementsFile, 'utf-8');

  // Load the generate-tasks template
  const template = await loadTemplate(projectRoot, 'generate-tasks');

  // Load standards for generate-tasks phase
  const {
    standards,
    content: standardsContent,
    version
  } = await loadStandardsForPhase(projectRoot, 'generate-tasks');

  // Extract name from requirements file
  const match = requirementsFile.match(/([a-z]+)-(.+)-v\d+\.md$/);
  const name = match ? match[2] : 'project';

  // Assemble the prompt
  const assembledContent = `# Task Generation for: ${name}

> This prompt was assembled by \`ait\` with ${standards.length} applicable standards.

## Requirements Document

\`\`\`markdown
${requirementsContent}
\`\`\`

---

${template}

### Loaded Standards (${standards.length} files, version ${version})

${standardsContent}`;

  const tasksDir = join(projectRoot, 'tasks');
  const suggestedFilename = await getNextVersionedFilename(
    tasksDir,
    'tasks',
    name
  );

  return {
    content: assembledContent,
    standardsCount: standards.length,
    standardsVersion: version,
    appliedStandards: standards,
    suggestedFilename
  };
}
