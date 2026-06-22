import { useState, useMemo, useCallback } from 'react';
import {
  FiSearch,
  FiChevronUp,
  FiChevronDown,
  FiChevronsLeft,
  FiChevronsRight,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiInbox,
} from 'react-icons/fi';
import './DataTable.css';

export default function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Tìm kiếm...',
  pagination = true,
  pageSize = 10,
  actions = [],
  onAdd,
  addLabel = 'Thêm mới',
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  filters = [],
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({});

  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
      setCurrentPage(1);
    },
    [sortKey]
  );

  const handleFilterChange = useCallback((key, value) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (value === '' || value === undefined) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
    setCurrentPage(1);
  }, []);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const val = row[col.key];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      result = result.filter((row) => String(row[key]) === String(value));
    });

    // Apply sorting
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey] ?? '';
        const bVal = b[sortKey] ?? '';
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const cmp = String(aVal).localeCompare(String(bVal), 'vi');
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, search, activeFilters, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, filteredData.length);
  const pageData = pagination ? filteredData.slice(startIdx, endIdx) : filteredData;

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  const renderSkeletonRows = () => {
    const rows = [];
    for (let i = 0; i < pageSize; i++) {
      rows.push(
        <tr key={`skel-${i}`} className="dt-skeleton-row">
          {columns.map((col, j) => (
            <td key={j}>
              <div className="dt-skeleton-cell" />
            </td>
          ))}
          {actions.length > 0 && (
            <td>
              <div className="dt-skeleton-cell dt-skeleton-actions" />
            </td>
          )}
        </tr>
      );
    }
    return rows;
  };

  return (
    <div className="dt-container">
      {/* Toolbar */}
      <div className="dt-toolbar">
        <div className="dt-toolbar-left">
          {searchable && (
            <div className="dt-search">
              <FiSearch className="dt-search-icon" />
              <input
                type="text"
                className="dt-search-input"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
          {filters.length > 0 && (
            <div className="dt-filters">
              {filters.map((filter) => (
                <select
                  key={filter.key}
                  className="dt-filter-select"
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </div>
        {onAdd && (
          <button className="dt-add-btn" onClick={onAdd}>
            <FiPlus />
            <span>{addLabel}</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="dt-table-wrapper">
        <table className="dt-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={col.sortable !== false ? 'dt-sortable' : ''}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="dt-th-content">
                    <span>{col.label}</span>
                    {col.sortable !== false && (
                      <span className="dt-sort-arrows">
                        <FiChevronUp
                          className={`dt-sort-arrow ${
                            sortKey === col.key && sortDir === 'asc' ? 'dt-sort-active' : ''
                          }`}
                        />
                        <FiChevronDown
                          className={`dt-sort-arrow ${
                            sortKey === col.key && sortDir === 'desc' ? 'dt-sort-active' : ''
                          }`}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && <th className="dt-actions-header">Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              renderSkeletonRows()
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="dt-empty">
                  <div className="dt-empty-content">
                    <FiInbox className="dt-empty-icon" />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              pageData.map((row, rowIdx) => (
                <tr key={row.id ?? rowIdx} className="dt-row">
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="dt-actions-cell">
                      <div className="dt-actions">
                        {actions
                          .filter((act) => (act.show ? act.show(row) : true))
                          .map((act, actIdx) => (
                            <button
                              key={actIdx}
                              className="dt-action-btn"
                              style={act.color ? { color: act.color } : undefined}
                              title={act.label}
                              onClick={() => act.onClick(row)}
                            >
                              {act.icon}
                            </button>
                          ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && filteredData.length > 0 && (
        <div className="dt-pagination">
          <span className="dt-page-info">
            Hiển thị {startIdx + 1}-{endIdx} của {filteredData.length}
          </span>
          <div className="dt-page-controls">
            <button
              className="dt-page-btn"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(1)}
              title="Trang đầu"
            >
              <FiChevronsLeft />
            </button>
            <button
              className="dt-page-btn"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="Trang trước"
            >
              <FiChevronLeft />
            </button>
            {pageNumbers.map((num) => (
              <button
                key={num}
                className={`dt-page-btn ${num === safePage ? 'dt-page-active' : ''}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}
            <button
              className="dt-page-btn"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              title="Trang sau"
            >
              <FiChevronRight />
            </button>
            <button
              className="dt-page-btn"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              title="Trang cuối"
            >
              <FiChevronsRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
