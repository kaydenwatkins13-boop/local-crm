'use client'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Users, Kanban, LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function Navbar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

const links = [
    { href: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
    { href: '/leads',      label: 'Leads',        icon: Users },
    { href: '/pipeline',   label: 'Pipeline',     icon: Kanban },
    { href: '/followups',  label: 'Follow-ups',   icon: Calendar },
  ]

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <span className="font-bold text-slate-900 text-lg">LocalCRM</span>
          <div className="flex gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href} href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon size={15} />{label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{user.email}</span>
          <button onClick={signOut} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}