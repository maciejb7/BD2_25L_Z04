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
    content: "Jaka jest twoja ulubiona pora dnia?",
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
    content: "Jaki masz ulubiony gatunek filmu?",
    display_order: 4,
    is_active: true,
  },
  {
    id: "q5",
    content: "Co lubisz jeść najbardziej?",
    display_order: 5,
    is_active: true,
  },
  {
    id: "q6",
    content: "Jaka jest twoja ulubiona pora roku?",
    display_order: 6,
    is_active: true,
  },
  {
    id: "q7",
    content: "Jaki jest twój ulubiony napój?",
    display_order: 7,
    is_active: true,
  },
  {
    id: "q8",
    content: "Jaki jest twój znak zodiaku?",
    display_order: 8,
    is_active: true,
  },
  {
    id: "q9",
    content: "Które zwierzę jest twoje ulubione?",
    display_order: 9,
    is_active: true,
  },
  {
    id: "q10",
    content: "Jaki jest twój ulubiony kolor?",
    display_order: 10,
    is_active: true,
  },
];
