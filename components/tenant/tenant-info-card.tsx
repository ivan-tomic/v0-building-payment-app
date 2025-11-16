import { Home, Ruler } from 'lucide-react'

interface TenantInfoCardProps {
  apartment: {
    apartment_number: number
    floor: number
    size_sqm: number
    monthly_fee: number
  }
}

export default function TenantInfoCard({ apartment }: TenantInfoCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-bold text-foreground mb-6">
        Информације о стану
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <span className="text-muted-foreground">Број стана</span>
          <span className="font-semibold text-foreground">
            {apartment.apartment_number}
          </span>
        </div>

        <div className="flex items-center justify-between pb-4 border-b border-border">
          <span className="text-muted-foreground">Спрат</span>
          <span className="font-semibold text-foreground">
            {apartment.floor}.
          </span>
        </div>

        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Површина</span>
          </div>
          <span className="font-semibold text-foreground">
            {apartment.size_sqm} m²
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-muted-foreground">Месечна наплата</span>
          <span className="font-bold text-primary text-lg">
            {apartment.monthly_fee.toFixed(2)} BAM
          </span>
        </div>
      </div>
    </div>
  )
}
