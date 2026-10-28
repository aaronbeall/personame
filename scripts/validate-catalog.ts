import { parse as parseYaml } from 'yaml'
import { readFileSync } from 'node:fs'
import { parseCatalog } from '../lib/quiz-catalog'
const catalog = parseCatalog(
  parseYaml(readFileSync('content/seed-quizzes.yaml', 'utf8')),
)
console.log(
  `Valid: ${catalog.quizzes.length} quizzes, ${catalog.quizzes.reduce((n, q) => n + q.questions.length, 0)} questions.`,
)
