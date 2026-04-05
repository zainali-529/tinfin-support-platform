'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import {
  InboxIcon,
  BookOpenIcon,
  BarChart2Icon,
  SettingsIcon,
  LayoutDashboardIcon,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
  { label: 'Inbox', href: '/inbox', icon: InboxIcon, badge: '3' },
  { label: 'Knowledge Base', href: '/dashboard/knowledge', icon: BookOpenIcon },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart2Icon },
  { label: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
]

export function NavItems() {
  const pathname = usePathname()

  return (
    <SidebarMenu className="gap-0.5 px-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href))

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.label}
              className="h-9 gap-3 px-3"
            >
              <Link href={item.href}>
                <item.icon className="size-4 shrink-0" />
                <span className="flex-1 truncate text-sm">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className="ml-auto h-4 min-w-4 px-1 text-[10px] font-semibold"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}