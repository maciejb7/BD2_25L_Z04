import { hobby_categories } from "../db/models/hobby_category";
import { hobbys } from "../db/models/hobby";

export function getHobbyByCatygory(categoryID: number) {
  return hobbys.filter((a) => a.hobby_category_id === categoryID);
}

export function getHobbyByID(ID: number) {
  return hobbys.filter((a) => a.id === ID);
}

export function getCatigoryByID(ID: number) {
  return hobby_categories.filter((a) => a.id === ID);
}

export function getAllHobbys() {
  return hobbys;
}

export function getAllCategories() {
  return hobby_categories;
}
