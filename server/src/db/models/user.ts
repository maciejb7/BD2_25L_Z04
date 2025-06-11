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
import { UserMatchPreference } from "./user-match-preference";
import { UserLike } from "./user-like";
import { UserLocation } from "./user-location";
import { PasswordResetLink } from "./password-reset-link";
import { AccountActivationLink } from "./account-activation-link";
import { AccountBan } from "./account-ban";

export enum Gender {
  M = "male",
  F = "female",
}

export enum Role {
  ADMIN = "admin",
  USER = "user",
  BANNED = "banned",
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
    defaultValue: false,
  })
  declare isActive: boolean;

  @Column({
    type: DataType.INET,
    allowNull: true,
  })
  declare lastIp: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare lastDevice: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastLogin: Date | null;

  @HasMany(() => Session, {
    onDelete: "CASCADE",
    foreignKey: "userId",
  })
  declare sessions: Session[];

  @HasMany(() => PasswordResetLink, {
    foreignKey: "userId",
    onDelete: "CASCADE",
  })
  declare passwordResetLinks: PasswordResetLink[];

  @HasOne(() => AccountActivationLink, {
    foreignKey: "userId",
    onDelete: "CASCADE",
  })
  declare accountActivationLink: AccountActivationLink;

  @HasMany(() => AccountBan, {
    foreignKey: "givenBy",
    onDelete: "CASCADE",
  })
  declare accountBans: AccountBan[];

  @HasOne(() => AccountBan, {
    foreignKey: "givenTo",
    onDelete: "CASCADE",
  })
  declare accountBan: AccountBan;

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
    delete userData.accountActivationLink;
    delete userData.passwordResetLinks;
    delete userData.lastIp;
    delete userData.lastDevice;
    delete userData.lastLogin;
    delete userData.sessions;
    delete userData.isActive;
    delete userData.accountBans;
    delete userData.accountBan;
    delete userData.matchPreferences;
    delete userData.givenLikes;
    delete userData.receivedLikes;
    delete userData.location;

    return userData;
  }

  public toJSONAdmin(): object {
    const sessions =
      this.sessions?.map((session: Session) => session.toJSON()) ?? [];

    const userData = this.get({ plain: true });

    delete userData.password;
    delete userData.accountActivationLink;
    delete userData.passwordResetLinks;
    delete userData.isActive;
    delete userData.matchPreferences;
    delete userData.givenLikes;
    delete userData.receivedLikes;
    delete userData.location;

    userData.sessions = sessions;

    return userData;
  }
}
