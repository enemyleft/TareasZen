import { SortBy, SortOrder } from "../types";

interface FilterBarProps {
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  filterPriority: number | null;
  setFilterPriority: (priority: number | null) => void;
  showCompleted: boolean;
  setShowCompleted: (show: boolean) => void;
}

export function FilterBar({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  filterPriority,
  setFilterPriority,
  showCompleted,
  setShowCompleted,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
          <option value="position">position</option>
          <option value="priority">priority</option>
          <option value="created_at">created</option>
          <option value="due_date">due</option>
        </select>
        <button
          className="btn-icon-small"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          title={sortOrder === "asc" ? "Ascending" : "Descending"}
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>

      <div className="filter-group">
        <label>priority:</label>
        <select
          value={filterPriority ?? ""}
          onChange={(e) =>
            setFilterPriority(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">all</option>
          <option value="3">high</option>
          <option value="2">medium</option>
          <option value="1">low</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          Show done
        </label>
      </div>
    </div>
  );
}
