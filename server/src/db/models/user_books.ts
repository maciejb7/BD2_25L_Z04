import {
  DataType,
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user";
import { Book } from "./book";

@Table({
  tableName: "user_books",
})
export class UserBook extends Model {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Book)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare book_id: number;

  @BelongsTo(() => Book)
  declare book: Book;

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

  @Column({
    type: DataType.ENUM,
    values: ["to_read", "reading", "finished", "abandoned"],
    allowNull: false,
    defaultValue: "to_read",
  })
  declare reading_status: "to_read" | "reading" | "finished" | "abandoned";

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
    },
  })
  declare current_page: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare started_reading_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare finished_reading_at: Date;
}
