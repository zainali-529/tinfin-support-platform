import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquareIcon, UsersIcon, CheckCircleIcon, ZapIcon } from 'lucide-react'

const stats = [
  { label: 'Open Conversations', value: '0',  icon: MessageSquareIcon, badge: 'Live' },
  { label: 'Total Contacts',     value: '0',  icon: UsersIcon },
  { label: 'Resolved Today',     value: '0',  icon: CheckCircleIcon },
  { label: 'AI Handled',         value: '0%', icon: ZapIcon },
]

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>{stat.label}</CardDescription>
                <div className="flex items-center gap-2">
                  {stat.badge && <Badge variant="secondary">{stat.badge}</Badge>}
                  <stat.icon className="size-4 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
          <CardDescription>Your latest support conversations will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <MessageSquareIcon className="mb-3 size-10 opacity-20" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs">Install the widget on your site to get started</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}