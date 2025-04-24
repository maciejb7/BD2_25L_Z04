import { DataType, Table, Model, Column, HasMany, HasOne } from "sequelize-typescript";
import { Session } from "./session";
import { UserMatchPreference } from "./user_match_preference";
import { UserLike } from "./user_like";
import { UserLocation } from "./user_location";

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
    type: DataType.DATE,
    allowNull: false,
  })
  declare birthDate: Date;

  @Column({
    type: DataType.ENUM(...Object.values(Role)),
    allowNull: false,
    defaultValue: Role.USER,
  })
  declare role: Role;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;

  @HasMany(() => Session)
  declare sessions: Session[];

  @HasMany(() => UserMatchPreference)
  declare matchPreferences: UserMatchPreference[];

  @HasMany(() => UserLike, { foreignKey: "likerId" })
  declare givenLikes: UserLike[];

  @HasMany(() => UserLike, { foreignKey: "likeeId" })
  declare receivedLikes: UserLike[];

  @HasOne(() => UserLocation, { foreignKey: "user_id" })
  declare location: UserLocation;

  public toJSON(): object {
    const userData = this.get({ plain: true });

    delete userData.password;
    delete userData.sessions;
    delete userData.isActive;
    delete userData.matchPreferences;
    delete userData.givenLikes;
    delete userData.receivedLikes;

    return userData;
  }
}
