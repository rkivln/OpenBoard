import React from 'react';
import { TableElement, CanvasElement } from '../../types.ts';
import { Plus, X, GripHorizontal, Table as TableIcon, Trash2 } from 'lucide-react';

interface EditableTableViewProps {
  element: TableElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent, id: string) => void;
  onUpdate: (updated: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  zoom: number;
}

export const EditableTableView: React.FC<EditableTableViewProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  zoom,
}) => {
  // Normalize table data and purge any legacy mock data
  let headers = element.tableData?.headers;
  let rows = element.tableData?.rows;

  if (!headers && element.data && Array.isArray(element.data) && element.data.length > 0) {
    headers = [...element.data[0]];
    rows = element.data.slice(1).map((r) => [...r]);
  }

  // Detect and replace any residual mock data
  const isMockData =
    headers &&
    headers.length >= 2 &&
    ((headers[0] === 'Feature' && headers[1] === 'Owner') ||
      (headers[0] === 'Task Item' && headers[1] === 'Assignee') ||
      (headers[0] === 'Deliverable' && headers[1] === 'Owner'));

  if (!headers || headers.length === 0 || isMockData) {
    headers = ['Column 1', 'Column 2', 'Column 3'];
    rows = [
      ['', '', ''],
      ['', '', ''],
    ];
  }

  if (!rows || rows.length === 0) {
    rows = [
      new Array(headers.length).fill(''),
      new Array(headers.length).fill(''),
    ];
  }

  // Ensure all rows match header count
  rows = rows.map((row) => {
    if (row.length < headers.length) {
      return [...row, ...new Array(headers.length - row.length).fill('')];
    }
    return row.slice(0, headers.length);
  });

  const colCount = headers.length;
  const rowCount = rows.length;

  // Header change handler
  const handleHeaderChange = (colIdx: number, val: string) => {
    const nextHeaders = [...headers];
    nextHeaders[colIdx] = val;
    onUpdate({
      tableData: {
        headers: nextHeaders,
        rows,
      },
    });
  };

  // Cell change handler
  const handleCellChange = (rowIdx: number, colIdx: number, val: string) => {
    const nextRows = rows.map((r, rI) => {
      if (rI === rowIdx) {
        const nextR = [...r];
        nextR[colIdx] = val;
        return nextR;
      }
      return r;
    });
    onUpdate({
      tableData: {
        headers,
        rows: nextRows,
      },
    });
  };

  // Add column
  const handleAddColumn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextHeaders = [...headers, `Column ${headers.length + 1}`];
    const nextRows = rows.map((r) => [...r, '']);
    const newWidth = Math.max((element.width ?? 380) + 120, nextHeaders.length * 120 + 40);
    onUpdate({
      width: newWidth,
      tableData: {
        headers: nextHeaders,
        rows: nextRows,
      },
    });
  };

  // Delete column
  const handleDeleteColumn = (e: React.MouseEvent, colIdx: number) => {
    e.stopPropagation();
    if (headers.length <= 1) return;
    const nextHeaders = headers.filter((_, idx) => idx !== colIdx);
    const nextRows = rows.map((r) => r.filter((_, idx) => idx !== colIdx));
    const newWidth = Math.max(260, (element.width ?? 380) - 120);
    onUpdate({
      width: newWidth,
      tableData: {
        headers: nextHeaders,
        rows: nextRows,
      },
    });
  };

  // Add row
  const handleAddRow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newRow = new Array(headers.length).fill('');
    const nextRows = [...rows, newRow];
    const newHeight = (element.height ?? 180) + 38;
    onUpdate({
      height: newHeight,
      tableData: {
        headers,
        rows: nextRows,
      },
    });
  };

  // Delete row
  const handleDeleteRow = (e: React.MouseEvent, rowIdx: number) => {
    e.stopPropagation();
    if (rows.length <= 1) return;
    const nextRows = rows.filter((_, idx) => idx !== rowIdx);
    const newHeight = Math.max(130, (element.height ?? 180) - 38);
    onUpdate({
      height: newHeight,
      tableData: {
        headers,
        rows: nextRows,
      },
    });
  };

  // Dynamic dimensions
  const minTableWidth = Math.max(element.width ?? 380, colCount * 120 + 64);
  const minTableHeight = Math.max(element.height ?? 180, (rowCount + 1) * 38 + 68);

  // Keyboard navigation between cells
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rIdx: number,
    cIdx: number,
    isHeader: boolean = false
  ) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (!e.shiftKey) {
        // Next cell
        if (isHeader) {
          if (cIdx < colCount - 1) {
            const nextEl = document.getElementById(`tbl-${element.id}-head-${cIdx + 1}`);
            nextEl?.focus();
          } else {
            const nextEl = document.getElementById(`tbl-${element.id}-cell-0-0`);
            nextEl?.focus();
          }
        } else {
          if (cIdx < colCount - 1) {
            const nextEl = document.getElementById(`tbl-${element.id}-cell-${rIdx}-${cIdx + 1}`);
            nextEl?.focus();
          } else if (rIdx < rowCount - 1) {
            const nextEl = document.getElementById(`tbl-${element.id}-cell-${rIdx + 1}-0`);
            nextEl?.focus();
          } else {
            // Auto-add new row at the end if tabbing from last cell!
            const newRow = new Array(headers.length).fill('');
            const nextRows = [...rows, newRow];
            onUpdate({
              height: (element.height ?? 180) + 38,
              tableData: {
                headers,
                rows: nextRows,
              },
            });
            setTimeout(() => {
              const newCellEl = document.getElementById(`tbl-${element.id}-cell-${rIdx + 1}-0`);
              newCellEl?.focus();
            }, 50);
          }
        }
      } else {
        // Prev cell (Shift+Tab)
        if (isHeader) {
          if (cIdx > 0) {
            const prevEl = document.getElementById(`tbl-${element.id}-head-${cIdx - 1}`);
            prevEl?.focus();
          }
        } else {
          if (cIdx > 0) {
            const prevEl = document.getElementById(`tbl-${element.id}-cell-${rIdx}-${cIdx - 1}`);
            prevEl?.focus();
          } else if (rIdx > 0) {
            const prevEl = document.getElementById(`tbl-${element.id}-cell-${rIdx - 1}-${colCount - 1}`);
            prevEl?.focus();
          } else {
            const prevEl = document.getElementById(`tbl-${element.id}-head-${colCount - 1}`);
            prevEl?.focus();
          }
        }
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isHeader) {
        const nextEl = document.getElementById(`tbl-${element.id}-cell-0-${cIdx}`);
        nextEl?.focus();
      } else {
        if (rIdx < rowCount - 1) {
          const nextEl = document.getElementById(`tbl-${element.id}-cell-${rIdx + 1}-${cIdx}`);
          nextEl?.focus();
        } else {
          // Add new row on Enter from last row
          const newRow = new Array(headers.length).fill('');
          const nextRows = [...rows, newRow];
          onUpdate({
            height: (element.height ?? 180) + 38,
            tableData: {
              headers,
              rows: nextRows,
            },
          });
          setTimeout(() => {
            const nextEl = document.getElementById(`tbl-${element.id}-cell-${rIdx + 1}-${cIdx}`);
            nextEl?.focus();
          }, 50);
        }
      }
    }
  };

  return (
    <foreignObject
      x={element.x}
      y={element.y}
      width={minTableWidth}
      height={minTableHeight}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'BUTTON') {
          e.stopPropagation();
          onSelect(e, element.id);
        }
      }}
      className="overflow-visible pointer-events-auto"
    >
      <div
        id={`elem-${element.id}`}
        className="w-full h-full bg-white rounded-xl shadow-lg border border-slate-200/90 overflow-hidden flex flex-col transition-shadow select-text"
      >
        {/* Table Top Drag Handle & Toolbar */}
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            onSelect(e, element.id);
          }}
          className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 cursor-move select-none"
        >
          <div className="flex items-center gap-1.5 font-medium">
            <GripHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <TableIcon className="w-3.5 h-3.5 text-purple-600" />
            <span className="font-semibold text-slate-700">Table</span>
            <span className="text-[11px] text-slate-400 font-normal">
              ({colCount} cols × {rowCount} rows)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAddColumn}
              onMouseDown={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-medium transition-colors cursor-pointer"
              title="Add Column"
            >
              <Plus className="w-3 h-3" />
              Column
            </button>
            <button
              onClick={handleAddRow}
              onMouseDown={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-medium transition-colors cursor-pointer"
              title="Add Row"
            >
              <Plus className="w-3 h-3" />
              Row
            </button>
            {isSelected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(element.id);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer ml-1"
                title="Delete Table"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Interactive Scrollable Table Content */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-xs">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200">
                <th className="w-8 py-2 px-1 text-center font-normal text-slate-400 border-r border-slate-200 select-none">
                  #
                </th>
                {headers.map((head, cIdx) => (
                  <th
                    key={cIdx}
                    className="relative group p-1.5 border-r border-slate-200 font-semibold text-slate-700 text-left min-w-[110px]"
                  >
                    <div className="flex items-center gap-1">
                      <input
                        id={`tbl-${element.id}-head-${cIdx}`}
                        type="text"
                        value={head}
                        placeholder={`Column ${cIdx + 1}`}
                        onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 0, cIdx, true)}
                        onFocus={() => {
                          if (!isSelected) {
                            onSelect({ stopPropagation: () => {} } as any, element.id);
                          }
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 text-xs font-semibold text-zinc-900 bg-transparent rounded hover:bg-white focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-colors border border-transparent focus:border-[#0071e3] truncate cursor-text select-text"
                      />
                      {headers.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteColumn(e, cIdx)}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose-100 text-zinc-400 hover:text-rose-600 rounded transition-opacity cursor-pointer shrink-0"
                          title="Delete Column"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-10 p-1 border-b border-zinc-200 bg-zinc-50 text-center">
                  <button
                    onClick={handleAddColumn}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-6 h-6 inline-flex items-center justify-center hover:bg-blue-50 text-[#0071e3] rounded-md transition-colors cursor-pointer active:scale-95"
                    title="Add column"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody>
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="group border-b border-zinc-100 last:border-none hover:bg-zinc-50/60 transition-colors"
                >
                  {/* Row Number / Delete Action */}
                  <td className="w-8 py-1.5 px-1 text-center border-r border-zinc-200 select-none">
                    {rows.length > 1 ? (
                      <div className="relative flex items-center justify-center">
                        <span className="text-[11px] text-zinc-400 group-hover:hidden font-mono">
                          {rIdx + 1}
                        </span>
                        <button
                          onClick={(e) => handleDeleteRow(e, rIdx)}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="hidden group-hover:inline-flex p-0.5 hover:bg-rose-100 text-zinc-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Delete row"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-zinc-400 font-mono">1</span>
                    )}
                  </td>

                  {/* Cell Inputs */}
                  {row.map((cellValue, cIdx) => (
                    <td
                      key={cIdx}
                      className="p-1 border-r border-zinc-200 min-w-[110px]"
                    >
                      <input
                        id={`tbl-${element.id}-cell-${rIdx}-${cIdx}`}
                        type="text"
                        value={cellValue}
                        placeholder="Empty..."
                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rIdx, cIdx, false)}
                        onFocus={() => {
                          if (!isSelected) {
                            onSelect({ stopPropagation: () => {} } as any, element.id);
                          }
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1.5 text-xs text-zinc-800 bg-transparent rounded hover:bg-white focus:bg-white focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none transition-colors border border-transparent focus:border-[#0071e3] cursor-text select-text"
                      />
                    </td>
                  ))}

                  {/* Empty cell to match + Col column */}
                  <td className="w-10 bg-zinc-50/40" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Add Row Bar */}
        <button
          onClick={handleAddRow}
          onMouseDown={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-1.5 py-1.5 bg-zinc-50 hover:bg-blue-50/80 text-zinc-500 hover:text-[#0071e3] text-xs font-medium border-t border-zinc-200 transition-colors cursor-pointer active:scale-98"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add row</span>
        </button>

        {/* Selection Indicator Border */}
        {isSelected && (
          <div className="absolute -inset-1 border-2 border-[#0071e3] pointer-events-none rounded-xl shadow-2xs" />
        )}
      </div>
    </foreignObject>
  );
};
