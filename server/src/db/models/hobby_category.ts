export type HobbyCategory = {
  id: number;
  hobby_category_name: string;
  hobby_category_description: string;
};

export const hobby_categories: HobbyCategory[] = [
  {
    id: 1,
    hobby_category_name: "Sport",
    hobby_category_description: "Aktywność fizyczna, rywalizacja, zdrowie.",
  },
  {
    id: 2,
    hobby_category_name: "Książki",
    hobby_category_description: "Czytanie, literatura, rozwój osobisty.",
  },
  {
    id: 3,
    hobby_category_name: "Gry",
    hobby_category_description: "Rozrywka, strategia, współpraca.",
  },
  {
    id: 4,
    hobby_category_name: "Podróże",
    hobby_category_description: "Odkrywanie nowych miejsc, kultura, przygoda.",
  },
  {
    id: 5,
    hobby_category_name: "Muzyka",
    hobby_category_description: "Słuchanie, tworzenie, emocje.",
  },
  {
    id: 6,
    hobby_category_name: "Nauka",
    hobby_category_description: "Badania, eksperymenty, odkrycia.",
  },
];
