'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ChevronDown, X } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import emojiData from 'full-emoji-list'
import { SearchInput } from './search-input'

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

export function EmojiPicker({ value, onSelect, placeholder = '😀' }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [variantSelector, setVariantSelector] = useState<EmojiGroup | null>(null)

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
      setVariantSelector(group)
    } else {
      handleEmojiSelect(group.base)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji)
    setOpen(false)
    setSearch('')
    setVariantSelector(null)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-10 p-0 text-2xl"
        >
          {value || placeholder}
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
              placeholder="Search emojis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {value && (
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => handleEmojiSelect('')}
                  className="text-xs text-muted-600 hover:text-destructive-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-muted-100"
                >
                  <X className="h-3 w-3" />
                  Use no emoji
                </button>
              </div>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto p-3">
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

          {variantSelector && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg p-3 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-muted-900">
                  Variants for {variantSelector.baseName}
                </h3>
                <button
                  onClick={() => setVariantSelector(null)}
                  className="p-1 hover:bg-muted-100 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-muted-600" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleEmojiSelect('')}
                className="self-end text-[11px] text-muted-600 hover:text-destructive-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-muted-100 mb-2"
              >
                <X className="h-3 w-3" />
                Use no emoji
              </button>
              <div className="space-y-1 overflow-y-auto flex-1">
                <button
                  type="button"
                  onClick={() => handleEmojiSelect(variantSelector.base)}
                  className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-primary-50 transition-colors text-left text-sm"
                >
                  <span className="text-lg min-w-fit">{variantSelector.base}</span>
                  <span className="text-muted-700 text-xs truncate">Default</span>
                </button>
                {variantSelector.variants.map((variant, index) => (
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
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
