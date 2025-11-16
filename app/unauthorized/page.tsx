'use client'

import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">403</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Немате приступ овој страници
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
        >
          Назад на контролну табличу
        </Link>
      </div>
    </div>
  )
}
