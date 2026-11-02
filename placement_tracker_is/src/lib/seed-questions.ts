import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

interface Question {
  question: string;
  type: string;
  domain: string;
  difficulty: string;
  answer?: string;
  options?: string[];
  correctOption?: number;
}

const sampleQuestions: Question[] = [
  {
    question: "What is your approach to solving complex programming problems?",
    type: "technical",
    domain: "cse",
    difficulty: "medium",
    answer: "A good answer should include: Breaking down the problem, planning before coding, considering edge cases, and testing strategy."
  },
  {
    question: "Explain the concept of time complexity and why it's important.",
    type: "technical",
    domain: "cse",
    difficulty: "easy",
    answer: "Time complexity measures how the runtime of an algorithm grows with input size. It's important for writing efficient and scalable code."
  },
  {
    question: "Write a function to check if a string is a palindrome.",
    type: "coding",
    domain: "cse",
    difficulty: "easy",
    answer: "Compare characters from start and end, moving inwards. Or reverse the string and compare."
  },
  {
    question: "How do you handle stress and pressure in your work?",
    type: "behavioral",
    domain: "general",
    difficulty: "medium",
    answer: "Look for mentions of prioritization, time management, and maintaining work-life balance."
  },
  {
    question: "What is the difference between TCP and UDP?",
    type: "technical",
    domain: "cse",
    difficulty: "medium",
    answer: "TCP is connection-oriented, reliable, ordered delivery. UDP is connectionless, faster, but unreliable."
  },
  {
    question: "Implement a binary search algorithm.",
    type: "coding",
    domain: "cse",
    difficulty: "medium",
    answer: "Divide and conquer approach on sorted array, comparing middle element with target."
  },
  {
    question: "Tell me about a time you had to learn a new technology quickly.",
    type: "behavioral",
    domain: "general",
    difficulty: "easy",
    answer: "Look for structured learning approach, motivation, and successful implementation."
  },
  {
    question: "Explain the concept of REST API.",
    type: "technical",
    domain: "cse",
    difficulty: "easy",
    answer: "Representational State Transfer, stateless client-server architecture using HTTP methods."
  },
  {
    question: "What is database normalization?",
    type: "technical",
    domain: "cse",
    difficulty: "hard",
    answer: "Process of organizing database to reduce redundancy and improve data integrity through normal forms."
  },
  {
    question: "Implement a function to detect a cycle in a linked list.",
    type: "coding",
    domain: "cse",
    difficulty: "hard",
    answer: "Use Floyd's cycle finding algorithm (tortoise and hare) or marking visited nodes."
  }
];

export async function seedQuestions() {
  try {
    const questionsCollection = collection(db, 'questions');
    
    for (const question of sampleQuestions) {
      await addDoc(questionsCollection, {
        ...question,
        createdAt: new Date().toISOString(),
      });
    }
    
    console.log('Successfully seeded sample questions');
    return { success: true };
  } catch (error) {
    console.error('Error seeding questions:', error);
    return { success: false, error };
  }
}

// Uncomment and run this function to seed the database
// seedQuestions();