import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
} from "sequelize-typescript";
import { User } from "./user";

@Table({
  tableName: "sessions",
})
export class Session extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare sessionId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare refreshToken: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare expiresAt: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;
}
