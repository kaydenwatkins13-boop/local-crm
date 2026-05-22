'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Users, Kanban, LogOut, Calendar } from 'lucide-react'
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
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/leads',     label: 'Leads',     icon: Users },
    { href: '/pipeline',  label: 'Pipeline',  icon: Kanban },
    { href: '/followups', label: 'Follow-ups', icon: Calendar },
  ]

  return (
    <>
      {/* Desktop top navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 hidden md:block">
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

      {/* Mobile top bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 md:hidden">
        <div className="flex items-center justify-between px-4 h-12">
          <span className="font-bold text-slate-900">LocalCRM</span>
          <button onClick={signOut} className="text-slate-500">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden">
        <div className="flex items-center justify-around h-16 pb-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href} href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                pathname === href
                  ? 'text-blue-600'
                  : 'text-slate-400'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom padding on mobile so content isn't hidden behind tab bar */}
      <div className="h-16 md:hidden" />
    </>
  )
}