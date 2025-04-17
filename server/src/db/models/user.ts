import { DataType, Table, Model, Column, HasMany } from "sequelize-typescript";
import { Session } from "./session";
import { UserMatchPreference } from "./user_match_preference";
import { UserLike } from "./user_like";

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
    type: DataType.DATEONLY,
    allowNull: true,
  })
  declare birthdate: Date;

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

  public toJSON(): object {
    const userData = this.get({ plain: true });

    delete userData.password;
    delete userData.sessions;
    delete userData.isActive;

    // Calculate age if birthdate exists
    if (userData.birthdate) {
      const birthDate = new Date(userData.birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      userData.age = age;
    }

    return userData;
  }
}
