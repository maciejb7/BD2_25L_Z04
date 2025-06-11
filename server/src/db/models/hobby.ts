import {
  DataType,
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { HobbyCategory } from "./hobby_category";
import { UserHobby } from "./user_hobby";

@Table({
  tableName: "hobbies",
})
export class Hobby extends Model {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare hobby_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare hobby_description: string;

  @ForeignKey(() => HobbyCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "hobby_category_id",
  })
  declare hobby_category_id: number;

  @BelongsTo(() => HobbyCategory)
  declare category: HobbyCategory;

  @HasMany(() => UserHobby)
  declare userHobbies: UserHobby[];
}

// Initial hobbies
export const hobbies = [
  {
    id: 1,
    hobby_category_id: 1,
    hobby_name: "Piłka nożna",
    hobby_description: "Piłka jest jedna a bramki są dwie.",
  },
  {
    id: 2,
    hobby_category_id: 1,
    hobby_name: "Koszykówka",
    hobby_description: "Piłka jest jedna a kosze są dwa.",
  },
  {
    id: 3,
    hobby_category_id: 1,
    hobby_name: "Siatkówka",
    hobby_description: "Piłka jest jedna a siatka też jest jedna.",
  },
  {
    id: 4,
    hobby_category_id: 2,
    hobby_name: "Kryminały",
    hobby_description: "Dla lubiących zagadki i tajemnice.",
  },
  {
    id: 5,
    hobby_category_id: 2,
    hobby_name: "Romanse",
    hobby_description: "Dla romantyków i marzycieli.",
  },
  {
    id: 6,
    hobby_category_id: 3,
    hobby_name: "Gry planszowe",
    hobby_description: "Dla miłośników strategii i rywalizacji.",
  },
  {
    id: 7,
    hobby_category_id: 3,
    hobby_name: "Gry FPS",
    hobby_description: "Dla fanów szybkiej akcji i strzelania.",
  },
  {
    id: 8,
    hobby_category_id: 4,
    hobby_name: "Zwiedzanie muzeów",
    hobby_description: "Dla miłośników sztuki i historii.",
  },
  {
    id: 9,
    hobby_category_id: 4,
    hobby_name: "Wędrówki piesze",
    hobby_description: "Dla miłośników natury i przygód.",
  },
  {
    id: 10,
    hobby_category_id: 5,
    hobby_name: "Słuchanie muzyki",
    hobby_description: "Dla miłośników dźwięków.",
  },
  {
    id: 11,
    hobby_category_id: 5,
    hobby_name: "Tworzenie muzyki",
    hobby_description: "Dla kreatywnych dusz.",
  },
  {
    id: 12,
    hobby_category_id: 6,
    hobby_name: "Fizyka",
    hobby_description: "Dla miłośników nauk ścisłych.",
  },
  {
    id: 13,
    hobby_category_id: 6,
    hobby_name: "Biologia",
    hobby_description: "Dla miłośników życia.",
  },
];
