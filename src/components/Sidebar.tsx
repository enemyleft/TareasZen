import { Label, ViewMode } from "../types";

interface SidebarProps {
  labels: Label[];
  selectedLabelId: string | null;
  onSelectLabel: (labelId: string | null) => void;
  onManageLabels: () => void;
  onOpenSettings: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function Sidebar({
  labels,
  selectedLabelId,
  onSelectLabel,
  onManageLabels,
  onOpenSettings,
  viewMode,
  onViewModeChange,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">TareasZen</h1>
      </div>

      <nav className="sidebar-nav">
        
        <section className="nav-section nav-section-bottom">
          <button className="nav-item" onClick={onOpenSettings}>
            <span className="nav-icon">⚙️</span>
            Settings
          </button>
        </section>
        
        <section className="nav-section">
          <h3 className="nav-section-title">views</h3>
          <button
            className={`nav-item ${
              viewMode === "all" && !selectedLabelId ? "active" : ""
            }`}
            onClick={() => {
              onViewModeChange("all");
              onSelectLabel(null);
            }}
          >
            <span className="nav-icon">📋</span>
            all tasks
          </button>
          <button
            className={`nav-item ${viewMode === "by-label" && !selectedLabelId ? "active" : ""}`}
            onClick={() => {
              onViewModeChange("by-label");
              onSelectLabel(null);
            }}
          >
            <span className="nav-icon">🏷️</span>
            by labels
          </button>
        </section>

        <section className="nav-section">
          <div className="nav-section-header">
            <h3 className="nav-section-title">labels</h3>
            <button className="btn-icon-small" onClick={onManageLabels} title="Labels verwalten">
              ⚙️
            </button>
          </div>
          {labels.map((label) => (
            <button
              key={label.id}
              className={`nav-item ${selectedLabelId === label.id ? "active" : ""}`}
              onClick={() => {
                onViewModeChange("all");
                onSelectLabel(label.id);
              }}
            >
              <span
                className="label-dot"
                style={{ backgroundColor: label.color }}
              />
              {label.name}
            </button>
          ))}
          {labels.length === 0 && (
            <p className="nav-empty">no labels</p>
          )}
        </section>
        
      </nav>
    </aside>
  );
}
