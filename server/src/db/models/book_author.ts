import { DataType, Table, Model, Column, HasMany } from "sequelize-typescript";
import { Book } from "./book";

@Table({
  tableName: "book_authors",
})
export class BookAuthor extends Model {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare author_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare author_nationality: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare birth_year: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare death_year: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare author_biography: string;

  @HasMany(() => Book)
  declare books: Book[];
}

// Initial book authors
export const bookAuthors = [
  {
    id: 1,
    author_name: "Stanisław Lem",
    author_nationality: "Polish",
    birth_year: 1921,
    death_year: 2006,
    author_biography:
      "Wybitny polski pisarz science fiction, filozof i futurolog.",
  },
  {
    id: 2,
    author_name: "Henryk Sienkiewicz",
    author_nationality: "Polish",
    birth_year: 1846,
    death_year: 1916,
    author_biography:
      "Laureat Nagrody Nobla w dziedzinie literatury w 1905 roku.",
  },
  {
    id: 3,
    author_name: "J.K. Rowling",
    author_nationality: "British",
    birth_year: 1965,
    death_year: null,
    author_biography:
      "Brytyjska pisarka, autorka serii książek o Harrym Potterze.",
  },
  {
    id: 4,
    author_name: "George Orwell",
    author_nationality: "British",
    birth_year: 1903,
    death_year: 1950,
    author_biography:
      "Brytyjski pisarz i dziennikarz, autor dystopii '1984' i 'Folwark zwierzęcy'.",
  },
  {
    id: 5,
    author_name: "J.R.R. Tolkien",
    author_nationality: "British",
    birth_year: 1892,
    death_year: 1973,
    author_biography: "Angielski pisarz i filolog, twórca Śródziemia.",
  },
  {
    id: 6,
    author_name: "Stephen King",
    author_nationality: "American",
    birth_year: 1947,
    death_year: null,
    author_biography: "Amerykański pisarz horrorów i thrilerów.",
  },
  {
    id: 7,
    author_name: "Agatha Christie",
    author_nationality: "British",
    birth_year: 1890,
    death_year: 1976,
    author_biography:
      "Brytyjska pisarka kryminałów, twórczyni Herkulesa Poirota.",
  },
  {
    id: 8,
    author_name: "Isaac Asimov",
    author_nationality: "American",
    birth_year: 1920,
    death_year: 1992,
    author_biography:
      "Amerykański pisarz science fiction i popularyzator nauki.",
  },
  {
    id: 9,
    author_name: "Adam Mickiewicz",
    author_nationality: "Polish",
    birth_year: 1798,
    death_year: 1855,
    author_biography:
      "Największy poeta polskiego romantyzmu, autor 'Pana Tadeusza'.",
  },
  {
    id: 10,
    author_name: "Dan Brown",
    author_nationality: "American",
    birth_year: 1964,
    death_year: null,
    author_biography:
      "Amerykański pisarz thrillerów, autor 'Kodu Leonarda da Vinci'.",
  },
];
