import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create or find test user
  const user = await prisma.user.upsert({
    where: { email: 'test@personame.dev' },
    update: {},
    create: {
      email: 'test@personame.dev',
      name: 'Test Developer',
      emailVerified: new Date(),
    },
  });

  console.log('✅ User:', user.email);

  // Create test personame (Myers-Briggs inspired)
  const personame = await prisma.personame.create({
    data: {
      title: 'Personality Type Quiz',
      slug: `personality-type-${Date.now()}`,
      description:
        'Discover your personality type based on four key dimensions.',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      userId: user.id,

      // Create 4 metrics
      metrics: {
        create: [
          {
            name: 'Extraversion',
            description: 'How outgoing and sociable you are',
            minLabel: 'Introvert',
            maxLabel: 'Extrovert',
            order: 1,
          },
          {
            name: 'Intuition',
            description: 'How much you trust intuition vs. concrete facts',
            minLabel: 'Sensing',
            maxLabel: 'Intuitive',
            order: 2,
          },
          {
            name: 'Thinking',
            description: 'Whether you prioritize logic or harmony',
            minLabel: 'Feeling',
            maxLabel: 'Thinking',
            order: 3,
          },
          {
            name: 'Structure',
            description: 'How much you like planning vs. spontaneity',
            minLabel: 'Perceiving',
            maxLabel: 'Judging',
            order: 4,
          },
        ],
      },
    },
    include: { metrics: true },
  });

  console.log('✅ Personame:', personame.title);

  // Get metrics for reference
  const [extraversion, intuition, thinking, structure] = personame.metrics;

  // Create 4 archetypes
  const archetypes = await Promise.all([
    prisma.archetype.create({
      data: {
        name: 'The Advocate',
        description:
          'Idealistic and principled. You are driven by your values and passion for making the world better.',
        emoji: '🌟',
        color: '#a855f7',
        personameId: personame.id,
        metrics: {
          create: [
            {
              metricId: intuition.id,
              targetValue: 80,
              relevance: 1,
            },
            {
              metricId: thinking.id,
              targetValue: 20,
              relevance: 0.9,
            },
            {
              metricId: extraversion.id,
              targetValue: 70,
              relevance: 0.7,
            },
            {
              metricId: structure.id,
              targetValue: 75,
              relevance: 0.6,
            },
          ],
        },
      },
    }),
    prisma.archetype.create({
      data: {
        name: 'The Logistician',
        description:
          'Practical and fact-oriented. You excel at organization and reliable execution of plans.',
        emoji: '⚙️',
        color: '#5568ff',
        personameId: personame.id,
        metrics: {
          create: [
            {
              metricId: intuition.id,
              targetValue: 20,
              relevance: 0.9,
            },
            {
              metricId: thinking.id,
              targetValue: 75,
              relevance: 1,
            },
            {
              metricId: extraversion.id,
              targetValue: 30,
              relevance: 0.7,
            },
            {
              metricId: structure.id,
              targetValue: 85,
              relevance: 0.9,
            },
          ],
        },
      },
    }),
    prisma.archetype.create({
      data: {
        name: 'The Entertainer',
        description:
          'Spontaneous and charismatic. You bring energy and enthusiasm to any situation.',
        emoji: '🎭',
        color: '#f91880',
        personameId: personame.id,
        metrics: {
          create: [
            {
              metricId: extraversion.id,
              targetValue: 85,
              relevance: 1,
            },
            {
              metricId: intuition.id,
              targetValue: 60,
              relevance: 0.8,
            },
            {
              metricId: thinking.id,
              targetValue: 40,
              relevance: 0.7,
            },
            {
              metricId: structure.id,
              targetValue: 25,
              relevance: 0.9,
            },
          ],
        },
      },
    }),
    prisma.archetype.create({
      data: {
        name: 'The Architect',
        description:
          'Analytical and strategic. You see the bigger picture and plan for future possibilities.',
        emoji: '🏗️',
        color: '#06b6d4',
        personameId: personame.id,
        metrics: {
          create: [
            {
              metricId: intuition.id,
              targetValue: 85,
              relevance: 1,
            },
            {
              metricId: thinking.id,
              targetValue: 80,
              relevance: 0.9,
            },
            {
              metricId: extraversion.id,
              targetValue: 40,
              relevance: 0.6,
            },
            {
              metricId: structure.id,
              targetValue: 65,
              relevance: 0.7,
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${archetypes.length} archetypes`);

  // Create question page
  const page = await prisma.questionPage.create({
    data: {
      title: 'Getting to Know You',
      order: 1,
      personameId: personame.id,
    },
  });

  // Create sample questions
  const questions = await Promise.all([
    prisma.question.create({
      data: {
        text: 'At a party, you typically:',
        type: 'MULTIPLE_CHOICE',
        order: 1,
        pageId: page.id,
        answers: {
          create: [
            {
              text: 'Mingle with lots of people',
              order: 1,
              weights: {
                create: {
                  metricId: extraversion.id,
                  weight: 50,
                },
              },
            },
            {
              text: 'Chat deeply with a few people',
              order: 2,
              weights: {
                create: {
                  metricId: extraversion.id,
                  weight: -40,
                },
              },
            },
            {
              text: 'Observe from the sidelines',
              order: 3,
              weights: {
                create: {
                  metricId: extraversion.id,
                  weight: -50,
                },
              },
            },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        text: 'When making decisions, you rely more on:',
        type: 'MULTIPLE_CHOICE',
        order: 2,
        pageId: page.id,
        answers: {
          create: [
            {
              text: 'Facts and data',
              order: 1,
              weights: {
                create: {
                  metricId: intuition.id,
                  weight: -40,
                },
              },
            },
            {
              text: 'Gut feelings and patterns',
              order: 2,
              weights: {
                create: {
                  metricId: intuition.id,
                  weight: 40,
                },
              },
            },
            {
              text: 'Both equally',
              order: 3,
              weights: {
                create: {
                  metricId: intuition.id,
                  weight: 0,
                },
              },
            },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        text: 'In conflict, you are more likely to:',
        type: 'MULTIPLE_CHOICE',
        order: 3,
        pageId: page.id,
        answers: {
          create: [
            {
              text: 'Focus on logical analysis of the problem',
              order: 1,
              weights: {
                create: {
                  metricId: thinking.id,
                  weight: 45,
                },
              },
            },
            {
              text: 'Consider how everyone feels',
              order: 2,
              weights: {
                create: {
                  metricId: thinking.id,
                  weight: -45,
                },
              },
            },
            {
              text: 'Try to find a compromise',
              order: 3,
              weights: {
                create: {
                  metricId: thinking.id,
                  weight: 0,
                },
              },
            },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        text: 'You prefer to:',
        type: 'MULTIPLE_CHOICE',
        order: 4,
        pageId: page.id,
        answers: {
          create: [
            {
              text: 'Have a detailed plan before starting',
              order: 1,
              weights: {
                create: {
                  metricId: structure.id,
                  weight: 50,
                },
              },
            },
            {
              text: 'Adapt as you go',
              order: 2,
              weights: {
                create: {
                  metricId: structure.id,
                  weight: -50,
                },
              },
            },
            {
              text: 'Go with the flow but stay organized',
              order: 3,
              weights: {
                create: {
                  metricId: structure.id,
                  weight: 0,
                },
              },
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${questions.length} questions with answers`);

  // Create some sample results
  const result1 = await prisma.quizResult.create({
    data: {
      personameId: personame.id,
      archetypeId: archetypes[0].id, // The Advocate
      metricScores: {
        create: [
          {
            metricId: extraversion.id,
            score: 72,
            percentile: 65,
          },
          {
            metricId: intuition.id,
            score: 78,
            percentile: 72,
          },
          {
            metricId: thinking.id,
            score: 25,
            percentile: 30,
          },
          {
            metricId: structure.id,
            score: 71,
            percentile: 68,
          },
        ],
      },
    },
  });

  const result2 = await prisma.quizResult.create({
    data: {
      personameId: personame.id,
      archetypeId: archetypes[1].id, // The Logistician
      metricScores: {
        create: [
          {
            metricId: extraversion.id,
            score: 28,
            percentile: 25,
          },
          {
            metricId: intuition.id,
            score: 22,
            percentile: 20,
          },
          {
            metricId: thinking.id,
            score: 76,
            percentile: 75,
          },
          {
            metricId: structure.id,
            score: 82,
            percentile: 80,
          },
        ],
      },
    },
  });

  console.log(`✅ Created ${[result1, result2].length} sample results`);

  console.log('\n✨ Seeding complete!');
  console.log(`\n📊 Summary:`);
  console.log(`  - User: ${user.email}`);
  console.log(`  - Quiz: "${personame.title}"`);
  console.log(`  - Metrics: ${personame.metrics.length}`);
  console.log(`  - Archetypes: ${archetypes.length}`);
  console.log(`  - Questions: ${questions.length}`);
  console.log(
    `\n💡 Try this:`
  );
  console.log(`  npx prisma studio  # View the data in GUI`);
  console.log(`  npm run dev         # Start dev server and create more quizzes`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
