import {
  DataType,
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { BookAuthor } from "./book_author";
import { UserBook } from "./user_books";

@Table({
  tableName: "books",
})
export class Book extends Model {
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
  declare book_title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare book_description: string;

  @ForeignKey(() => BookAuthor)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare author_id: number;

  @BelongsTo(() => BookAuthor)
  declare author: BookAuthor;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare publication_year: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare isbn: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare page_count: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare book_genre: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare publisher: string;

  @HasMany(() => UserBook)
  declare users: UserBook[];
}

// Initial books
export const books = [
  {
    id: 1,
    book_title: "Solaris",
    book_description:
      "Filozoficzna powieść science fiction o kontakcie z obcą inteligencją.",
    author_id: 1,
    publication_year: 1961,
    isbn: "978-83-06-02823-4",
    page_count: 280,
    book_genre: "Science Fiction",
    publisher: "Wydawnictwo Literackie",
  },
  {
    id: 2,
    book_title: "Quo Vadis",
    book_description: "Powieść historyczna osadzona w czasach cesarza Nerona.",
    author_id: 2,
    publication_year: 1896,
    isbn: "978-83-240-1234-5",
    page_count: 720,
    book_genre: "Powieść historyczna",
    publisher: "PIW",
  },
  {
    id: 3,
    book_title: "Harry Potter i Kamień Filozoficzny",
    book_description:
      "Pierwsza część przygód młodego czarodzieja Harry'ego Pottera.",
    author_id: 3,
    publication_year: 1997,
    isbn: "978-83-7278-295-1",
    page_count: 310,
    book_genre: "Fantasy",
    publisher: "Media Rodzina",
  },
  {
    id: 4,
    book_title: "1984",
    book_description:
      "Dystopia o społeczeństwie totalitarnym pod kontrolą Wielkiego Brata.",
    author_id: 4,
    publication_year: 1949,
    isbn: "978-83-240-5678-9",
    page_count: 350,
    book_genre: "Dystopia",
    publisher: "Muza",
  },
  {
    id: 5,
    book_title: "Władca Pierścieni: Drużyna Pierścienia",
    book_description: "Pierwsza część epickiej trylogii fantasy o Śródziemiu.",
    author_id: 5,
    publication_year: 1954,
    isbn: "978-83-7648-123-4",
    page_count: 560,
    book_genre: "Fantasy",
    publisher: "Zysk i S-ka",
  },
  {
    id: 6,
    book_title: "Lśnienie",
    book_description: "Horror o pisarzu uwięzionym w nawiedzonym hotelu.",
    author_id: 6,
    publication_year: 1977,
    isbn: "978-83-7985-456-7",
    page_count: 520,
    book_genre: "Horror",
    publisher: "Albatros",
  },
  {
    id: 7,
    book_title: "Morderstwo w Orient Expressie",
    book_description: "Klasyczna powieść kryminalna z Herkulesem Poirot.",
    author_id: 7,
    publication_year: 1934,
    isbn: "978-83-8032-789-0",
    page_count: 280,
    book_genre: "Kryminał",
    publisher: "Dolnośląskie",
  },
  {
    id: 8,
    book_title: "Fundacja",
    book_description:
      "Pierwsza część cyklu o galaktycznym imperium i psychohistorii.",
    author_id: 8,
    publication_year: 1951,
    isbn: "978-83-7469-321-2",
    page_count: 320,
    book_genre: "Science Fiction",
    publisher: "Rebis",
  },
  {
    id: 9,
    book_title: "Pan Tadeusz",
    book_description: "Epopeja narodowa opisująca życie szlachty litewskiej.",
    author_id: 9,
    publication_year: 1834,
    isbn: "978-83-06-01234-5",
    page_count: 450,
    book_genre: "Epopeja",
    publisher: "Ossolineum",
  },
  {
    id: 10,
    book_title: "Kod Leonarda da Vinci",
    book_description: "Thriller łączący sztukę, historię i spisek religijny.",
    author_id: 10,
    publication_year: 2003,
    isbn: "978-83-7648-987-6",
    page_count: 590,
    book_genre: "Thriller",
    publisher: "Sonia Draga",
  },
  {
    id: 11,
    book_title: "Cyberiada",
    book_description:
      "Zbiór opowiadań science fiction o robotach Trupie i Klapaucjuszu.",
    author_id: 1,
    publication_year: 1965,
    isbn: "978-83-06-02824-1",
    page_count: 380,
    book_genre: "Science Fiction",
    publisher: "Wydawnictwo Literackie",
  },
  {
    id: 12,
    book_title: "Folwark zwierzęcy",
    book_description: "Alegoryczna opowieść o rewolucji zwierząt na farmie.",
    author_id: 4,
    publication_year: 1945,
    isbn: "978-83-240-5679-6",
    page_count: 120,
    book_genre: "Alegoria",
    publisher: "Muza",
  },
];
