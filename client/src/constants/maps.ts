import { getTwoWayMap } from "../utils/formatters";

export const genderMap = new Map<string, string>([
  ["female", "Kobieta"],
  ["male", "Mężczyzna"],
]);

export const roleMap = new Map<string, string>([
  ["user", "Użytkownik"],
  ["admin", "Administrator"],
]);

export const twoWayGenderMap = getTwoWayMap<string, string>(genderMap);
export const twoWayRoleMap = getTwoWayMap<string, string>(roleMap);
