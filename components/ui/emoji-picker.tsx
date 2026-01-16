'use client'

import { Button } from '@/components/ui/button'
import * as Popover from '@radix-ui/react-popover'
import emojiData from 'full-emoji-list'
import { ChevronDown, X, SmilePlus, ArrowLeft } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { SearchInput } from './search-input'
import { cn } from '@/lib/utils'

interface EmojiPickerProps {
  value?: string
  onSelect: (emoji: string) => void
  placeholder?: string
}

interface EmojiGroup {
  base: string
  baseName: string
  variants: Array<{ emoji: string; name: string }>
}

export function EmojiPicker({ value, onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [variants, setVariants] = useState<EmojiGroup | null>(null)
  const [variantSearch, setVariantSearch] = useState('')

  const toggle = useCallback((isOpen: boolean) => {
    setOpen(isOpen)
    setSearch('')
    setVariants(null)
    setVariantSearch('')
  }, [])

  // Group emojis by category and handle variants
  const emojiGroups = useMemo(() => {
    const groups: Record<string, EmojiGroup[]> = {}
    const emojiMap: Record<string, EmojiGroup> = {}

    emojiData
      .filter((emoji) => emoji.Status === 'fully-qualified' && !!emoji.Emoji && !!emoji.Name)
      .forEach((emoji) => {
        const category = emoji.Group || 'Other'

        // Extract base name (before colon for variants)
        const baseName = emoji.Name.split(':')[0].trim()
        const isVariant = emoji.Name.includes(':')

        // Create or update emoji group
        if (!emojiMap[baseName]) {
          emojiMap[baseName] = {
            base: emoji.Emoji,
            baseName,
            variants: []
          }

          if (!groups[category]) {
            groups[category] = []
          }
          groups[category].push(emojiMap[baseName])
        }

        // Add variant if this is one
        if (isVariant) {
          emojiMap[baseName].variants.push({
            emoji: emoji.Emoji,
            name: emoji.Name.split(':')[1]?.trim() || emoji.Name
          })
        } else {
          // Use the base emoji
          emojiMap[baseName].base = emoji.Emoji
        }
      })

    return groups
  }, [])

  // Filter emojis by search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return emojiGroups

    const searchLower = search.toLowerCase()
    const filtered: Record<string, EmojiGroup[]> = {}

    Object.entries(emojiGroups).forEach(([category, emojiGroups]) => {
      const matchingEmojis = emojiGroups.filter((group) =>
        group.baseName.toLowerCase().includes(searchLower) ||
        group.base.includes(search) ||
        group.variants.some(v => v.name.toLowerCase().includes(searchLower))
      )

      if (matchingEmojis.length > 0) {
        filtered[category] = matchingEmojis
      }
    })

    return filtered
  }, [emojiGroups, search])

  const handleEmojiClick = (group: EmojiGroup) => {
    if (group.variants.length > 0) {
      setVariants(group)
      setVariantSearch('')
    } else {
      handleEmojiSelect(group.base)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji)
    toggle(false);
  }

  // Show emoji-plus icon if value is null/empty
  const showEmoji = value || ''
  const triggerContent = showEmoji
    ? showEmoji
    : <SmilePlus className="w-6 h-6 text-muted-400" />

  return (
    <Popover.Root open={open} onOpenChange={toggle}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-10 p-0 text-2xl flex items-center justify-center"
        >
          {triggerContent}
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-80 rounded-lg border border-border bg-white shadow-lg relative"
          sideOffset={5}
          align="start"
        >
          <div className="p-3 border-b border-border">
            <SearchInput
              placeholder={variants ? "Search variants..." : "Search emojis..."}
              value={variants ? variantSearch : search}
              onChange={(e) => variants ? setVariantSearch(e.target.value) : setSearch(e.target.value)}
            />
            {/* Show current selection with remove button, styled inline */}
            {value && !variants && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl">{value}</span>
                <button
                  type="button"
                  onClick={() => handleEmojiSelect('')}
                  className="text-xs text-muted-600 hover:text-destructive-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-muted-100"
                  title="Remove emoji"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          <div className={cn(
            "max-h-80 overflow-y-auto p-3",
            variants ? 'hidden' : 'block'
          )}>
            {Object.entries(filteredGroups).map(([category, emojiGroups]) => (
              <div key={category} className="mb-4 last:mb-0">
                <h3 className="text-xs font-semibold text-muted-600 uppercase mb-2">
                  {category}
                </h3>
                <div className="grid grid-cols-8 gap-1">
                  {emojiGroups.map((group, index) => (
                    <button
                      key={`${group.base}-${index}`}
                      type="button"
                      onClick={() => handleEmojiClick(group)}
                      className="relative h-8 w-8 flex items-center justify-center text-xl rounded hover:bg-primary-50 transition-colors"
                      title={group.baseName}
                    >
                      {group.base}
                      {group.variants.length > 0 && (
                        <ChevronDown className="absolute bottom-0 right-0 h-2.5 w-2.5 text-muted-500 bg-white/80 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(filteredGroups).length === 0 && (
              <div className="text-center text-muted-500 py-8">
                No emojis found
              </div>
            )}
          </div>

          {variants && (
            <div className=" bg-white/95 backdrop-blur-sm rounded-lg p-3 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => {
                    setVariants(null)
                    setVariantSearch('')
                  }}
                  className="p-1 hover:bg-muted-100 rounded transition-colors"
                  title="Back"
                >
                  <ArrowLeft className="h-4 w-4 text-muted-600" />
                </button>
                <h3 className="text-sm font-semibold text-muted-900 flex-1">
                  Variants for {variants.baseName}
                </h3>
              </div>
              <div className="space-y-1 overflow-y-auto flex-1">
                {/* Filter variants by variantSearch */}
                {[
                  { emoji: variants.base, name: variants.baseName },
                  ...variants.variants
                ].filter(v =>
                  !variantSearch.trim() ||
                  v.name.toLowerCase().includes(variantSearch.toLowerCase()) ||
                  v.emoji.includes(variantSearch)
                ).map((variant, index) => (
                  <button
                    key={`${variant.emoji}-${index}`}
                    type="button"
                    onClick={() => handleEmojiSelect(variant.emoji)}
                    className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-primary-50 transition-colors text-left text-sm"
                  >
                    <span className="text-lg min-w-fit">{variant.emoji}</span>
                    <span className="text-muted-700 text-xs truncate">{variant.name}</span>
                  </button>
                ))}
                {/* If no variants match search */}
                {[
                  { emoji: variants.base, name: 'Default' },
                  ...variants.variants
                ].filter(v =>
                  v.name.toLowerCase().includes(variantSearch.toLowerCase()) ||
                  v.emoji.includes(variantSearch)
                ).length === 0 && (
                    <div className="text-center text-muted-500 py-4 text-xs">No variants found</div>
                  )}
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
