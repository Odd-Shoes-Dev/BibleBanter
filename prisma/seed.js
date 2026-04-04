const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.question.deleteMany();
  await prisma.questionSet.deleteMany();

  const set1 = await prisma.questionSet.create({
    data: {
      name: 'General Bible Knowledge',
      description: 'A mix of Old and New Testament questions',
      testament: 'both',
      isDefault: true,
      questions: {
        create: [
          { category: 'General', difficulty: 'easy', question: 'How many days did God take to create the world?', options: ['5', '6', '7', '8'], answer: 1, scripture: 'Genesis 1' },
          { category: 'General', difficulty: 'medium', question: 'Who is known as the father of faith?', options: ['Moses', 'David', 'Abraham', 'Isaac'], answer: 2, scripture: 'Romans 4:16' },
        ]
      }
    }
  });

  const set2 = await prisma.questionSet.create({
    data: {
      name: 'Old Testament Heroes',
      description: 'Questions about heroes of the Old Testament',
      testament: 'Old Testament',
      isDefault: true,
      questions: {
        create: [
          { category: 'Old Testament', difficulty: 'easy', question: 'Who defeated Goliath?', options: ['Saul', 'David', 'Solomon', 'Jonathan'], answer: 1, scripture: '1 Samuel 17' },
          { category: 'Old Testament', difficulty: 'hard', question: 'Who was the left-handed judge?', options: ['Ehud', 'Gideon', 'Samson', 'Jephthah'], answer: 0, scripture: 'Judges 3:15' },
        ]
      }
    }
  });

  const set3 = await prisma.questionSet.create({
    data: {
      name: 'Life of Jesus',
      description: 'Questions about the life and ministry of Jesus Christ',
      testament: 'New Testament',
      isDefault: true,
      questions: {
        create: [
          { category: 'New Testament', difficulty: 'easy', question: 'Where was Jesus born?', options: ['Jerusalem', 'Nazareth', 'Bethlehem', 'Capernaum'], answer: 2, scripture: 'Matthew 2:1' },
          { category: 'New Testament', difficulty: 'medium', question: 'What was Jesus first miracle?', options: ['Healing the blind', 'Water to wine', 'Walking on water', 'Feeding 5000'], answer: 1, scripture: 'John 2:11' },
        ]
      }
    }
  });

  console.log('Seed completed with 3 distinct question banks.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
