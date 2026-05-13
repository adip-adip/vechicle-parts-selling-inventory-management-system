import { useState } from 'react'

interface Column<T> {
  header: string
  accessor: keyof T | ((item: T) => React.ReactNode)
  sortable?: boolean
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  isLoading?: boolean
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  actions?: (item: T) => React.ReactNode
}

export default function DataTable<T>({
  columns, data, keyExtractor, isLoading, onEdit, onDelete, actions,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const col = columns.find(c => c.header === sortKey)
    if (!col) return 0
    const aVal = typeof col.accessor === 'function' ? '' : (a[col.accessor] as string | number)
    const bVal = typeof col.accessor === 'function' ? '' : (b[col.accessor] as string | number)
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center text-slate-500">
        Loading...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map(col => (
                <th
                  key={col.header}
                  className={`px-4 py-3 text-left font-medium text-slate-600 ${
                    col.sortable ? 'cursor-pointer hover:text-slate-900 select-none' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.header)}
                >
                  {col.header}
                  {col.sortable && sortKey === col.header && (
                    <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
              {(onEdit || onDelete || actions) && (
                <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-400">
                  No data found
                </td>
              </tr>
            ) : (
              sorted.map(item => (
                <tr key={keyExtractor(item)} className="border-b border-slate-100 hover:bg-slate-50">
                  {columns.map(col => (
                    <td key={col.header} className="px-4 py-3 text-slate-700">
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : String(item[col.accessor] ?? '')}
                    </td>
                  ))}
                  {(onEdit || onDelete || actions) && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {actions?.(item)}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
