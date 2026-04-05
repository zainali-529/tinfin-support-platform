'use client'

import { useState } from 'react'
import { ConversationList } from '@/components/inbox/ConversationList'
import { ConversationView } from '@/components/inbox/ConversationView'
import { EmptyState } from '@/components/inbox/EmptyState'
import { useConversations } from '@/hooks/useConversations'
import { createClient } from '@/lib/supabase'
import { useEffect, useState as useS } from 'react'

// Temp: get orgId and userId from session
function useSession() {
  const [session, setSession] = useS<{ orgId: string; userId: string } | null>(null)
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data }) => {
      const userId = data.session?.user.id
      if (!userId) return
      const { data: user } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userId)
        .single()
      if (user) setSession({ orgId: user.org_id, userId })
    })
  }, [])
  return session
}

export default function InboxPage() {
  const session = useSession()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { conversations, loading } = useConversations(session?.orgId || '')

  const selected = conversations.find(c => c.id === selectedId) || null

  if (!session) return (
    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
      Loading...
    </div>
  )

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="flex h-full">
        {/* Left: Conversation List */}
        <div className="w-[320px] border-r">
          <ConversationList
            conversations={conversations}
            loading={loading}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Right: Conversation View */}
        <div className="flex-1 min-w-0">
          {selected ? (
            <ConversationView
              conversation={selected}
              orgId={session.orgId}
              agentId={session.userId}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  )
}