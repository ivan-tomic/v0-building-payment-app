'use client'

import { CleanupButton } from '@/app/api/admin/cleanup-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CleanupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Očisti bazu podataka</CardTitle>
          <CardDescription>
            Ovo će obrisati sve korisnike i podatke. Koristi samo za testiranje.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CleanupButton />
        </CardContent>
      </Card>
    </div>
  )
}
