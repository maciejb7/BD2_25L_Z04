import {
  DataType,
  Table,
  Model,
  Column,
  HasMany,
  PrimaryKey,
  HasOne,
} from "sequelize-typescript";
import { Session } from "./session";
import { UserMatchPreference } from "./user_match_preference";
import { UserLike } from "./user_like";
import { UserLocation } from "./user_location";
import { Answer } from "./answer";

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
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    validate: {
      len: [3, 20],
    },
  })
  declare nickname: string;

  @Column({
    type: DataType.STRING,
    validate: {
      len: [2, 20],
    },
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    validate: {
      len: [2, 50],
    },
  })
  declare surname: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
  })
  declare password: string;

  @Column({
    type: DataType.ENUM(...Object.values(Gender)),
  })
  declare gender: Gender;

  @Column({
    type: DataType.DATE,
  })
  declare birthDate: Date;

  @Column({
    type: DataType.ENUM(...Object.values(Role)),
    defaultValue: Role.USER,
  })
  declare role: Role;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;

  @HasMany(() => Session, {
    onDelete: "CASCADE",
    foreignKey: "userId",
  })
  declare sessions: Session[];

  @HasMany(() => UserMatchPreference)
  declare matchPreferences: UserMatchPreference[];

  @HasMany(() => UserLike, { foreignKey: "likerId" })
  declare givenLikes: UserLike[];

  @HasMany(() => UserLike, { foreignKey: "likeeId" })
  declare receivedLikes: UserLike[];

  @HasOne(() => UserLocation, { foreignKey: "user_id" })
  declare location: UserLocation;

  @HasMany(() => Answer, {
    onDelete: "CASCADE",
    foreignKey: "userId",
  })
  declare answers: Answer[];

  public toJSON(): object {
    const userData = this.get({ plain: true });

    //delete userData.userId;
    delete userData.password;
    delete userData.sessions;
    delete userData.isActive;
    delete userData.matchPreferences;
    delete userData.givenLikes;
    delete userData.receivedLikes;
    delete userData.location;
    delete userData.answers;

    return userData;
  }
}
