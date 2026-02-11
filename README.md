# TareasZen

A local task management app built with Tauri and React. No cloud, no accounts, your data stays on your machine.

## What it does

Create tasks with title, description, priority, due date and reminders. Organize them with labels (a task can have multiple labels). Filter and sort by what matters. Get notified about overdue tasks and reminders when you open the app.

Automatic backups can be configured to run in the background.

## Tech Stack

Rust backend with SQLite database. React/TypeScript frontend. Packaged as a native desktop app via Tauri.

Runs on Linux and Windows.

## Building from source

You'll need Rust, Node.js, and some system dependencies. See SETUP.md for detailed instructions per platform.

Quick start:

```bash
npm install
npm run tauri dev
```

Production build:

```bash
npm run tauri build
```

The binary ends up in `src-tauri/target/release/`.

## Project structure

```
src/                    React frontend
src-tauri/src/          Rust backend
  database.rs           SQLite operations
  main.rs               Tauri commands
```

## Database

SQLite file stored in your local app data folder:

- Linux: `~/.local/share/tareaszen/`
- Windows: `%LOCALAPPDATA%\tareaszen\`

## License

MIT