'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Building, Users, CreditCard, FileText, Settings, LogOut } from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const menuItems = [
    { href: '/admin', label: 'Kontrolna ploča', icon: Building },
    { href: '/admin/tenants', label: 'Stanari', icon: Users },
    { href: '/admin/payments', label: 'Plaćanja', icon: CreditCard },
    { href: '/admin/reports', label: 'Izvještaji', icon: FileText },
    { href: '/admin/settings', label: 'Podešavanja', icon: Settings },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">
          Upravljanje zgradom
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Skendera Kulenovića 5
        </p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Odjava</span>
        </button>
      </div>
    </div>
  )
}
