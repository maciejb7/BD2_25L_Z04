import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
} from "sequelize-typescript";
import { User } from "./user";

@Table({
  tableName: "refresh_tokens",
})
export class RefreshToken extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare refreshTokenId: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare tokenBody: string;

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
