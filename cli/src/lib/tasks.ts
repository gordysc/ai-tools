import { readFile, writeFile } from 'fs/promises';
import type { ParsedTaskFile, TaskParent, TaskItem } from '../types/index.js';

/**
 * Parse a task file into structured data
 */
export async function parseTaskFile(filePath: string): Promise<ParsedTaskFile> {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  const parents: TaskParent[] = [];
  const relevantFiles: string[] = [];
  let currentParent: TaskParent | null = null;
  let inRelevantFiles = false;
  let parentCounter = 0;
  let subtaskCounter = 0;

  for (const line of lines) {
    // Check for Relevant Files section
    if (line.match(/^#+\s*Relevant Files/i)) {
      inRelevantFiles = true;
      continue;
    }

    // If in Relevant Files section, collect file paths
    if (inRelevantFiles) {
      if (line.match(/^#+\s/)) {
        // New section started
        inRelevantFiles = false;
      } else {
        const fileMatch = line.match(/^\s*-\s*`?([^`\n]+)`?/);
        if (fileMatch) {
          relevantFiles.push(fileMatch[1].trim());
        }
      }
    }

    // Check for parent task (## heading with checkbox)
    const parentMatch = line.match(/^##\s*\[([ x])\]\s*(.+)$/i);
    if (parentMatch) {
      parentCounter++;
      currentParent = {
        id: `P${parentCounter}`,
        title: parentMatch[2].trim(),
        completed: parentMatch[1].toLowerCase() === 'x',
        subtasks: []
      };
      parents.push(currentParent);
      subtaskCounter = 0;
      continue;
    }

    // Check for subtask (- [ ] item)
    const subtaskMatch = line.match(/^\s*-\s*\[([ x])\]\s*(.+)$/i);
    if (subtaskMatch && currentParent) {
      subtaskCounter++;
      const subtask: TaskItem = {
        id: `${currentParent.id}.${subtaskCounter}`,
        title: subtaskMatch[2].trim(),
        completed: subtaskMatch[1].toLowerCase() === 'x',
        parentId: currentParent.id
      };
      currentParent.subtasks.push(subtask);
    }
  }

  // Extract name from filename
  const nameMatch = filePath.match(/tasks-([^/]+)\.md$/);
  const name = nameMatch ? nameMatch[1] : 'unknown';

  return {
    name,
    parents,
    relevantFiles
  };
}

/**
 * Get the next incomplete task
 */
export function getNextIncompleteTask(
  taskFile: ParsedTaskFile
): { parent: TaskParent; subtask: TaskItem } | null {
  for (const parent of taskFile.parents) {
    if (parent.completed) continue;

    for (const subtask of parent.subtasks) {
      if (!subtask.completed) {
        return { parent, subtask };
      }
    }
  }
  return null;
}

/**
 * Mark a task as complete in the file
 */
export async function markTaskComplete(
  filePath: string,
  taskId: string
): Promise<void> {
  let content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  // Determine if this is a parent or subtask
  const isParent = !taskId.includes('.');
  let parentCounter = 0;
  let subtaskCounter = 0;
  let currentParentId = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for parent task
    const parentMatch = line.match(/^(##\s*\[)([ x])(\]\s*.+)$/i);
    if (parentMatch) {
      parentCounter++;
      currentParentId = `P${parentCounter}`;
      subtaskCounter = 0;

      if (isParent && taskId === currentParentId) {
        lines[i] = `${parentMatch[1]}x${parentMatch[3]}`;
        break;
      }
      continue;
    }

    // Check for subtask
    const subtaskMatch = line.match(/^(\s*-\s*\[)([ x])(\]\s*.+)$/i);
    if (subtaskMatch && currentParentId) {
      subtaskCounter++;
      const subtaskId = `${currentParentId}.${subtaskCounter}`;

      if (!isParent && taskId === subtaskId) {
        lines[i] = `${subtaskMatch[1]}x${subtaskMatch[3]}`;
        break;
      }
    }
  }

  await writeFile(filePath, lines.join('\n'));
}

/**
 * Get progress statistics
 */
export function getProgress(taskFile: ParsedTaskFile): {
  totalParents: number;
  completedParents: number;
  totalSubtasks: number;
  completedSubtasks: number;
  percentComplete: number;
} {
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  let completedParents = 0;

  for (const parent of taskFile.parents) {
    if (parent.completed) completedParents++;
    for (const subtask of parent.subtasks) {
      totalSubtasks++;
      if (subtask.completed) completedSubtasks++;
    }
  }

  const percentComplete =
    totalSubtasks > 0
      ? Math.round((completedSubtasks / totalSubtasks) * 100)
      : 0;

  return {
    totalParents: taskFile.parents.length,
    completedParents,
    totalSubtasks,
    completedSubtasks,
    percentComplete
  };
}
