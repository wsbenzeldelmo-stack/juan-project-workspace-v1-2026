# Version Control with Git

Git lets you save checkpoints of the **code** and return to an earlier working version.

## This package is already Git-initialized

The ZIP includes an initial `main` branch and a v1.0.0 checkpoint. After extracting the folder, open Terminal/PowerShell inside it and verify:

```bash
git status
git log --oneline --decorate -5
```

Before making your own commits, set your identity on your machine if needed:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
```

## Before every feature

Create a branch:

```bash
git switch -c feature/project-table-update
```

Make and test your edits, then:

```bash
git status
git add .
git commit -m "Improve project table layout"
```

Return to main and merge only after testing:

```bash
git switch main
git merge feature/project-table-update
```

If your Git initially calls the default branch `master`, rename it once:

```bash
git branch -M main
```

## Versions/tags

When a version is stable:

```bash
git tag -a v1.0.0 -m "JUAN Project Workspace v1.0.0"
```

Future examples:
- `v1.0.1` = bug fix
- `v1.1.0` = new feature
- `v2.0.0` = major/breaking change

Update both `VERSION` and `CHANGELOG.md`.

## See history

```bash
git log --oneline --decorate --graph --all
```

## Undo an uncommitted file change

```bash
git restore path/to/file
```

## Go back to a known version safely

Prefer creating a new branch from a tag instead of deleting history:

```bash
git switch -c restore-v1 v1.0.0
```

## Important: Git does not back up app records

Projects/payments/clients stored in browser storage or Supabase are not automatically part of Git. Use the application's data backup/export separately.

## Optional GitHub/Vercel workflow later

Once you are comfortable, you can create a private GitHub repository, push `main`, and connect that repository to Vercel. Every reviewed commit to `main` can then deploy automatically.
