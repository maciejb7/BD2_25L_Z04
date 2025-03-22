import { DataType, Table, Model, Column, HasMany } from "sequelize-typescript";
import { RefreshToken } from "./refresh-token";

export enum Gender {
  M = "male",
  F = "female",
}

export enum Role {
  ADMIN = "admin",
  USER = "user",
}

@Table({
  tableName: "users",
})
export class User extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20],
    },
  })
  declare nickname: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      len: [2, 20],
    },
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      len: [2, 50],
    },
  })
  declare surname: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.ENUM(...Object.values(Gender)),
    allowNull: false,
  })
  declare gender: Gender;

  @Column({
    type: DataType.ENUM(...Object.values(Role)),
    allowNull: false,
    defaultValue: Role.USER,
  })
  declare role: Role;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isActive: boolean;

  @HasMany(() => RefreshToken)
  declare refreshTokens: RefreshToken[];
}
