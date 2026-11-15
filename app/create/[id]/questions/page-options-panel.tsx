import { coverPresentation, pagePresentation, type PagePresentation, type QuizAppearance, type CoverPageStyle } from '@/lib/quiz-presentation'
import { StyleFields } from '@/components/style-editors'
import { PageLayoutPicker } from '@/components/page-layout-picker'
import { ArtworkPicker } from '@/components/artwork-picker'
import { QuizPage } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { Trash2 } from 'lucide-react'

interface PageOptionsPanelProps {
  page: QuizPage
  onUpdate: (page: QuizPage) => void
  onDelete?: () => void
  welcomeStyle?: {
    emoji: string | null
    color: string | null
    appearance: QuizAppearance
    onEmojiChange: (emoji: string | null) => void
    onColorChange: (color: string) => void
    onAppearanceChange: (patch: Partial<QuizAppearance>) => void
  }
}

export function PageOptionsPanel({ page, onUpdate, onDelete, welcomeStyle }: PageOptionsPanelProps) {
  const isCover = page.style === 'cover'
  const isResults = page.style === 'results'
  const isSpecialPage = isCover || isResults
  const presentation = pagePresentation(page.presentation)
  const updatePresentation = (patch: Partial<PagePresentation>) => onUpdate({ ...page, presentation: { ...presentation, ...patch } })
  const cover = welcomeStyle ? coverPresentation(page.presentation, welcomeStyle.appearance) : null
  const updateCoverStyle = (patch: Partial<CoverPageStyle>) => {
    if (!cover) return
    updatePresentation({ coverPageStyle: { layout: cover.layout, backgroundImage: cover.backgroundImage ?? null, ...patch } })
  }
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
          {isCover ? welcomeStyle && <section className="studio-welcome-style" aria-label="Quiz style">
            <h4>Quiz style</h4>
            <StyleFields
              emoji={welcomeStyle.emoji}
              color={welcomeStyle.color}
              onEmojiChange={welcomeStyle.onEmojiChange}
              onColorChange={welcomeStyle.onColorChange}
              background={welcomeStyle.appearance.coverImage}
              onBackgroundChange={coverImage => welcomeStyle.onAppearanceChange({ coverImage })}
              imageLabel="Quiz image"
            />
            {cover && <div className="quiz-style-extra" role="group" aria-label="Cover page style">
              <h4>Cover page</h4>
              <ArtworkPicker label="Page background" value={cover.backgroundImage ?? null} onChange={backgroundImage => updateCoverStyle({ backgroundImage })} />
              <PageLayoutPicker value={cover.layout} onChange={layout => updateCoverStyle({ layout })} />
            </div>}
          </section> : <><div>
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

          </>}

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

          <section className="studio-presentation-settings" aria-label="Page settings">
            {!isSpecialPage && <>
              <h4>Page style</h4>
              <PageLayoutPicker value={presentation.layout} onChange={layout => updatePresentation({ layout })} />
              <StyleFields emoji={page.emoji} color={page.color}
                onEmojiChange={emoji => onUpdate({ ...page, emoji })}
                onColorChange={color => onUpdate({ ...page, color })}
                onClearColor={() => onUpdate({ ...page, color: null })}
                background={presentation.backgroundImage}
                onBackgroundChange={backgroundImage => updatePresentation({ backgroundImage })}
              />
            </>}
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
