# 🤖 AIT CLI

Command-line tool for the AI Tools workflow management framework.

## 📦 Installation

```bash
cd cli
npm install
npm run build
npm link
```

This makes the `ait` command available globally.

## 🔧 Commands

### 🚀 Initialize Project

```bash
ait init
```

Creates `.ait/` directory for state tracking and `tasks/` directory for output documents.

### 🔍 Research Phase

```bash
ait research <project-name>
```

Assembles the research prompt with applicable standards and copies to clipboard.

**Example:**

```bash
$ ait research user-auth
✅ Assembled research prompt with 6 standards (v1.0.0)
📋 Copied to clipboard (45,001 chars)
💾 Save AI response to: tasks/rsd-user-auth-v1.md
```

### 📝 Create Requirements

```bash
ait create <type> <name>
```

Types:

- `prd` - 📦 Product Requirements Document
- `crd` - ✍️ Content Requirements Document
- `drd` - 🎨 Design Requirements Document

**Example:**

```bash
$ ait create prd user-auth
✅ Assembled Product Requirements Document prompt with 5 standards (v1.0.0)
📋 Copied to clipboard (23,927 chars)
💾 Save AI response to: tasks/prd-user-auth-v1.md
```

### 📋 Generate Tasks

```bash
ait generate <requirements-file>
```

Assembles the task generation prompt from a requirements document.

**Example:**

```bash
$ ait generate prd-user-auth-v1.md
✅ Assembled task generation prompt with 2 standards (v1.0.0)
📄 Source: prd-user-auth-v1.md
📋 Copied to clipboard
💾 Save AI response to: tasks/tasks-user-auth-v1.md
```

### ▶️ Execute Tasks

```bash
ait execute [task-file]
```

Interactive task tracking. Shows the next incomplete task and prompts to mark complete.

**Example:**

```bash
$ ait execute
📁 Task File: tasks-user-auth.md
📊 Progress: 3/12 subtasks (25%)

🎯 Current Task:
  Parent: Set up authentication routes
  Subtask [P2.1]: Create login endpoint

? Mark this subtask as complete? (y/N)
```

### 📊 Check Status

```bash
ait status
```

Shows current project state, phase, and task progress.

**Example:**

```bash
$ ait status
📊 Project Status

  Project: user-auth
  Phase:   create-prd
  Last:    tasks/prd-user-auth-v1.md
  Updated: 2024-01-15T10:30:00.000Z

👉 Next Steps
  ait generate <requirements-file>   Generate tasks
```

### 📂 List Documents

```bash
ait list
```

Lists all documents in the `tasks/` directory, grouped by type.

## 🔄 Workflow

1. **🔍 Research** → Gather context before writing requirements

   ```bash
   ait research my-feature
   # Paste prompt to AI, save response to tasks/rsd-my-feature-v1.md
   ```

2. **📝 Create** → Write requirements document (PRD, CRD, or DRD)

   ```bash
   ait create prd my-feature
   # Paste prompt to AI, save response to tasks/prd-my-feature-v1.md
   ```

3. **📋 Generate** → Convert requirements into tasks

   ```bash
   ait generate prd-my-feature-v1.md
   # Paste prompt to AI, save response to tasks/tasks-my-feature-v1.md
   ```

4. **▶️ Execute** → Work through tasks with tracking
   ```bash
   ait execute
   # Mark tasks complete as you work
   ```

## 🔢 Version Management

The CLI automatically increments version numbers:

- `prd-user-auth-v1.md` → `prd-user-auth-v2.md` → `prd-user-auth-v3.md`

## 💾 State Tracking

Project state is stored in `.ait/state.json`:

- 📁 Current project name
- 🔄 Current workflow phase
- 📄 Last generated file

The `.ait/` directory should be added to `.gitignore`.

## 🛠️ Development

```bash
npm run dev    # 👀 Watch mode for TypeScript
npm run build  # 🔨 Build once
npm run format # ✨ Format with Prettier
```
