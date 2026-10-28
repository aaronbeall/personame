import 'dotenv/config'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { PrismaClient } from '@prisma/client'
const base = process.env.PERSONAME_TEST_URL

test(
  'creator workflow preserves IDs and historical results, validates submissions, and enforces access',
  { skip: !base },
  async () => {
    assert.ok(
      ['localhost', '127.0.0.1'].includes(new URL(base!).hostname),
      'Integration tests must target a local server',
    )
    assert.ok(
      ['localhost', '127.0.0.1'].includes(
        new URL(process.env.DATABASE_URL!).hostname,
      ),
      'Integration tests must use a local database',
    )
    const db = new PrismaClient()
    const marker = randomUUID()
    const owner = await db.user.create({
      data: {
        name: 'Workflow Test Creator',
        email: `workflow-${marker}@example.test`,
      },
    })
    const stranger = await db.user.create({
      data: {
        name: 'Other Test Creator',
        email: `other-${marker}@example.test`,
      },
    })
    const token = randomUUID(),
      otherToken = randomUUID()
    await db.session.createMany({
      data: [
        {
          userId: owner.id,
          sessionToken: token,
          expires: new Date(Date.now() + 3600000),
        },
        {
          userId: stranger.id,
          sessionToken: otherToken,
          expires: new Date(Date.now() + 3600000),
        },
      ],
    })
    async function call(
      path: string,
      method = 'GET',
      body?: unknown,
      identity: string | null = token,
    ) {
      const response = await fetch(base + path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(identity
            ? { cookie: `next-auth.session-token=${identity}` }
            : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      })
      const json = await response.json()
      return { status: response.status, data: json }
    }
    try {
      const created = await call('/api/personames', 'POST', {
        title: 'Workflow Test Quiz',
        description: 'A test-only quiz.',
        emoji: '🧠',
        color: '#8b5cf6',
      })
      assert.equal(created.status, 200)
      assert.equal(created.data.emoji, '🧠')
      assert.equal(created.data.color, '#8b5cf6')
      const id = created.data.id,
        path = `/api/personames/${id}`
      assert.equal((await call(path, 'GET', undefined, null)).status, 401)
      assert.equal(
        (await call(path, 'PATCH', { color: '#14b8a6' }, otherToken)).status,
        404,
      )
      assert.equal(
        (await call(path, 'PATCH', { color: 'unknown' })).status,
        400,
      )
      assert.equal(
        (
          await call(path, 'PATCH', {
            title: '  Updated quiz  ',
            color: '#14b8a6',
          })
        ).data.title,
        'Updated quiz',
      )
      assert.equal((await call(path)).data.color, '#14b8a6')
      const aurora = '#2563eb,#7c3aed'
      assert.equal(
        (await call(path, 'PATCH', { color: aurora })).data.color,
        aurora,
      )
      assert.equal((await call(path)).data.color, aurora)
      assert.equal(
        (await call(path, 'PATCH', { color: '#ffffff,#000000' })).status,
        400,
      )
      await call(path, 'PATCH', { color: '#14b8a6' })
      for (const section of ['dimensions', 'archetypes', 'questions'])
        assert.equal(
          (await call(`${path}/${section}`, 'GET', undefined, otherToken))
            .status,
          404,
        )
      assert.equal(
        (
          await call(
            `${path}/dimensions`,
            'POST',
            { dimensions: [] },
            otherToken,
          )
        ).status,
        404,
      )
      const dimension = (
        await call(`${path}/dimensions`, 'POST', {
          dimensions: [
            {
              id: 'temp-m',
              name: 'Curiosity',
              color: '#7c3aed,#db2777',
              minLabel: 'Grounded',
              maxLabel: 'Exploratory',
              order: 0,
            },
          ],
        })
      ).data[0]
      assert.equal(dimension.displayScale, 'PERCENT_ASCENDING')
      assert.equal(dimension.color, '#7c3aed,#db2777')
      const renamedQuiz = (await call(path)).data
      assert.equal(renamedQuiz.dimensions[0].id, dimension.id)
      assert.equal('metrics' in renamedQuiz, false)
      for (const displayScale of [
        'PERCENT_ASCENDING',
        'PERCENT_DESCENDING',
        'BIPOLAR',
      ]) {
        const saved = await call(`${path}/dimensions`, 'POST', {
          dimensions: [{ ...dimension, displayScale }],
        })
        assert.equal(saved.status, 200)
        assert.equal(saved.data[0].displayScale, displayScale)
        assert.equal(
          (await call(`${path}/dimensions`)).data[0].displayScale,
          displayScale,
        )
        assert.equal(
          (
            await db.dimension.findUniqueOrThrow({
              where: { id: dimension.id },
            })
          ).displayScale,
          displayScale,
        )
      }
      const { displayScale: omittedScale, ...withoutScale } = dimension
      void omittedScale
      assert.equal(
        (
          await call(`${path}/dimensions`, 'POST', {
            dimensions: [withoutScale],
          })
        ).data[0].displayScale,
        'BIPOLAR',
      )
      assert.equal(
        (
          await call(`${path}/dimensions`, 'POST', {
            dimensions: [{ ...dimension, displayScale: 'INVALID' }],
          })
        ).status,
        400,
      )
      const archetypes = (
        await call(`${path}/archetypes`, 'POST', {
          archetypes: [
            {
              id: 'temp-a',
              name: 'Grounded',
              description: 'Familiar paths.',
              emoji: '🌱',
              order: 0,
              dimensions: [
                { dimensionId: dimension.id, targetValue: 0, relevance: 1 },
              ],
            },
            {
              id: 'temp-b',
              name: 'Explorer',
              color: '#4f46e5,#ec4899',
              description: 'New horizons.',
              emoji: '✨',
              order: 1,
              dimensions: [
                { dimensionId: dimension.id, targetValue: 100, relevance: 1 },
              ],
            },
          ],
        })
      ).data
      const answer = (
        id: string,
        text: string,
        value: number,
        order: number,
      ) => ({
        id,
        text,
        order,
        weights: [{ dimensionId: dimension.id, value }],
      })
      const body = {
        pages: [
          {
            id: 'temp-cover',
            title: 'Welcome',
            style: 'cover',
            order: 0,
            questions: [],
          },
          {
            id: 'temp-page',
            title: 'A little curiosity',
            order: 1,
            questions: [
              {
                id: 'temp-q1',
                text: 'Pick a path',
                type: 'MULTIPLE_CHOICE',
                order: 0,
                required: true,
                answers: [
                  answer('temp-a1', 'Familiar', -20, 0),
                  answer('temp-a2', 'New', 20, 1),
                ],
              },
              {
                id: 'temp-q2',
                text: 'How curious?',
                type: 'SLIDER',
                order: 1,
                required: true,
                answers: [
                  answer('temp-a3', 'Low', -20, 0),
                  answer('temp-a4', 'High', 20, 1),
                ],
              },
              {
                id: 'temp-q3',
                text: 'Try something new?',
                type: 'SCALE',
                order: 2,
                required: true,
                answers: [
                  answer('temp-a5', 'Rarely', -20, 0),
                  answer('temp-a6', 'Often', 20, 1),
                  answer('temp-a7', 'No', 0, 2),
                  answer('temp-a8', 'Maybe', 0, 3),
                  answer('temp-a9', 'Yes', 0, 4),
                ],
              },
            ],
          },
          {
            id: 'temp-results',
            title: 'Your result',
            style: 'results',
            order: 2,
            questions: [],
          },
        ],
      }
      const pages = await call(`${path}/questions`, 'POST', body)
      assert.equal(pages.status, 200, JSON.stringify(pages.data))
      const initial = (await call(path)).data
      assert.deepEqual(initial.issues, [])
      const questions = initial.pages[1].questions
      const ids = questions.map((q: { id: string }) => q.id)
      const resultBefore = await db.quizResult.count({
        where: { personaId: id },
      })
      const responses = {
        [ids[0]]: { answerId: questions[0].answers[1].id },
        [ids[1]]: { value: 100 },
        [ids[2]]: { answerId: questions[2].answers[4].id },
      }
      assert.equal(
        (await call(`${path}/preview`, 'POST', { responses })).status,
        200,
      )
      assert.equal(
        await db.quizResult.count({ where: { personaId: id } }),
        resultBefore,
        'preview does not save completions',
      )
      await call(`${path}/dimensions`, 'POST', {
        dimensions: [{ ...dimension, name: 'Curiosity updated' }],
      })
      let current = (await call(path)).data
      assert.equal(current.dimensions[0].id, dimension.id)
      assert.equal(
        current.pages[1].questions[0].answers[1].weights[0].dimensionId,
        dimension.id,
      )
      current.pages[1].questions[0].text = 'Pick a direction'
      assert.equal(
        (await call(`${path}/questions`, 'POST', { pages: current.pages }))
          .status,
        200,
      )
      current = (await call(path)).data
      assert.deepEqual(
        current.pages[1].questions.map((q: { id: string }) => q.id),
        ids,
      )
      assert.equal(
        (await call(`${path}/publish`, 'POST', {}, otherToken)).status,
        404,
      )
      assert.equal((await call(`${path}/publish`, 'POST')).status, 200)
      const slug = created.data.slug,
        publicPath = `/api/quiz/${slug}`
      const publicQuiz = (await call(publicPath, 'GET', undefined, null)).data
      assert.ok(!('weights' in publicQuiz.pages[1].questions[0].answers[0]))
      const submissionKey = randomUUID(),
        submit = { revision: publicQuiz.revision, submissionKey, responses }
      assert.equal(
        (
          await call(
            `${publicPath}/submit`,
            'POST',
            { ...submit, responses: {} },
            null,
          )
        ).status,
        400,
      )
      const finished = await call(`${publicPath}/submit`, 'POST', submit, null)
      assert.equal(finished.status, 200, JSON.stringify(finished.data))
      const repeated = await call(`${publicPath}/submit`, 'POST', submit, null)
      assert.equal(repeated.data.id, finished.data.id)
      assert.equal(await db.quizResult.count({ where: { personaId: id } }), 1)
      assert.equal(
        (await db.persona.findUniqueOrThrow({ where: { id } })).completions,
        1,
      )
      const resultUrl = `${publicPath}/results/${finished.data.id}`
      const historical = (await call(resultUrl, 'GET', undefined, null)).data
        .snapshot
      assert.equal(historical.scores[0].dimensionId, dimension.id)
      assert.equal(historical.scores[0].dimensionName, 'Curiosity updated')
      assert.equal('metricId' in historical.scores[0], false)
      assert.equal('metricName' in historical.scores[0], false)
      assert.equal(historical.archetype.name, 'Explorer')
      assert.equal(historical.archetype.color, '#4f46e5,#ec4899')
      assert.equal(historical.scores[0].color, '#7c3aed,#db2777')
      assert.equal(historical.scores[0].score, 100)
      await call(`${path}/archetypes`, 'POST', { archetypes: [archetypes[0]] })
      assert.equal(
        (
          await db.quizResult.findUniqueOrThrow({
            where: { id: finished.data.id },
          })
        ).archetypeId,
        null,
      )
      assert.deepEqual(
        (await call(resultUrl, 'GET', undefined, null)).data.snapshot,
        historical,
      )
      current = (await call(path)).data
      current.pages[1].questions[0].answers.pop()
      assert.equal(
        (await call(`${path}/questions`, 'POST', { pages: current.pages }))
          .status,
        200,
      )
      assert.equal(
        await db.quizResult.count({ where: { personaId: id } }),
        1,
        'removing used answers preserves results',
      )
      assert.equal(
        (await call(publicPath, 'GET', undefined, null)).status,
        404,
        'editing returns quiz to draft',
      )
      assert.equal(
        (await call(`${path}/publish`, 'POST')).status,
        400,
        'incomplete quiz cannot be republished',
      )
      const dashboard = (await call('/api/me/quizzes')).data.items
      assert.ok(dashboard.some((q: { id: string }) => q.id === id))
      assert.ok(
        !(await call('/api/me/quizzes', 'GET', undefined, otherToken)).data.items.some(
          (q: { id: string }) => q.id === id,
        ),
      )
      assert.ok(
        !(await call('/api/personames', 'GET', undefined, null)).data.some(
          (q: { id: string }) => q.id === id,
        ),
      )
    } finally {
      await db.user.deleteMany({
        where: { id: { in: [owner.id, stranger.id] } },
      })
      await db.$disconnect()
    }
  },
)
