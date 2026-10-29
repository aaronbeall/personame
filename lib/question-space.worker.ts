import { analyzeQuestionSpace } from './question-space'
self.onmessage = (event: MessageEvent<Parameters<typeof analyzeQuestionSpace>[0]>) => {
  try { self.postMessage({ analysis: analyzeQuestionSpace(event.data) }) }
  catch { self.postMessage({ error: 'Unable to analyze these questions. Check their scoring settings and try again.' }) }
}
