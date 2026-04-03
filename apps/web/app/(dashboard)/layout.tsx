import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarInset, SidebarFooter
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  InboxIcon, BookOpenIcon, BarChart2Icon,
  SettingsIcon, ZapIcon, LayoutDashboardIcon
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
  { label: 'Inbox', href: '/inbox', icon: InboxIcon },
  { label: 'Knowledge Base', href: '/dashboard/knowledge', icon: BookOpenIcon },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart2Icon },
  { label: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <ZapIcon className="size-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Tinfin</p>
              <p className="text-[11px] text-muted-foreground">Support Platform</p>
            </div>
          </div>
        </SidebarHeader>

        <Separator />

        <SidebarContent className="mt-2">
          <SidebarMenu>
            {navItems.map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild>
                  <a href={item.href} className="gap-3">
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <Separator />

        <SidebarFooter>
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">
                {user.email?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{user.email}</p>
              <p className="text-[11px] text-muted-foreground">Agent</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}