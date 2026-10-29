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

  // Create test persona (Myers-Briggs inspired)
  const persona = await prisma.persona.create({
    data: {
      title: 'Personality Type Quiz',
      slug: `personality-type-${Date.now()}`,
      description:
        'Discover your personality type based on four key dimensions.',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      creatorId: user.id,

      // Create 4 dimensions
      dimensions: {
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
    include: { dimensions: true },
  });

  console.log('✅ Persona:', persona.title);

  // Get dimensions for reference
  const [extraversion, intuition, thinking, structure] = persona.dimensions;

  // Create 4 archetypes
  const archetypes = await Promise.all([
    prisma.archetype.create({
      data: {
        name: 'The Advocate',
        description:
          'Idealistic and principled. You are driven by your values and passion for making the world better.',
        emoji: '🌟',
        color: '#a855f7',
        personaId: persona.id,
        dimensions: {
          create: [
            {
              dimensionId: intuition.id,
              targetValue: 80,
              relevance: 1,
            },
            {
              dimensionId: thinking.id,
              targetValue: 20,
              relevance: 0.9,
            },
            {
              dimensionId: extraversion.id,
              targetValue: 70,
              relevance: 0.7,
            },
            {
              dimensionId: structure.id,
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
        personaId: persona.id,
        dimensions: {
          create: [
            {
              dimensionId: intuition.id,
              targetValue: 20,
              relevance: 0.9,
            },
            {
              dimensionId: thinking.id,
              targetValue: 75,
              relevance: 1,
            },
            {
              dimensionId: extraversion.id,
              targetValue: 30,
              relevance: 0.7,
            },
            {
              dimensionId: structure.id,
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
        personaId: persona.id,
        dimensions: {
          create: [
            {
              dimensionId: extraversion.id,
              targetValue: 85,
              relevance: 1,
            },
            {
              dimensionId: intuition.id,
              targetValue: 60,
              relevance: 0.8,
            },
            {
              dimensionId: thinking.id,
              targetValue: 40,
              relevance: 0.7,
            },
            {
              dimensionId: structure.id,
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
        personaId: persona.id,
        dimensions: {
          create: [
            {
              dimensionId: intuition.id,
              targetValue: 85,
              relevance: 1,
            },
            {
              dimensionId: thinking.id,
              targetValue: 80,
              relevance: 0.9,
            },
            {
              dimensionId: extraversion.id,
              targetValue: 40,
              relevance: 0.6,
            },
            {
              dimensionId: structure.id,
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
  const page = await prisma.quizPage.create({
    data: {
      title: 'Getting to Know You',
      order: 1,
      personaId: persona.id,
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
                  dimensionId: extraversion.id,
                  value: 100,
                },
              },
            },
            {
              text: 'Chat deeply with a few people',
              order: 2,
              weights: {
                create: {
                  dimensionId: extraversion.id,
                  value: 10,
                },
              },
            },
            {
              text: 'Observe from the sidelines',
              order: 3,
              weights: {
                create: {
                  dimensionId: extraversion.id,
                  value: 0,
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
                  dimensionId: intuition.id,
                  value: 10,
                },
              },
            },
            {
              text: 'Gut feelings and patterns',
              order: 2,
              weights: {
                create: {
                  dimensionId: intuition.id,
                  value: 90,
                },
              },
            },
            {
              text: 'Both equally',
              order: 3,
              weights: {
                create: {
                  dimensionId: intuition.id,
                  value: 50,
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
                  dimensionId: thinking.id,
                  value: 95,
                },
              },
            },
            {
              text: 'Consider how everyone feels',
              order: 2,
              weights: {
                create: {
                  dimensionId: thinking.id,
                  value: 5,
                },
              },
            },
            {
              text: 'Try to find a compromise',
              order: 3,
              weights: {
                create: {
                  dimensionId: thinking.id,
                  value: 50,
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
                  dimensionId: structure.id,
                  value: 100,
                },
              },
            },
            {
              text: 'Adapt as you go',
              order: 2,
              weights: {
                create: {
                  dimensionId: structure.id,
                  value: 0,
                },
              },
            },
            {
              text: 'Go with the flow but stay organized',
              order: 3,
              weights: {
                create: {
                  dimensionId: structure.id,
                  value: 50,
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
      personaId: persona.id,
      archetypeId: archetypes[0].id, // The Advocate
      dimensionScores: {
        create: [
          {
            dimensionName: extraversion.name,
            score: 72,
          },
          {
            dimensionName: intuition.name,
            score: 78,
          },
          {
            dimensionName: thinking.name,
            score: 25,
          },
          {
            dimensionName: structure.name,
            score: 71,
          },
        ],
      },
    },
  });

  const result2 = await prisma.quizResult.create({
    data: {
      personaId: persona.id,
      archetypeId: archetypes[1].id, // The Logistician
      dimensionScores: {
        create: [
          {
            dimensionName: extraversion.name,
            score: 28,
          },
          {
            dimensionName: intuition.name,
            score: 22,
          },
          {
            dimensionName: thinking.name,
            score: 76,
          },
          {
            dimensionName: structure.name,
            score: 82,
          },
        ],
      },
    },
  });

  console.log(`✅ Created ${[result1, result2].length} sample results`);

  console.log('\n✨ Seeding complete!');
  console.log(`\n📊 Summary:`);
  console.log(`  - User: ${user.email}`);
  console.log(`  - Quiz: "${persona.title}"`);
  console.log(`  - Dimensions: ${persona.dimensions.length}`);
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
