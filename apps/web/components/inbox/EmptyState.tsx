import { InboxIcon } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-muted-foreground">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <InboxIcon className="size-8 opacity-40" />
      </div>
      <div>
        <p className="font-medium text-foreground">Select a conversation</p>
        <p className="mt-1 text-sm">Choose a conversation from the left to start replying</p>
      </div>
    </div>
  )
}