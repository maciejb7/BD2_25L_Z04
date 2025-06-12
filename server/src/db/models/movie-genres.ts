import { DataType, Table, Model, Column, HasMany } from "sequelize-typescript";
import { Movie } from "./movies";

@Table({
  tableName: "movie_genres",
})
export class MovieGenre extends Model {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare movie_genre_name: string;

  @HasMany(() => Movie)
  declare movies: Movie[];
}

// Initial movie genres
export const movieGenres = [
  {
    id: 1,
    movie_genre_name: "Akcja",
  },
  {
    id: 2,
    movie_genre_name: "Komedia",
  },
  {
    id: 3,
    movie_genre_name: "Dramat",
  },
  {
    id: 4,
    movie_genre_name: "Horror",
  },
  {
    id: 5,
    movie_genre_name: "Sci-Fi",
  },
  {
    id: 6,
    movie_genre_name: "Romantyczny",
  },
  {
    id: 7,
    movie_genre_name: "Dokumentalny",
  },
  {
    id: 8,
    movie_genre_name: "Animowany",
  },
  {
    id: 9,
    movie_genre_name: "Fantasy",
  },
  {
    id: 10,
    movie_genre_name: "Thriller",
  },
];
