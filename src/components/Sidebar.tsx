import { Label } from "../types";

interface SidebarProps {
  labels: Label[];
  selectedLabelId: string | null;
  onSelectLabel: (labelId: string | null) => void;
  onManageLabels: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({
  labels,
  selectedLabelId,
  onSelectLabel,
  onManageLabels,
  onOpenSettings,
}: SidebarProps) {
  return (
    <aside className="sidebar">
     
      <div className="sidebar-header">
        <h1 className="app-title">TareasZen</h1>
      </div>

      <nav className="sidebar-nav">
        
        <section className="nav-section ">
          <button className="nav-item" onClick={onOpenSettings}>
            <span className="nav-icon">⚙️</span>
            Settings
          </button>
        </section>
        
        <section className="nav-section">
          <h3 className="nav-section-title">view</h3>
          <button
            className={`nav-item ${!selectedLabelId ? "active" : ""}`}
            onClick={() => onSelectLabel(null)}
          >
            <span className="nav-icon">📋</span>
            all tasks
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
              onClick={() => onSelectLabel(label.id)}
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
