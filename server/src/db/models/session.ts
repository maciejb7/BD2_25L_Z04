import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  PrimaryKey,
  CreatedAt,
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

  @CreatedAt
  @Column({
    type: DataType.DATE,
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
  })
  declare expiresAt: Date;

  @Column({
    type: DataType.INET,
    allowNull: true,
  })
  declare ipAddress: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare deviceInfo: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  declare userId: string;

  public toJSON(): object {
    const sessionData = this.get({ plain: true });

    delete sessionData.refreshToken;

    return sessionData;
  }
}
