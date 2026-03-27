import { Trans, useLingui } from "@lingui/react/macro";
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
  const { t } = useLingui();
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label><Trans>sort by:</Trans></label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
          <option value="priority"><Trans>priority</Trans></option>
          <option value="created_at"><Trans>created</Trans></option>
          <option value="due_date"><Trans>due</Trans></option>
          <option value="reminder_date"><Trans>reminder</Trans></option>
          <option value="completed_at"><Trans>completed</Trans></option>
        </select>
        <button
          className="btn-icon"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          title={sortOrder === "asc" ? t`Ascending` : t`Descending`}
        >
          {sortOrder === "asc" ? (
            <ArrowUpNarrowWide size={16} />
          ) : (
            <ArrowDownWideNarrow size={16} />
          )}
        </button>
      </div>

      <div className="filter-group">
        <label><Trans>Priority:</Trans></label>
        <select
          value={filterPriority ?? ""}
          onChange={(e) =>
            setFilterPriority(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value=""><Trans>All</Trans></option>
          <option value="3"><Trans>High</Trans></option>
          <option value="2"><Trans>Medium</Trans></option>
          <option value="1"><Trans>Low</Trans></option>
        </select>
      </div>

      <div className="filter-group">
        <label><Trans>Status:</Trans></label>
        <select
          value={showCompleted === null ? "" : showCompleted ? "completed" : "open"}
          onChange={(e) => {
            const val = e.target.value;
            setShowCompleted(val === "" ? null : val === "completed");
          }}>
          <option value=""><Trans>All</Trans></option>
          <option value="open"><Trans>Open</Trans></option>
          <option value="completed"><Trans>Completed</Trans></option>
        </select>
      </div>
    </div>
  );
}
