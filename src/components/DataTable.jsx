import { useMemo, useState } from 'react'
import { Download, FileSpreadsheet, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

const defaultPageSizes = [10, 20, 50]

const toDisplayText = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return JSON.stringify(value)
}

const getNestedValue = (record, key) => {
  if (!key) {
    return undefined
  }

  return key.split('.').reduce((current, segment) => current?.[segment], record)
}

const generateCsv = (rows, columns) => {
  const headers = columns.map((column) => `"${String(column.label || column.key || '').replace(/"/g, '""')}"`)
  const dataRows = rows.map((row) =>
    columns
      .map((column) => {
        const rawValue = column.exportValue
          ? column.exportValue(row)
          : column.accessor
            ? getNestedValue(row, column.accessor)
            : row[column.key]

        return `"${toDisplayText(rawValue).replace(/"/g, '""')}"`
      })
      .join(','),
  )

  return [headers.join(','), ...dataRows].join('\n')
}

const generateExcelHtml = (rows, columns, sheetName = 'Export') => {
  const escapeHtml = (value) =>
    toDisplayText(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  const headerRow = columns.map((column) => `<th>${escapeHtml(column.label || column.key || '')}</th>`).join('')
  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((column) => {
            const rawValue = column.exportValue
              ? column.exportValue(row)
              : column.accessor
                ? getNestedValue(row, column.accessor)
                : row[column.key]

            return `<td>${escapeHtml(rawValue)}</td>`
          })
          .join('')}</tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(sheetName)}</title>
</head>
<body>
  <table border="1">
    <thead><tr>${headerRow}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
</body>
</html>`
}

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export default function DataTable({
  title,
  description,
  rows = [],
  columns = [],
  rowKey = 'id',
  searchPlaceholder = 'Search records',
  searchKeys = [],
  filters = [],
  actions = null,
  emptyState = null,
  pageSizes = defaultPageSizes,
  initialPageSize = 10,
  loading = false,
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [page, setPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' })
  const debouncedSearch = useDebouncedValue(searchTerm, 200)

  const preparedRows = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()

    const filtered = rows.filter((row) => {
      const matchesSearch =
        !query ||
        searchKeys.some((key) =>
          toDisplayText(getNestedValue(row, key) ?? row[key] ?? '')
            .toLowerCase()
            .includes(query),
        )

      const matchesFilters = filters.every((filter) => {
        if (!filter?.value || filter.value === 'all') {
          return true
        }

        const fieldValue = toDisplayText(getNestedValue(row, filter.key) ?? row[filter.key] ?? '').toLowerCase()
        return String(filter.value).toLowerCase() === fieldValue
      })

      return matchesSearch && matchesFilters
    })

    if (!sortConfig.key) {
      return filtered
    }

    const column = columns.find((item) => item.key === sortConfig.key)
    if (!column) {
      return filtered
    }

    const directionMultiplier = sortConfig.direction === 'asc' ? 1 : -1
    const sortAccessor = column.sortAccessor || column.accessor || column.key

    return [...filtered].sort((left, right) => {
      const leftValue = getNestedValue(left, sortAccessor) ?? left[sortAccessor]
      const rightValue = getNestedValue(right, sortAccessor) ?? right[sortAccessor]

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return (leftValue - rightValue) * directionMultiplier
      }

      return String(leftValue ?? '')
        .localeCompare(String(rightValue ?? ''), undefined, { numeric: true, sensitivity: 'base' })
        * directionMultiplier
    })
  }, [columns, debouncedSearch, filters, rows, searchKeys, sortConfig.direction, sortConfig.key])

  const totalPages = Math.max(1, Math.ceil(preparedRows.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return preparedRows.slice(startIndex, startIndex + pageSize)
  }, [currentPage, pageSize, preparedRows])

  const handleSort = (columnKey, sortable = true) => {
    if (!sortable) {
      return
    }

    setPage(1)
    setSortConfig((current) => {
      if (current.key !== columnKey) {
        return { key: columnKey, direction: 'asc' }
      }

      return { key: columnKey, direction: current.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  const handleExportCsv = () => {
    const csv = generateCsv(preparedRows, columns)
    downloadFile(csv, `${title || 'export'}.csv`, 'text/csv;charset=utf-8')
  }

  const handleExportExcel = () => {
    const html = generateExcelHtml(preparedRows, columns, title || 'Export')
    downloadFile(html, `${title || 'export'}.xls`, 'application/vnd.ms-excel;charset=utf-8')
  }

  const startRecord = preparedRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRecord = Math.min(currentPage * pageSize, preparedRows.length)

  return (
    <section className={`rounded-[32px] border border-slate-200 bg-white shadow-sm ${className}`.trim()}>
      <div className="flex flex-col gap-5 border-b border-slate-200 p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {title ? <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-600">{title}</p> : null}
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {actions}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </button>
        </div>
      </div>

      <div className="space-y-4 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => {
                setPage(1)
                setSearchTerm(event.target.value)
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-300"
            />
          </div>

          {filters.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <label key={filter.key} className="min-w-[160px]">
                  {filter.label ? (
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">
                      {filter.label}
                    </span>
                  ) : null}
                  <select
                    value={filter.value}
                    onChange={(event) => {
                      setPage(1)
                      filter.onChange?.(event.target.value)
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-300"
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.25em] text-slate-400">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-6 py-4 ${column.sortable === false ? '' : 'cursor-pointer select-none'}`}
                      onClick={() => handleSort(column.key, column.sortable !== false)}
                    >
                      <div className="inline-flex items-center gap-2">
                        <span>{column.label}</span>
                        {column.sortable === false ? null : <ArrowUpDown className="h-3.5 w-3.5" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-16 text-center text-sm text-slate-500">
                      Loading records...
                    </td>
                  </tr>
                ) : paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-16">
                      {emptyState || (
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-900">No records found</p>
                          <p className="mt-2 text-sm text-slate-500">
                            Try a different search term or adjust the filters to see more results.
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => (
                    <tr key={row[rowKey] ?? row.id ?? JSON.stringify(row)} className="transition hover:bg-slate-50/70">
                      {columns.map((column) => {
                        const value = column.render
                          ? column.render(row)
                          : toDisplayText(getNestedValue(row, column.accessor || column.key) ?? row[column.key] ?? '')

                        return (
                          <td key={column.key} className={`px-6 py-4 align-top ${column.className || ''}`}>
                            {value}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{startRecord}</span> to{' '}
            <span className="font-semibold text-slate-900">{endRecord}</span> of{' '}
            <span className="font-semibold text-slate-900">{preparedRows.length}</span> records
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-500">
              Rows per page
              <select
                value={pageSize}
                onChange={(event) => {
                  setPage(1)
                  setPageSize(Number(event.target.value))
                }}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-300"
              >
                {pageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-20 text-center text-sm font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

