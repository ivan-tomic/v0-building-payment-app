import { formatDate, formatPaymentMethod } from '@/lib/utils'

interface PaymentsTableProps {
  payments: any[]
}

export default function PaymentsTable({ payments }: PaymentsTableProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Stan
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Mjesec/Godina
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Iznos
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Datum plaćanja
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Metod plaćanja
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  Nema plaćanja
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm text-foreground">
                    Stan {payment.apartmentNumber || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {payment.month}/{payment.year}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {Number(payment.amount).toFixed(2)} BAM
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {payment.paymentDate ? formatDate(payment.paymentDate) : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatPaymentMethod(payment.paymentMethod)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
