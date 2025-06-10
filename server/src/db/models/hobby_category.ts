import { DataType, Table, Model, Column, HasMany } from "sequelize-typescript";
import { Hobby } from "./hobby";

@Table({
  tableName: "hobby_categories",
})
export class HobbyCategory extends Model {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare hobby_category_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare hobby_category_description: string;

  @HasMany(() => Hobby)
  declare hobbies: Hobby[];
}

// Initial hobby categories
export const hobbyCategories = [
  {
    id: 1,
    hobby_category_name: "Sport",
    hobby_category_description: "Aktywność fizyczna, rywalizacja, zdrowie.",
  },
  {
    id: 2,
    hobby_category_name: "Książki",
    hobby_category_description: "Czytanie, literatura, rozwój osobisty.",
  },
  {
    id: 3,
    hobby_category_name: "Gry",
    hobby_category_description: "Rozrywka, strategia, współpraca.",
  },
  {
    id: 4,
    hobby_category_name: "Podróże",
    hobby_category_description: "Odkrywanie nowych miejsc, kultura, przygoda.",
  },
  {
    id: 5,
    hobby_category_name: "Muzyka",
    hobby_category_description: "Słuchanie, tworzenie, emocje.",
  },
  {
    id: 6,
    hobby_category_name: "Nauka",
    hobby_category_description: "Badania, eksperymenty, odkrycia.",
  },
];
