import { useState, useEffect, useCallback } from "react";
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

import { TaskWithLabels, Label, ViewMode, SortBy, SortOrder } from "./types";
import * as api from "./api";
import { TaskCard } from "./components/TaskCard";
import { TaskForm } from "./components/TaskForm";
import { LabelManager } from "./components/LabelManager";
import { Sidebar } from "./components/Sidebar";
import { FilterBar } from "./components/FilterBar";
import { StartupNotification } from "./components/StartupNotifications";
import { Settings } from "./components/Settings";

function App() {
  const [tasks, setTasks] = useState<TaskWithLabels[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("position");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [filterPriority, setFilterPriority] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithLabels | null>(null);
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [showStartupNotification, setShowStartupNotification] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadData = useCallback(async () => {

    try {
      const [tasksData, labelsData] = await Promise.all([
        api.getAllTasks(),
        api.getAllLabels(),
      ]);
      setTasks(tasksData);
      setLabels(labelsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }

    // Check for automatic backup
    try {
      const backupResult = await api.checkAndRunBackup();
      if (backupResult) {
        console.log("Automatic backup created:", backupResult);
      }
    } catch (e) {
      console.error("Backup check failed:", e);
    }

  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredTasks.findIndex((t) => t.task.id === active.id);
      const newIndex = filteredTasks.findIndex((t) => t.task.id === over.id);

      const reorderedTasks = arrayMove(filteredTasks, oldIndex, newIndex);
      const positions: [string, number][] = reorderedTasks.map((t, idx) => [
        t.task.id,
        idx,
      ]);

      // Optimistic update
      setTasks((prev) => {
        const updated = [...prev];
        positions.forEach(([id, pos]) => {
          const task = updated.find((t) => t.task.id === id);
          if (task) task.task.position = pos;
        });
        return updated;
      });

      try {
        await api.updateTaskPositions(positions);
      } catch (error) {
        console.error("Failed to update positions:", error);
        loadData();
      }
    }
  };

  const handleCreateTask = async (
    title: string,
    description: string | null,
    priority: number,
    dueDate: string | null,
    reminderDate: string | null,
    labelIds: string[]
  ) => {
    try {
      const newTask = await api.createTask(
        title,
        description,
        priority,
        dueDate,
        reminderDate
      );
      for (const labelId of labelIds) {
        await api.addLabelToTask(newTask.id, labelId);
      }
      await loadData();
      setShowTaskForm(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleUpdateTask = async (
    taskWithLabels: TaskWithLabels,
    newLabelIds: string[]
  ) => {
    try {
      await api.updateTask(taskWithLabels.task);

      const currentLabelIds = taskWithLabels.labels.map((l) => l.id);
      const toAdd = newLabelIds.filter((id) => !currentLabelIds.includes(id));
      const toRemove = currentLabelIds.filter((id) => !newLabelIds.includes(id));

      for (const labelId of toAdd) {
        await api.addLabelToTask(taskWithLabels.task.id, labelId);
      }
      for (const labelId of toRemove) {
        await api.removeLabelFromTask(taskWithLabels.task.id, labelId);
      }

      await loadData();
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      await loadData();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleToggleComplete = async (taskWithLabels: TaskWithLabels) => {
    try {
      const isCompleting = !taskWithLabels.task.completed;
      const updatedTask = {
        ...taskWithLabels.task,
        completed: isCompleting,
        completed_at: isCompleting ? new Date().toISOString() : null,
      };
      await api.updateTask(updatedTask);
      await loadData();
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  // Filter and sort tasks
  let filteredTasks = [...tasks];

  if (selectedLabelId) {
    filteredTasks = filteredTasks.filter((t) =>
      t.labels.some((l) => l.id === selectedLabelId)
    );
  }

  if (filterPriority !== null) {
    filteredTasks = filteredTasks.filter(
      (t) => t.task.priority === filterPriority
    );
  }

  if (!showCompleted) {
    filteredTasks = filteredTasks.filter((t) => !t.task.completed);
  }

  filteredTasks.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "priority":
        comparison = b.task.priority - a.task.priority;
        break;
      case "created_at":
        comparison =
          new Date(a.task.created_at).getTime() -
          new Date(b.task.created_at).getTime();
        break;
      case "due_date":
        if (!a.task.due_date && !b.task.due_date) comparison = 0;
        else if (!a.task.due_date) comparison = 1;
        else if (!b.task.due_date) comparison = -1;
        else
          comparison =
            new Date(a.task.due_date).getTime() -
            new Date(b.task.due_date).getTime();
        break;
      default:
        comparison = a.task.position - b.task.position;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Group tasks by label for the by-label view
  const tasksByLabel = labels.map((label) => ({
    label,
    tasks: tasks.filter((t) => t.labels.some((l) => l.id === label.id)),
  }));

  const unlabledTasks = tasks.filter((t) => t.labels.length === 0);

  // get lists of overdue and reminder tasks to notify on startup
  const now = new Date();
  const overdueTasks = tasks.filter(
    (t) => t.task.due_date && !t.task.completed && new Date(t.task.due_date) < now
  );
  const reminderTasks = tasks.filter(
    (t) =>
      t.task.reminder_date &&
      !t.task.completed &&
      new Date(t.task.reminder_date) <= now &&
      !overdueTasks.some((o) => o.task.id === t.task.id)
  );

  return (
    <div className="app">
      <Sidebar
        labels={labels}
        selectedLabelId={selectedLabelId}
        onSelectLabel={setSelectedLabelId}
        onManageLabels={() => setShowLabelManager(true)}
        onOpenSettings={() => setShowSettings(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <main className="main-content">
        <header className="header">
          <h1>
            {selectedLabelId
              ? labels.find((l) => l.id === selectedLabelId)?.name
              : viewMode === "by-label"
              ? "all labels"
              : "all tasks"}
          </h1>
          <button className="btn-primary" onClick={() => setShowTaskForm(true)}>
            + new task
          </button>
        </header>

        <FilterBar
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          showCompleted={showCompleted}
          setShowCompleted={setShowCompleted}
        />

        {viewMode === "by-label" && !selectedLabelId ? (
          <div className="label-groups">
            {tasksByLabel.map(({ label, tasks: labelTasks }) => (
              <div key={label.id} className="label-group">
                <h2 className="label-group-title">
                  <span
                    className="label-dot"
                    style={{ backgroundColor: label.color }}
                  />
                  {label.name}
                  <span className="task-count">{labelTasks.length}</span>
                </h2>
                <div className="task-list">
                  {labelTasks.map((taskWithLabels) => (
                    <TaskCard
                      key={taskWithLabels.task.id}
                      taskWithLabels={taskWithLabels}
                      onEdit={() => setEditingTask(taskWithLabels)}
                      onDelete={() => handleDeleteTask(taskWithLabels.task.id)}
                      onToggleComplete={() =>
                        handleToggleComplete(taskWithLabels)
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
            {unlabledTasks.length > 0 && (
              <div className="label-group">
                <h2 className="label-group-title">
                  <span className="label-dot" style={{ backgroundColor: "#888" }} />
                  without label
                  <span className="task-count">{unlabledTasks.length}</span>
                </h2>
                <div className="task-list">
                  {unlabledTasks.map((taskWithLabels) => (
                    <TaskCard
                      key={taskWithLabels.task.id}
                      taskWithLabels={taskWithLabels}
                      onEdit={() => setEditingTask(taskWithLabels)}
                      onDelete={() => handleDeleteTask(taskWithLabels.task.id)}
                      onToggleComplete={() =>
                        handleToggleComplete(taskWithLabels)
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTasks.map((t) => t.task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="task-list">
                {filteredTasks.map((taskWithLabels) => (
                  <TaskCard
                    key={taskWithLabels.task.id}
                    taskWithLabels={taskWithLabels}
                    onEdit={() => setEditingTask(taskWithLabels)}
                    onDelete={() => handleDeleteTask(taskWithLabels.task.id)}
                    onToggleComplete={() => handleToggleComplete(taskWithLabels)}
                    sortable={sortBy === "position"}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {filteredTasks.length === 0 && (
          <div className="empty-state">
            <p>no tasks found</p>
            <button className="btn-secondary" onClick={() => setShowTaskForm(true)}>
              create first task
            </button>
          </div>
        )}
      </main>

      {showTaskForm && (
        <TaskForm
          labels={labels}
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskForm(false)}
        />
      )}

      {editingTask && (
        <TaskForm
          labels={labels}
          taskWithLabels={editingTask}
          onSubmit={(title, desc, prio, due, reminder, labelIds) =>
            handleUpdateTask(
              { ...editingTask, task: { ...editingTask.task, title, description: desc, priority: prio, due_date: due, reminder_date: reminder } },
              labelIds
            )
          }
          onCancel={() => setEditingTask(null)}
        />
      )}
      {showStartupNotification && (
        <StartupNotification
          overdueTasks={overdueTasks}
          reminderTasks={reminderTasks}
          onClose={() => setShowStartupNotification(false)}
        />
      )}
      {showLabelManager && (
        <LabelManager
          labels={labels}
          onClose={() => setShowLabelManager(false)}
          onRefresh={loadData}
        />
      )}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;
