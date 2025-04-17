import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user";
import { MatchType } from "./match_type";

@Table({
  tableName: "user_match_preferences",
})
export class UserMatchPreference extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare user_match_preference_id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => MatchType)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare match_type_id: string;

  @BelongsTo(() => MatchType)
  declare matchType: MatchType;
}
