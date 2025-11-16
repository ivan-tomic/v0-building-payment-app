'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Home, CreditCard, FileText, LogOut } from 'lucide-react'

export default function TenantNavigation() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const menuItems = [
    { href: '/tenant', label: 'Moj stan', icon: Home },
    { href: '/tenant/payments', label: 'Plaćanja', icon: CreditCard },
    { href: '/tenant/expenses', label: 'Troškovi', icon: FileText },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-lg font-bold text-foreground">Upravljanje zgradom</h1>
            <div className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      active
                        ? 'text-primary-foreground bg-primary'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Odjava</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
