import { DataType, Table, Model, Column, HasMany } from "sequelize-typescript";
import { UserMatchPreference } from "./user-match-preference";

@Table({
  tableName: "match_types",
})
export class MatchType extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare match_type_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare match_type_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare match_type_description: string;

  @HasMany(() => UserMatchPreference)
  declare userMatchPreferences: UserMatchPreference[];
}
