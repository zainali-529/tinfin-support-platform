'use client'

import { useEffect, useRef, useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  SendIcon, BotIcon, UserIcon, CheckCircleIcon,
  PhoneIcon, MailIcon, ClockIcon, ZapIcon
} from 'lucide-react'
import { useMessages } from '@/hooks/useMessages'
import type { Conversation } from '@/types/database'

const ROLE_CONFIG = {
  user: { label: 'Visitor', bg: 'bg-primary', text: 'text-primary-foreground', align: 'items-end' },
  assistant: { label: 'AI', bg: 'bg-muted', text: 'text-foreground', align: 'items-start' },
  agent: { label: 'Agent', bg: 'bg-green-500', text: 'text-white', align: 'items-end' },
  system: { label: 'System', bg: 'bg-muted', text: 'text-muted-foreground', align: 'items-start' },
}

interface Props {
  conversation: Conversation
  orgId: string
  agentId: string
}

export function ConversationView({ conversation, orgId, agentId }: Props) {
  const { messages, loading, sending, sendMessage } = useMessages(conversation.id, orgId)
  const [reply, setReply] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const contact = conversation.contacts

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = reply.trim()
    if (!text || sending) return
    setReply('')
    await sendMessage(text, agentId)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Conversation Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="text-sm">
              {contact?.name?.slice(0, 2).toUpperCase() || contact?.email?.slice(0, 2).toUpperCase() || '??'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">
              {contact?.name || contact?.email || 'Anonymous Visitor'}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {contact?.email && (
                <span className="flex items-center gap-1">
                  <MailIcon className="size-3" /> {contact.email}
                </span>
              )}
              {contact?.phone && (
                <span className="flex items-center gap-1">
                  <PhoneIcon className="size-3" /> {contact.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={conversation.status === 'open' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {conversation.status === 'bot' && <ZapIcon className="mr-1 size-3" />}
            {conversation.status}
          </Badge>
          {conversation.status !== 'resolved' && (
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <CheckCircleIcon className="size-3.5" />
              Resolve
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 bg-muted/20 px-6 py-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn('flex gap-3', i % 2 === 0 ? '' : 'flex-row-reverse')}>
                <Skeleton className="size-7 shrink-0 rounded-full" />
                <Skeleton className={cn('h-10 rounded-2xl', i % 2 === 0 ? 'w-48' : 'w-36')} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {messages.map((msg, idx) => {
              const cfg = ROLE_CONFIG[msg.role] || ROLE_CONFIG.assistant
              const isUser = msg.role === 'user'
              const isAgent = msg.role === 'agent'
              const showTime = idx === 0 ||
                new Date(msg.created_at).getTime() - new Date(messages[idx - 1]!.created_at).getTime() > 300_000

              return (
                <div key={msg.id}>
                  {showTime && (
                    <div className="my-4 flex items-center gap-3">
                      <Separator className="flex-1" />
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <ClockIcon className="size-3" />
                        {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                      </span>
                      <Separator className="flex-1" />
                    </div>
                  )}

                  <div className={cn('flex gap-2 py-0.5', isUser || isAgent ? 'flex-row-reverse' : '')}>
                    <Avatar className="mt-1 size-7 shrink-0">
                      <AvatarFallback className="text-[10px]">
                        {msg.role === 'user' ? 'V' : msg.role === 'agent' ? 'A' : <BotIcon className="size-3" />}
                      </AvatarFallback>
                    </Avatar>

                    <div className={cn('flex max-w-[70%] flex-col gap-0.5', isUser || isAgent ? 'items-end' : 'items-start')}>
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                          cfg.bg, cfg.text,
                          isUser || isAgent ? 'rounded-br-sm' : 'rounded-bl-sm'
                        )}
                      >
                        {msg.content}
                      </div>
                      <span className="px-1 text-[11px] text-muted-foreground">
                        {cfg.label} · {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Reply Box */}
      <div className="border-t bg-background px-4 py-3">
        <div className="rounded-2xl border bg-muted/30 p-3">
          <Textarea
            placeholder="Type a reply... (Ctrl+Enter to send)"
            className="min-h-[72px] resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-sm"
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={handleKey}
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Ctrl+Enter to send</p>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!reply.trim() || sending}
              className="gap-1.5"
            >
              <SendIcon className="size-3.5" />
              {sending ? 'Sending...' : 'Send Reply'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}