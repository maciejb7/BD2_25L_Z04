import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  PrimaryKey,
} from "sequelize-typescript";
import { User } from "./user";

@Table({
  tableName: "sessions",
})
export class Session extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare sessionId: string;

  @Column({
    type: DataType.STRING,
  })
  declare refreshToken: string;

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
