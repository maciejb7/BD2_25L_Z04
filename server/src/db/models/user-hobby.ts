import {
  DataType,
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user";
import { Hobby } from "./hobby";

@Table({
  tableName: "user_hobbies",
  indexes: [
    {
      unique: true,
      fields: ["user_id", "hobby_id"],
    },
  ],
})
export class UserHobby extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "user_id",
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Hobby)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "hobby_id",
  })
  declare hobbyId: number;

  @BelongsTo(() => Hobby)
  declare hobby: Hobby;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  })
  declare rating: number;
}
