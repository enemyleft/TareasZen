# TaskFlow

Eine einfache, lokale Task-Management-App mit Labels, Prioritäten und Drag & Drop.

## Features

- 📋 Tasks mit Titel, Beschreibung, Priorität, Fälligkeitsdatum und Erinnerung
- 🏷️ Labels für Projekte und Themenbereiche (viele-zu-viele Beziehung)
- 🔀 Drag & Drop zum Sortieren
- 🔍 Filter nach Label, Priorität und Status
- 📊 Sortierung nach Position, Priorität, Erstellungsdatum oder Fälligkeitsdatum
- 💾 Lokale SQLite-Datenbank (keine Cloud, keine Server)
- 🖥️ Läuft auf Linux und Windows

## Voraussetzungen

- [Rust](https://rustup.rs/) (1.70+)
- [Node.js](https://nodejs.org/) (18+)
- Linux: `sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev`
- Windows: WebView2 (meist vorinstalliert)

## Installation & Start

```bash
# Dependencies installieren
npm install

# Development-Modus starten
npm run tauri dev

# Production Build erstellen
npm run tauri build
```

## Projektstruktur

```
taskflow/
├── src/                    # React Frontend
│   ├── components/         # UI Komponenten
│   ├── api.ts              # Tauri API Aufrufe
│   ├── types.ts            # TypeScript Typen
│   ├── App.tsx             # Hauptkomponente
│   └── styles.css          # Styling
├── src-tauri/              # Rust Backend
│   ├── src/
│   │   ├── main.rs         # Tauri Commands
│   │   └── database.rs     # SQLite Operationen
│   └── Cargo.toml          # Rust Dependencies
└── package.json
```

## Datenbank-Schema

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   tasks     │     │ task_labels  │     │   labels    │
├─────────────┤     ├──────────────┤     ├─────────────┤
│ id          │────<│ task_id      │     │ id          │
│ title       │     │ label_id     │>────│ name        │
│ description │     └──────────────┘     │ color       │
│ priority    │                          │ created_at  │
│ created_at  │                          └─────────────┘
│ due_date    │
│ reminder    │
│ completed   │
│ position    │
└─────────────┘
```

## Tastenkürzel (geplant)

- `Ctrl+N` - Neuer Task
- `Ctrl+L` - Labels verwalten
- `Escape` - Modal schließen

## Lizenz

MIT
