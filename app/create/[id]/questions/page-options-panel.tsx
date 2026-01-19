import { QuizPage } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { Trash2 } from 'lucide-react'

interface PageOptionsPanelProps {
  page: QuizPage
  onUpdate: (page: QuizPage) => void
  onDelete?: () => void
}

const STYLE_PRESETS = [
  { value: null, label: 'Default', description: 'Standard page layout' },
  { value: 'minimal', label: 'Minimal', description: 'Clean and simple' },
  { value: 'centered', label: 'Centered', description: 'Center-aligned content' },
  { value: 'card', label: 'Card', description: 'Card-based layout' },
]

export function PageOptionsPanel({ page, onUpdate, onDelete }: PageOptionsPanelProps) {
  const isCover = page.style === 'cover'
  const isResults = page.style === 'results'
  const isSpecialPage = isCover || isResults
  const { confirm, dialog } = useConfirmDialog()

  const handleDelete = () => {
    confirm({
      title: 'Delete Page?',
      description: `Are you sure you want to delete "${page.title || 'Untitled'}"? This will also delete all questions on this page.`,
      confirmLabel: 'Delete Page',
      onConfirm: () => onDelete?.(),
    })
  }

  return (
    <>
      {dialog}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Page Settings</span>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-700 mb-1 block">
              Title
            </label>
            <Input
              value={page.title || ''}
              onChange={(e) => onUpdate({ ...page, title: e.target.value })}
              placeholder="Page title"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-700 mb-1 block">
              Description / Instructions
            </label>
            <Textarea
              value={page.description || ''}
              onChange={(e) => onUpdate({ ...page, description: e.target.value })}
              placeholder="Optional description or instructions"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-700 mb-1 block">
              Emoji
            </label>
            <EmojiPicker
              value={page.emoji || ''}
              onSelect={(emoji) => onUpdate({ ...page, emoji })}
            />
          </div>

          {!isSpecialPage && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-700 mb-2 block">
                  Style Preset
                </label>
                <div className="space-y-2">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.value || 'default'}
                      onClick={() => onUpdate({ ...page, style: preset.value })}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${page.style === preset.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-muted-200 hover:border-primary-300'
                        }`}
                    >
                      <div className="font-medium text-sm">{preset.label}</div>
                      <div className="text-xs text-muted-500">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Checkbox
                id="hidden"
                label="Hide this page"
                checked={page.hidden}
                onChange={(e) => onUpdate({ ...page, hidden: e.target.checked })}
              />
            </>
          )}

          {isSpecialPage && (
            <div className="p-3 bg-muted-50 rounded-lg border border-muted-200">
              <p className="text-xs text-muted-600">
                {isCover && 'This is the cover page that appears at the start of your quiz.'}
                {isResults && 'This is the results page shown after completing the quiz.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
