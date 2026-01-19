import { QuizPage } from '@prisma/client'
import { cn } from '@/lib/utils'
import { Plus, FileText, Home, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageNavigatorProps {
  pages: QuizPage[]
  currentPageIndex: number
  onSelectPage: (index: number) => void
  onAddPage: () => void
}

export function PageNavigator({ pages, currentPageIndex, onSelectPage, onAddPage }: PageNavigatorProps) {
  // Split pages into cover, content, and results
  const coverPage = pages.find(p => p.style === 'cover')
  const resultsPage = pages.find(p => p.style === 'results')
  const contentPages = pages.filter(p => p.style !== 'cover' && p.style !== 'results')

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-muted-600 mb-3 uppercase">Pages</div>

      {/* Cover Page */}
      {coverPage && (
        <button
          key={coverPage.id}
          onClick={() => onSelectPage(pages.indexOf(coverPage))}
          className={cn(
            "w-full text-left p-3 rounded-lg border-2 transition-all",
            currentPageIndex === pages.indexOf(coverPage)
              ? "border-primary-500 bg-primary-50"
              : "border-muted-200 bg-white hover:border-primary-300 hover:bg-muted-50"
          )}
        >
          <div className="flex items-start gap-2">
            <div className={cn(
              "flex-shrink-0 mt-0.5",
              currentPageIndex === pages.indexOf(coverPage) ? "text-primary-600" : "text-muted-400"
            )}>
              <Home className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(
                "text-sm font-medium truncate",
                currentPageIndex === pages.indexOf(coverPage) ? "text-primary-900" : "text-muted-700"
              )}>
                {coverPage.title || 'Untitled'}
              </div>
              <div className="text-xs text-muted-500 truncate">
                Cover Page
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Content Pages */}
      {contentPages.map((page) => {
        const index = pages.indexOf(page)
        const isActive = index === currentPageIndex

        return (
          <button
            key={page.id}
            onClick={() => onSelectPage(index)}
            className={cn(
              "w-full text-left p-3 rounded-lg border-2 transition-all",
              isActive
                ? "border-primary-500 bg-primary-50"
                : "border-muted-200 bg-white hover:border-primary-300 hover:bg-muted-50"
            )}
          >
            <div className="flex items-start gap-2">
              <div className={cn(
                "flex-shrink-0 mt-0.5",
                isActive ? "text-primary-600" : "text-muted-400"
              )}>
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm font-medium truncate",
                  isActive ? "text-primary-900" : "text-muted-700"
                )}>
                  {page.title || 'Untitled'}
                </div>
                <div className="text-xs text-muted-500 truncate">
                  Question page
                </div>
              </div>
            </div>
          </button>
        )
      })}

      {/* Add Page Button - Ghost/Placeholder Style */}
      <button
        onClick={onAddPage}
        className="w-full text-left p-3 rounded-lg border-2 border-dashed border-muted-300 bg-muted-50/50 hover:bg-white hover:border-primary-300 transition-all"
      >
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5 text-muted-400">
            <Plus className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-muted-600">
              Add Page
            </div>
            <div className="text-xs text-muted-500">
              Insert new page
            </div>
          </div>
        </div>
      </button>

      {/* Results Page */}
      {resultsPage && (
        <button
          key={resultsPage.id}
          onClick={() => onSelectPage(pages.indexOf(resultsPage))}
          className={cn(
            "w-full text-left p-3 rounded-lg border-2 transition-all",
            currentPageIndex === pages.indexOf(resultsPage)
              ? "border-primary-500 bg-primary-50"
              : "border-muted-200 bg-white hover:border-primary-300 hover:bg-muted-50"
          )}
        >
          <div className="flex items-start gap-2">
            <div className={cn(
              "flex-shrink-0 mt-0.5",
              currentPageIndex === pages.indexOf(resultsPage) ? "text-primary-600" : "text-muted-400"
            )}>
              <Trophy className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(
                "text-sm font-medium truncate",
                currentPageIndex === pages.indexOf(resultsPage) ? "text-primary-900" : "text-muted-700"
              )}>
                {resultsPage.title || 'Untitled'}
              </div>
              <div className="text-xs text-muted-500 truncate">
                Results Page
              </div>
            </div>
          </div>
        </button>
      )}
    </div>
  )
}
