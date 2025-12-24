import { Mail, User } from 'lucide-react'

interface TenantData {
  apartment: {
    id: number
    apartment_number: number
    floor: number
    size_sqm: number
  }
  user: {
    id: string
    full_name: string
    email: string
  } | null
}

interface TenantsListProps {
  tenants: TenantData[]
}

export default function TenantsList({ tenants }: TenantsListProps) {
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
                Stanar
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tenants.map((tenant) => (
              <tr key={tenant.apartment.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 text-sm text-foreground">
                  {tenant.apartment.apartment_number}
                </td>
                <td className="px-6 py-4 text-sm">
                  {tenant.user ? (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-foreground">{tenant.user.full_name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">Nije aktivirano</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {tenant.user ? (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{tenant.user.email}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      tenant.user
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                    }`}
                  >
                    {tenant.user ? 'Aktivan' : 'Na čekanju'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
