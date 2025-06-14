import {
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { User } from "./user";

@Table({
  tableName: "account_bans",
})
export class AccountBan extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare banId: string;

  @Column({
    type: DataType.STRING,
  })
  declare reason: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
  })
  declare givenAt: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    unique: true,
  })
  declare givenTo: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  declare givenBy: string;
}
