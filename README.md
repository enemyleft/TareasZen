# TareasZen

A local-first task management app built with Rust, Tauri, and React. No cloud, no accounts — your data stays on your machine.

## Features

### Task Management
- Create tasks with title, description, priority, due date, and reminder date
- Mark tasks as complete with automatic timestamp
- Filter by label, priority, and completion status
- Sort by priority, due date, or creation date
- Full-text search across titles and descriptions

### Labels
- Organize tasks with multiple labels (many-to-many)
- Drag and drop to reorder labels in the sidebar
- Color-coded labels for visual organization

### Recurring Tasks
- Create tasks that repeat automatically
- Flexible intervals: daily, weekly, monthly, or specific day of month
- Optional end date
- Pause and resume recurring tasks
- Auto-generated tasks receive an "auto" label

### Mindfulness (Zen Mode)
- Optional mindfulness reminders after completing tasks
- Periodic reminders at configurable intervals (default: 42 minutes)
- Gentle prompts to take breaks, stretch, and breathe

### Backup
- Automatic backups at configurable intervals
- Custom backup location
- Manual backup option

### Notifications
- Startup notifications for overdue tasks and active reminders
- Periodic check for new notifications (even if app runs for days)

## Tech Stack

- **Backend**: Rust with SQLite database
- **Frontend**: React with TypeScript
- **Framework**: Tauri (lightweight, native desktop app)
- **Styling**: Custom CSS with dark theme

## Supported Platforms

- Linux (requires WebKitGTK)
- Windows (WebView2 included in Windows 10/11)

## Installation

### Pre-built Binaries

Download the latest release from the [Releases](https://github.com/enemyleft/tareaszen/releases) page.

### Building from Source

See [SETUP.md](SETUP.md) for detailed build instructions.

Quick start:

```bash
# Install dependencies
npm install

# Development mode
npm run tauri dev

# Production build
npm run tauri build
```

## Project Structure

```
src/                    React frontend
  components/           UI components
  api.ts                Tauri API calls
  types.ts              TypeScript types
  App.tsx               Main application
  styles.css            Styling

src-tauri/              Rust backend
  src/
    database.rs         SQLite operations
    main.rs             Tauri commands
```

## Data Storage

Your data is stored locally in a SQLite database:

- **Linux**: `~/.local/share/tareaszen/tareaszen.db`
- **Windows**: `%LOCALAPPDATA%\tareaszen\tareaszen.db`

Backups are stored in your configured backup location (default: `Documents/TareasZen Backups`).

## License

MIT
