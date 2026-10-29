export const REVIEW_TABS = ['review', 'analyze', 'publish'] as const
export type ReviewTab = typeof REVIEW_TABS[number]
export const reviewWorkspaceHref = (id: string, tab: ReviewTab = 'review') => `/create/${encodeURIComponent(id)}/preview?tab=${tab}`
