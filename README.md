# AI Tools

A collection of AI prompt templates for structured software development, content creation, and design workflows. These prompts guide AI assistants through a systematic **Create → Generate → Execute** process.

## Overview

This toolkit helps you break down complex projects into manageable pieces by:

1. **Creating** detailed requirement documents (PRD, CRD, or DRD)
2. **Generating** actionable task lists from those requirements
3. **Executing** tasks one-by-one with built-in checkpoints

All outputs are saved to a `/tasks` directory for tracking and reference.

## Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                         CREATE PHASE                            │
│  Choose the appropriate requirements document:                  │
│  • PRD (Product) - Features & functionality                     │
│  • CRD (Content) - Copy, messaging, articles                    │
│  • DRD (Design)  - UI, visuals, components                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        GENERATE PHASE                           │
│  Convert requirements into a structured task list               │
│  • Parent tasks with sub-tasks                                  │
│  • Relevant files identified                                    │
│  • Checkboxes for progress tracking                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        EXECUTE PHASE                            │
│  Work through tasks systematically                              │
│  • One sub-task at a time                                       │
│  • User approval between steps                                  │
│  • Auto-commit on parent task completion                        │
└─────────────────────────────────────────────────────────────────┘
```

## Prompt Files

| File | Purpose | Output |
|------|---------|--------|
| `create-prd.md` | Product Requirements Document | `tasks/prd-[feature-name]-[version].md` |
| `create-crd.md` | Content Requirements Document | `tasks/crd-[content-name]-[version].md` |
| `create-drd.md` | Design Requirements Document | `tasks/drd-[design-name]-[version].md` |
| `generate-tasks.md` | Task list generation | `tasks/tasks-[feature-name].md` |
| `execute-tasks.md` | Task execution guidelines | Updates the task list in place |

## Usage

### Step 1: Create a Requirements Document

Copy the contents of the appropriate `create-*.md` file into your AI assistant, then describe what you want to build.

**Example - Creating a PRD:**

```
[Paste contents of create-prd.md]

I want to add a user authentication system with email/password login and OAuth support.
```

The AI will:
1. Ask 3-5 clarifying questions with multiple-choice options
2. Generate a detailed requirements document
3. Save it to `/tasks/prd-user-auth-v1.md`

**Example - Creating a CRD:**

```
[Paste contents of create-crd.md]

I need onboarding email copy for new users who sign up for our SaaS product.
```

**Example - Creating a DRD:**

```
[Paste contents of create-drd.md]

Design a settings page with toggles for notifications, theme preferences, and account management.
```

### Step 2: Generate Tasks

Once you have a requirements document, use `generate-tasks.md` to create an actionable task list.

**Example:**

```
[Paste contents of generate-tasks.md]

Generate tasks based on: tasks/prd-user-auth-v1.md
```

The AI will:
1. Analyze the requirements document
2. Generate high-level parent tasks (including "Create feature branch")
3. Wait for your approval ("Go")
4. Break down each parent into detailed sub-tasks
5. Identify relevant files to create/modify
6. Save to `/tasks/tasks-user-auth.md`

**Sample output structure:**

```markdown
## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout `feature/user-auth`
- [ ] 1.0 Set up authentication database schema
  - [ ] 1.1 Create users table migration
  - [ ] 1.2 Add email and password_hash columns
  - [ ] 1.3 Create sessions table migration
- [ ] 2.0 Implement email/password authentication
  - [ ] 2.1 Create signup endpoint
  - [ ] 2.2 Create login endpoint
  - [ ] 2.3 Add password hashing utility
...
```

### Step 3: Execute Tasks

Use `execute-tasks.md` to work through the task list systematically.

**Example:**

```
[Paste contents of execute-tasks.md]

Execute the tasks in: tasks/tasks-user-auth.md
```

The AI will:
1. Read the task list and find the next uncompleted sub-task
2. Implement that sub-task
3. Mark it complete (`[x]`)
4. **Stop and wait for your approval** before continuing
5. Commit and push when a parent task is fully complete

**Interaction flow:**

```
AI: I've completed sub-task 1.1 (Create users table migration).
    Ready for the next sub-task?

You: y

AI: Working on sub-task 1.2 (Add email and password_hash columns)...
```

## Quick Reference

| What you want to do | Use this file |
|---------------------|---------------|
| Plan a new feature | `create-prd.md` |
| Plan content/copy | `create-crd.md` |
| Plan a design | `create-drd.md` |
| Break requirements into tasks | `generate-tasks.md` |
| Execute tasks step-by-step | `execute-tasks.md` |

## Directory Structure

```
ai-tools/
├── README.md
├── create-prd.md        # Product requirements template
├── create-crd.md        # Content requirements template
├── create-drd.md        # Design requirements template
├── generate-tasks.md    # Task generation rules
├── execute-tasks.md     # Task execution rules
└── tasks/               # Output directory (created automatically)
    ├── prd-*.md         # Product requirement docs
    ├── crd-*.md         # Content requirement docs
    ├── drd-*.md         # Design requirement docs
    └── tasks-*.md       # Generated task lists
```

## Tips

- **Version your requirements**: Documents are versioned (`-v1`, `-v2`) so you can iterate without losing history
- **Don't skip the clarifying questions**: They help produce more accurate requirements
- **Review parent tasks before proceeding**: Say "Go" only when the high-level plan looks right
- **Take your time during execution**: The pause-and-approve pattern prevents runaway changes
- **Keep the task file updated**: It serves as documentation of what was done

## Credits

Huge credits to Ryan Carson (ryancarson.com) who did most of this foundational work, and his demo on the "How I AI" podcast for lighting me on fire for this stuff.

## License

MIT
