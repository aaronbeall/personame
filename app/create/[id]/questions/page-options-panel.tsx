import { pagePresentation, type PagePresentation } from '@/lib/quiz-presentation'
import { ColorPicker } from '@/components/ui/color-picker'
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

export function PageOptionsPanel({ page, onUpdate, onDelete }: PageOptionsPanelProps) {
  const isCover = page.style === 'cover'
  const isResults = page.style === 'results'
  const isSpecialPage = isCover || isResults
  const presentation = pagePresentation(page.presentation)
  const updatePresentation = (patch: Partial<PagePresentation>) => onUpdate({ ...page, presentation: { ...presentation, ...patch } })
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
              <Checkbox
                id="hidden"
                label="Hide this page"
                checked={page.hidden}
                onChange={(e) => onUpdate({ ...page, hidden: e.target.checked })}
              />
            </>
          )}

          <section className="studio-presentation-settings" aria-label="Page appearance">
            <h4>Look &amp; feel</h4>
            <label>Layout<select aria-label={isCover ? 'Cover layout' : isResults ? 'Result layout' : 'Page layout'} value={presentation.layout} onChange={event => updatePresentation({ layout: event.target.value as PagePresentation['layout'] })}>
              <option value="hero">Illustrated hero</option><option value="split">Split story</option><option value="card">Keepsake card</option><option value="minimal">Minimal</option>
            </select></label>
            <label>Artwork<select aria-label="Page artwork" value={presentation.artwork} onChange={event => updatePresentation({ artwork: event.target.value as PagePresentation['artwork'] })}><option value="islands">Floating islands</option><option value="party">Celebration</option><option value="science">Curious laboratory</option><option value="creation">Creative world</option><option value="none">No artwork</option></select></label>
            <div><span className="studio-setting-label">Page palette</span><ColorPicker value={page.color || '#8b5cf6'} onSelect={color => onUpdate({ ...page, color })} /></div>
            <h4>What to show</h4>
            <label className="studio-check-setting"><input type="checkbox" checked={presentation.showDescription} onChange={e => updatePresentation({ showDescription: e.target.checked })} />Description</label>
            {isCover && <><label>Start button<Input aria-label="Start button label" value={presentation.startLabel} maxLength={60} onChange={e => updatePresentation({ startLabel: e.target.value })} /></label>
              <label className="studio-check-setting"><input type="checkbox" checked={presentation.showQuestionCount} onChange={e => updatePresentation({ showQuestionCount: e.target.checked })} />Question count</label>
              <label className="studio-check-setting"><input type="checkbox" checked={presentation.showTimeEstimate} onChange={e => updatePresentation({ showTimeEstimate: e.target.checked })} />Estimated time</label></>}
            {isResults && ([['showDimensions','Dimension landscape'],['showAlternatives','Other close archetypes'],['showComparison','Compare with other quiz takers'],['showRetake','Retake action'],['showShare','Share result action']] as const).map(([key,label]) => <label className="studio-check-setting" key={key}><input type="checkbox" checked={presentation[key]} onChange={e => updatePresentation({ [key]: e.target.checked })} />{label}</label>)}
            {isResults && <p className="studio-setting-note">Comparisons use other completions of the same scoring model. They appear after 10 comparable results, without sharing individual answers.</p>}
          </section>
        </CardContent>
      </Card>
    </>
  )
}
