import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { SortBy, SortOrder } from "../types";

interface FilterBarProps {
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  filterPriority: number | null;
  setFilterPriority: (priority: number | null) => void;
  showCompleted: boolean | null;
  setShowCompleted: (show: boolean | null) => void;
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
          <option value="priority">priority</option>
          <option value="created_at">created</option>
          <option value="due_date">due</option>
        </select>
        <button
          className="btn-icon"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          title={sortOrder === "asc" ? "Ascending" : "Descending"}
        >
          {sortOrder === "asc" ? (
            <ArrowUpNarrowWide size={16} />
          ) : (
            <ArrowDownWideNarrow size={16} />
          )}
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
        <label>Status:</label>
        <select
          value={showCompleted === null ? "" : showCompleted ? "completed" : "open"}
          onChange={(e) => {
            const val = e.target.value;
            setShowCompleted(val === "" ? null : val === "completed");
          }}>
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="completed">Completed</option>
        </select>
      </div>

    </div>
  );
}
