import { Settings, ClipboardList, GripVertical } from "lucide-react";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Label } from "../types";
import * as api from "../api";

interface SidebarProps {
  labels: Label[];
  selectedLabelId: string | null;
  onSelectLabel: (labelId: string | null) => void;
  onManageLabels: () => void;
  onOpenSettings: () => void;
  onLabelsReorder: () => void;
}

interface SortableLabelProps {
  label: Label;
  isSelected: boolean;
  onSelect: () => void;
}

function SortableLabel({ label, isSelected, onSelect }: SortableLabelProps) {
  const { t } = useLingui();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: label.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`nav-item ${isSelected ? "active" : ""}`}
    >
      <span
        className="drag-handle-label"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </span>
      <button
        className="label-button"
        onClick={onSelect}
      >
        <span
          className="label-dot"
          style={{ backgroundColor: label.color }}
        />
        {label.name}
      </button>
    </div>
  );
}

export function Sidebar({
  labels,
  selectedLabelId,
  onSelectLabel,
  onManageLabels,
  onOpenSettings,
  onLabelsReorder,
}: SidebarProps) {
  const { t } = useLingui();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = labels.findIndex((l) => l.id === active.id);
      const newIndex = labels.findIndex((l) => l.id === over.id);

      const reorderedLabels = arrayMove(labels, oldIndex, newIndex);
      const positions: [string, number][] = reorderedLabels.map((l, idx) => [
        l.id,
        idx,
      ]);

      try {
        await api.updateLabelPositions(positions);
        onLabelsReorder();
      } catch (error) {
        console.error("Failed to update label positions:", error);
      }
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Trans>
          <h1 className="app-title">TareasZen</h1>
        </Trans>
      </div>

      <nav className="sidebar-nav">
        
        <section className="nav-section">
          <button className="nav-item" onClick={onOpenSettings}>
            <span className="nav-icon">
              <Settings size={16} />
            </span>
            <Trans>
              Settings
            </Trans>
          </button>
        </section>
        
        <section className="nav-section">
          <Trans>
            <h3 className="nav-section-title">Views</h3>
          </Trans>
          <button
            className={`nav-item ${!selectedLabelId ? "active" : ""}`}
            onClick={() => onSelectLabel(null)}
          >
            <span className="nav-icon">
              <ClipboardList size={16} />
            </span>
            <Trans>
              All Tasks
            </Trans>
          </button>
        </section>

        <section className="nav-section">
          <div className="nav-section-header">
            <Trans>
              <h3 className="nav-section-title">Labels</h3>
            </Trans>
            <button className="btn-icon" onClick={onManageLabels} title={t`Manage labels`}>
              <Settings size={16} />
            </button>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={labels.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              {labels.map((label) => (
                <SortableLabel
                  key={label.id}
                  label={label}
                  isSelected={selectedLabelId === label.id}
                  onSelect={() => onSelectLabel(label.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
          {labels.length === 0 && (
            <p className="nav-empty"><Trans>No labels</Trans></p>
          )}
        </section>

      </nav>
    </aside>
  );
}