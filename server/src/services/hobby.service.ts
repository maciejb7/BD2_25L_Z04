import { hobbyCategories } from "../db/models/hobbyCategory";
import { hobbys } from "../db/models/hobby";

export function getHobbyByCatygory(categoryID: number) {
  return hobbys.filter((a) => a.hobby_category_id === categoryID);
}

export function getHobbyByID(ID: number) {
  return hobbys.filter((a) => a.id === ID);
}

export function getCatigoryByID(ID: number) {
  return hobbyCategories.filter((a) => a.id === ID);
}

export function getAllHobbys() {
  return hobbys;
}

export function getAllCategories() {
  return hobbyCategories;
}
