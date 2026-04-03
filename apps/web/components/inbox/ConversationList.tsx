'use client'

import { formatDistanceToNow } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { SearchIcon, BotIcon, UserIcon, MailIcon } from 'lucide-react'
import { useState } from 'react'
import type { Conversation } from '@/types/database'

const STATUS_CONFIG = {
  bot: { label: 'Bot', variant: 'secondary' as const, color: 'text-blue-500' },
  pending: { label: 'Pending', variant: 'outline' as const, color: 'text-amber-500' },
  open: { label: 'Open', variant: 'default' as const, color: 'text-green-500' },
  resolved: { label: 'Resolved', variant: 'secondary' as const, color: 'text-gray-400' },
  closed: { label: 'Closed', variant: 'secondary' as const, color: 'text-gray-400' },
}

function getInitials(name?: string | null, email?: string | null) {
  if (name) return name.slice(0, 2).toUpperCase()
  if (email) return email.slice(0, 2).toUpperCase()
  return '??'
}

function getLastMessage(conv: Conversation) {
  const msgs = conv.messages
  if (!msgs?.length) return 'No messages yet'
  const last = msgs[msgs.length - 1]
  return last?.content?.slice(0, 60) || ''
}

interface Props {
  conversations: Conversation[]
  loading: boolean
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ConversationList({ conversations, loading, selectedId, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')

  const filtered = conversations.filter(c => {
    const matchTab = tab === 'all' || c.status === tab
    const name = c.contacts?.name || c.contacts?.email || ''
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      getLastMessage(c).toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="flex h-full flex-col border-r">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-4">
        <div>
          <h2 className="text-base font-semibold">Inbox</h2>
          <p className="text-xs text-muted-foreground">{conversations.length} conversations</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="h-8 pl-8 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-3 pb-2">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-8 w-full">
            <TabsTrigger value="all" className="flex-1 text-xs">All</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 text-xs">Pending</TabsTrigger>
            <TabsTrigger value="open" className="flex-1 text-xs">Open</TabsTrigger>
            <TabsTrigger value="bot" className="flex-1 text-xs">Bot</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 rounded-xl p-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
            <MailIcon className="size-8 opacity-20" />
            <p className="text-sm">No conversations</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 p-2">
            {filtered.map(conv => {
              const status = STATUS_CONFIG[conv.status] || STATUS_CONFIG.bot
              const isSelected = conv.id === selectedId
              const lastMsg = getLastMessage(conv)
              const contact = conv.contacts

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted/50',
                    isSelected && 'bg-muted'
                  )}
                >
                  <Avatar className="mt-0.5 size-9 shrink-0">
                    <AvatarFallback className="text-xs">
                      {getInitials(contact?.name, contact?.email)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {contact?.name || contact?.email || 'Anonymous'}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.started_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-muted-foreground">{lastMsg}</p>
                      <Badge variant={status.variant} className="shrink-0 text-[10px] px-1.5 h-4">
                        {status.label}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      {conv.channel === 'chat' ? <BotIcon className="size-3" /> : <UserIcon className="size-3" />}
                      <span className="capitalize">{conv.channel}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}