import {
  DataType,
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user";
import { Movie } from "./movies";

@Table({
  tableName: "user_movies",
})
export class UserMovie extends Model {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Movie)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare movie_id: number;

  @BelongsTo(() => Movie)
  declare movie: Movie;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5,
    },
  })
  declare rating: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare is_favorite: boolean;
}
