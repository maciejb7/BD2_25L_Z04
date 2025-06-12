import {
  Table,
  Model,
  PrimaryKey,
  Column,
  DataType,
  ForeignKey,
} from "sequelize-typescript";
import { User } from "./user";

@Table({
  tableName: "password_reset_links",
})
export class PasswordResetLink extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare linkId: string;

  @Column({
    type: DataType.DATE,
  })
  declare expiresAt: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  declare userId: string;
}
