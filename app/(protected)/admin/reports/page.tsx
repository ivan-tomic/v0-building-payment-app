'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import MonthlyCollectionChart from '@/components/admin/charts/monthly-collection-chart'
import FloorCollectionChart from '@/components/admin/charts/floor-collection-chart'
import DelinquentTenants from '@/components/admin/reports/delinquent-tenants'
import MonthlyStats from '@/components/admin/reports/monthly-stats'
import { Download } from 'lucide-react'

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    setLoading(false)
  }, [supabase])

  const handleExportCSV = async () => {
    try {
      const { data: payments } = await supabase
        .from('payments')
        .select(`
          *,
          apartments (apartment_number, floor)
        `)
        .eq('month', selectedMonth)
        .eq('year', selectedYear)

      const { data: apartments } = await supabase
        .from('apartments')
        .select('*')

      let csv = 'Mjesec,Godina,Stan,Sprat,Iznos\n'

      apartments?.forEach((apt) => {
        const payment = payments?.find((p) => p.apartment_id === apt.id)
        csv += `${selectedMonth},${selectedYear},${apt.apartment_number},${apt.floor},${
          payment?.amount || 0
        }\n`
      })

      const element = document.createElement('a')
      element.setAttribute(
        'href',
        `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
      )
      element.setAttribute(
        'download',
        `izvjestaj-${selectedMonth}-${selectedYear}.csv`
      )
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Izvještaji</h1>
          <p className="text-muted-foreground mt-1">
            Analiza plaćanja i troškova
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Download className="w-5 h-5" />
          Preuzmi CSV
        </button>
      </div>

      <div className="mb-8 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Mjesec
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-primary"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Godina
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-primary"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Učitavanje...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <MonthlyStats month={selectedMonth} year={selectedYear} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyCollectionChart month={selectedMonth} year={selectedYear} />
            <FloorCollectionChart month={selectedMonth} year={selectedYear} />
          </div>

          <DelinquentTenants month={selectedMonth} year={selectedYear} />
        </div>
      )}
    </div>
  )
}
