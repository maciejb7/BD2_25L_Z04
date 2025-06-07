import { DataType, Table, Model, Column, HasMany } from "sequelize-typescript";
import { Answer } from "./answer";

@Table({
  tableName: "questions",
})
export class Question extends Model {
  @Column({
    primaryKey: true,
    type: DataType.STRING,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare content: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare display_order: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare is_active: boolean;

  @HasMany(() => Answer, {
    onDelete: "CASCADE",
    foreignKey: "questionId",
  })
  declare answers: Answer[];
}

// Initial questions data for seeding
export const questionsData = [
  {
    id: "q1",
    content: "Jak spędzasz wolny czas?",
    display_order: 1,
    is_active: true,
  },
  {
    id: "q2",
    content: "Ulubiona pora dnia?",
    display_order: 2,
    is_active: true,
  },
  {
    id: "q3",
    content: "Jakie masz hobby?",
    display_order: 3,
    is_active: true,
  },
  {
    id: "q4",
    content: "Ulubiony rodzaj filmu?",
    display_order: 4,
    is_active: true,
  },
  {
    id: "q5",
    content: "Jakie masz ulubione jedzenie?",
    display_order: 5,
    is_active: true,
  },
];
