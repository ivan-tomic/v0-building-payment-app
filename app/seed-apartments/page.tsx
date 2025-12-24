'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function SeedApartmentsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
        <h2 className="text-2xl font-bold text-foreground">
          Stanovi su već kreirani
        </h2>
        <p className="text-muted-foreground">
          29 stanova je automatski kreirano prilikom inicijalizacije baze podataka.
        </p>
        <Link
          href="/auth/signin"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Idi na prijavu
        </Link>
      </div>
    </div>
  )
}
