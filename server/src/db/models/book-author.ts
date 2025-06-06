export type BookAuthor = {
  author_id: number;
  author_country_id: number;
  author_name: string;
};

export const authors: BookAuthor[] = [
  {
    author_id: 1,
    author_country_id: 1,
    author_name: "J.K. Rowling",
  },
  {
    author_id: 2,
    author_country_id: 2,
    author_name: "George R.R. Martin",
  },
  {
    author_id: 3,
    author_country_id: 3,
    author_name: "J.R.R. Tolkien",
  },
  {
    author_id: 4,
    author_country_id: 4,
    author_name: "Agatha Christie",
  },
];
