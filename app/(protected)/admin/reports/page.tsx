'use client'

import { useEffect, useState } from 'react'
import MonthlyStats from '@/components/admin/reports/monthly-stats'
import DelinquentTenants from '@/components/admin/reports/delinquent-tenants'

export default function AdminReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Izvještaji</h1>
        <p className="text-muted-foreground">Finansijski izvještaji i statistike</p>
      </div>

      <div className="mb-4 flex gap-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2000, i).toLocaleString('bs', { month: 'long' })}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - 2 + i
            return (
              <option key={year} value={year}>
                {year}
              </option>
            )
          })}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MonthlyStats month={selectedMonth} year={selectedYear} />
        <DelinquentTenants month={selectedMonth} year={selectedYear} />
      </div>
    </div>
  )
}
