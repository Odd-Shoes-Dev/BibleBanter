const questions = [
  {
    id: 1,
    category: "Old Testament",
    difficulty: "easy",
    question: "Who was swallowed by a great fish?",
    options: ["Moses", "Jonah", "Elijah", "Daniel"],
    answer: 1,
    scripture: "Jonah 1:17 — 'Now the LORD provided a huge fish to swallow Jonah, and Jonah was in the belly of the fish three days and three nights.'"
  },
  {
    id: 2,
    category: "Old Testament",
    difficulty: "easy",
    question: "Who killed the giant Goliath?",
    options: ["Solomon", "Saul", "David", "Joshua"],
    answer: 2,
    scripture: "1 Samuel 17:50 — 'So David triumphed over the Philistine with a sling and a stone.'"
  },
  {
    id: 3,
    category: "Old Testament",
    difficulty: "easy",
    question: "Who built the great ark to survive the flood?",
    options: ["Abraham", "Noah", "Adam", "Enoch"],
    answer: 1,
    scripture: "Genesis 6:14 — 'So make yourself an ark of cypress wood.'"
  },
  {
    id: 4,
    category: "Old Testament",
    difficulty: "medium",
    question: "How many days and nights did it rain during Noah's flood?",
    options: ["7 days", "20 days", "40 days", "100 days"],
    answer: 2,
    scripture: "Genesis 7:12 — 'And rain fell on the earth forty days and forty nights.'"
  },
  {
    id: 5,
    category: "Old Testament",
    difficulty: "medium",
    question: "Who was Moses' brother who helped him speak to Pharaoh?",
    options: ["Aaron", "Caleb", "Joshua", "Levi"],
    answer: 0,
    scripture: "Exodus 4:14 — 'Your brother Aaron the Levite. He will speak to the people for you.'"
  },
  {
    id: 6,
    category: "Old Testament",
    difficulty: "hard",
    question: "In which city were the walls that fell after the Israelites marched around them?",
    options: ["Jerusalem", "Bethlehem", "Jericho", "Hebron"],
    answer: 2,
    scripture: "Joshua 6:20 — 'When the trumpets sounded, the army shouted, and the wall collapsed.'"
  },
  {
    id: 7,
    category: "Old Testament",
    difficulty: "medium",
    question: "Who was thrown into the lions' den but was protected by God?",
    options: ["Shadrach", "Daniel", "Joseph", "Nehemiah"],
    answer: 1,
    scripture: "Daniel 6:22 — 'My God sent his angel, and he shut the mouths of the lions.'"
  },
  {
    id: 8,
    category: "Old Testament",
    difficulty: "easy",
    question: "What was the name of the first woman created by God?",
    options: ["Sarah", "Ruth", "Eve", "Miriam"],
    answer: 2,
    scripture: "Genesis 3:20 — 'Adam named his wife Eve, because she would become the mother of all the living.'"
  },
  {
    id: 9,
    category: "New Testament",
    difficulty: "easy",
    question: "What was Jesus' first miracle?",
    options: ["Healing a blind man", "Raising Lazarus", "Walking on water", "Turning water into wine"],
    answer: 3,
    scripture: "John 2:11 — 'What Jesus did here in Cana of Galilee was the first of the signs through which he revealed his glory.'"
  },
  {
    id: 10,
    category: "New Testament",
    difficulty: "easy",
    question: "How many disciples did Jesus choose?",
    options: ["7", "10", "12", "15"],
    answer: 2,
    scripture: "Luke 6:13 — 'He chose twelve of them, whom he also designated apostles.'"
  },
  {
    id: 11,
    category: "New Testament",
    difficulty: "medium",
    question: "Which disciple denied Jesus three times?",
    options: ["John", "Peter", "Thomas", "Judas"],
    answer: 1,
    scripture: "Luke 22:61 — 'And Peter remembered the word the Lord had spoken to him: Before the rooster crows today, you will disown me three times.'"
  },
  {
    id: 12,
    category: "New Testament",
    difficulty: "easy",
    question: "Jesus fed 5,000 people with how many loaves of bread and fish?",
    options: ["10 loaves, 5 fish", "5 loaves, 2 fish", "7 loaves, 3 fish", "3 loaves, 2 fish"],
    answer: 1,
    scripture: "John 6:9 — 'Here is a boy with five small barley loaves and two small fish.'"
  },
  {
    id: 13,
    category: "New Testament",
    difficulty: "medium",
    question: "In which river was Jesus baptized?",
    options: ["Nile", "Euphrates", "Jordan", "Galilee"],
    answer: 2,
    scripture: "Matthew 3:13 — 'Then Jesus came from Galilee to the Jordan to be baptized by John.'"
  },
  {
    id: 14,
    category: "New Testament",
    difficulty: "hard",
    question: "What is the shortest verse in the Bible?",
    options: ["God is love.", "Be still.", "Rejoice always.", "Jesus wept."],
    answer: 3,
    scripture: "John 11:35 — 'Jesus wept.' — the shortest verse in the Bible."
  },
  {
    id: 15,
    category: "New Testament",
    difficulty: "medium",
    question: "On which day did Jesus rise from the dead?",
    options: ["The first day", "The second day", "The third day", "The seventh day"],
    answer: 2,
    scripture: "Luke 24:46 — 'He told them, The Messiah will suffer and rise from the dead on the third day.'"
  },
  {
    id: 16,
    category: "New Testament",
    difficulty: "hard",
    question: "Who wrote most of the letters (epistles) in the New Testament?",
    options: ["Peter", "John", "Paul", "James"],
    answer: 2,
    scripture: "Romans 1:1 — 'Paul, a servant of Christ Jesus, called to be an apostle...'"
  },
  {
    id: 17,
    category: "Old Testament",
    difficulty: "hard",
    question: "How many plagues did God send on Egypt?",
    options: ["7", "8", "10", "12"],
    answer: 2,
    scripture: "Exodus 11:1 — 'Now the LORD had said to Moses, I will bring one more plague on Pharaoh and on Egypt.'"
  },
  {
    id: 18,
    category: "New Testament",
    difficulty: "easy",
    question: "Where was Jesus born?",
    options: ["Jerusalem", "Nazareth", "Bethlehem", "Jericho"],
    answer: 2,
    scripture: "Luke 2:4-6 — 'He went there to Bethlehem... while they were there, the time came for the baby to be born.'"
  },
  {
    id: 19,
    category: "New Testament",
    difficulty: "expert",
    question: "Who replaced Judas Iscariot as the twelfth apostle?",
    options: ["Barnabas", "Silas", "Matthias", "Stephen"],
    answer: 2,
    scripture: "Acts 1:26 — 'Then they cast lots, and the lot fell to Matthias; so he was added to the eleven apostles.'"
  },
  {
    id: 20,
    category: "Old Testament",
    difficulty: "expert",
    question: "What was the name of Moses' mother?",
    options: ["Zipporah", "Miriam", "Pharaoh's daughter", "Jochebed"],
    answer: 3,
    scripture: "Exodus 6:20 — 'Amram married his father's sister Jochebed, who bore him Aaron and Moses.'"
  },
  {
    id: 21,
    category: "Old Testament",
    difficulty: "expert",
    question: "Who was the first judge of Israel mentioned in the Book of Judges?",
    options: ["Gideon", "Deborah", "Samson", "Othniel"],
    answer: 3,
    scripture: "Judges 3:9 — 'But when they cried out to the LORD, he raised up for them a deliverer, Othniel son of Kenaz.'"
  },
  {
    id: 22,
    category: "New Testament",
    difficulty: "expert",
    question: "What is the place where Jesus was crucified called in Hebrew?",
    options: ["Gethsemane", "Golgotha", "Bethany", "Emmaus"],
    answer: 1,
    scripture: "John 19:17 — 'Carrying his own cross, he went out to the place of the Skull (which in Aramaic is called Golgotha).'"
  },
  {
    id: 23,
    category: "Old Testament",
    difficulty: "expert",
    question: "Which prophet is known as the 'weeping prophet'?",
    options: ["Isaiah", "Hosea", "Jeremiah", "Ezekiel"],
    answer: 2,
    scripture: "Jeremiah 9:1 — 'Oh, that my head were a spring of water and my eyes a fountain of tears! I would weep day and night.'"
  },
  {
    id: 24,
    category: "New Testament",
    difficulty: "expert",
    question: "How many books did the Apostle Paul write in the New Testament?",
    options: ["9", "11", "13", "7"],
    answer: 2,
    scripture: "Romans through Philemon — Paul authored 13 epistles, from Romans to Philemon, making him the most prolific NT author."
  }
];

module.exports = questions;
