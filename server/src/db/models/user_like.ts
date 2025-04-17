import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user";

export enum LikeStatus {
  LIKE = "like",
  DISLIKE = "dislike",
}

@Table({
  tableName: "user_likes",
  indexes: [
    {
      unique: true,
      fields: ["liker_id", "likee_id"],
    },
  ],
})
export class UserLike extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare likeId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "liker_id",
  })
  declare likerId: string;

  @BelongsTo(() => User, "liker_id")
  declare liker: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "likee_id",
  })
  declare likeeId: string;

  @BelongsTo(() => User, "likee_id")
  declare likee: User;

  @Column({
    type: DataType.ENUM(...Object.values(LikeStatus)),
    allowNull: false,
  })
  declare status: LikeStatus;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare updatedAt: Date;
}
