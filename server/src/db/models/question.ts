export type Question = {
  id: string;
  content: string;
  options: string[]; // np. ["A", "B", "C", "D"]
};

export const questions: Question[] = [
  {
    id: "q1",
    content: "Jak spędzasz wolny czas?",
    options: ["Sport", "Książki", "Gry", "Podróże"],
  },
  {
    id: "q2",
    content: "Ulubiona pora dnia?",
    options: ["Rano", "Popołudnie", "Wieczór", "Noc"],
  },
  // ... więcej pytań
];
