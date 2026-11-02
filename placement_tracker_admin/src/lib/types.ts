import type { Timestamp } from 'firebase/firestore';

export type User = {
  id: string;
  name: string;
  email: string;
  usn: string;
  year: string;
  appt_score: number;
  coding_score: number;
  softskill_score: number;
  createdAt: Timestamp;
};

export type Test = {
  id:string;
  title: string;
  duration: number;
  ques: number; // Number of questions
};

export type AptitudeQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

export type SoftSkillQuestion = {
  id: string;
  question: string;
  options: string[];
  ans: string;
};
