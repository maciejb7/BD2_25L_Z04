import {
  DataType,
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { MovieGenre } from "./movie_genre";
import { UserMovie } from "./user_movie";

@Table({
  tableName: "movies",
})
export class Movie extends Model {
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
  declare movie_name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare movie_description: string;

  @ForeignKey(() => MovieGenre)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare movie_genre_id: number;

  @BelongsTo(() => MovieGenre)
  declare genre: MovieGenre;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare movie_release_year: number;

  @HasMany(() => UserMovie)
  declare users: UserMovie[];
}

// Initial movies
export const movies = [
  {
    id: 1,
    movie_name: "Inception",
    movie_description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
    movie_genre_id: 5,
    movie_release_year: 2010,
  },
  {
    id: 2,
    movie_name: "The Dark Knight",
    movie_description:
      "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.",
    movie_genre_id: 1,
    movie_release_year: 2008,
  },
  {
    id: 3,
    movie_name: "Interstellar",
    movie_description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    movie_genre_id: 5,
    movie_release_year: 2014,
  },
  {
    id: 4,
    movie_name: "The Matrix",
    movie_description:
      "A computer hacker learns about the true nature of his reality and his role in the war against its controllers.",
    movie_genre_id: 5,
    movie_release_year: 1999,
  },
  {
    id: 5,
    movie_name: "Pulp Fiction",
    movie_description:
      "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    movie_genre_id: 2,
    movie_release_year: 1994,
  },
  {
    id: 6,
    movie_name: "The Shawshank Redemption",
    movie_description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    movie_genre_id: 3,
    movie_release_year: 1994,
  },
  {
    id: 7,
    movie_name: "Forrest Gump",
    movie_description:
      "The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
    movie_genre_id: 3,
    movie_release_year: 1994,
  },
  {
    id: 8,
    movie_name: "Gladiator",
    movie_description:
      "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
    movie_genre_id: 1,
    movie_release_year: 2000,
  },
  {
    id: 9,
    movie_name: "The Godfather",
    movie_description:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    movie_genre_id: 3,
    movie_release_year: 1972,
  },
  {
    id: 10,
    movie_name: "The Lord of the Rings: The Fellowship of the Ring",
    movie_description:
      "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth.",
    movie_genre_id: 9,
    movie_release_year: 2001,
  },
];
