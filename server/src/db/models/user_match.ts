import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user";

@Table({
  tableName: "user_matches",
  indexes: [
    {
      unique: true,
      fields: ["user1_id", "user2_id"],
    },
  ],
})
export class UserMatch extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare matchId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "user1_id",
  })
  declare user1Id: string;

  @BelongsTo(() => User, "user1_id")
  declare user1: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "user2_id",
  })
  declare user2Id: string;

  @BelongsTo(() => User, "user2_id")
  declare user2: User;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isActive: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare matchedAt: Date;
}
