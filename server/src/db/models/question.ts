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
  {
    id: "q3",
    content: "Jakie masz hobby?",
    options: ["Muzyka", "Sztuka", "Technologia", "Nauka"],
  },
  {
    id: "q4",
    content: "Ulubiony rodzaj filmu?",
    options: ["Akcja", "Komedia", "Dramat", "Horror"],
  },
  {
    id: "q5",
    content: "Jakie masz ulubione jedzenie?",
    options: ["Pizza", "Sushi", "Sałatka", "Zupa"],
  },
];
