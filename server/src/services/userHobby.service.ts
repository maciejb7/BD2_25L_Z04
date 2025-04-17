import { userHobbys, UserHobby } from "../db/models/userHobbys";
import { hobbys } from "../db/models/hobby";

export function getUserByHobby(hobbyID: number) {
  return userHobbys.filter((a) => a.hobbyId === hobbyID);
}

export function getHobbyByUser(userID: number) {
  return userHobbys.filter((a) => a.userId === userID);
}

export function getAll() {
  return userHobbys;
}

export function getUserHobbyInformation(userID: number) {
  const hobbysList: UserHobby[] = userHobbys.filter((a) => a.userId === userID);
  const hobbyNumbers: number[] = hobbysList.map((a) => a.hobbyId);
  const hobbyList = hobbys.filter((a) => hobbyNumbers.includes(a.id));
  return hobbyList;
}

export function addUserHobby(userID: number, hobbyID: number, rating: number) {
  const newUserHobby: UserHobby = {
    userId: userID,
    hobbyId: hobbyID,
    rating: rating,
  };
  userHobbys.push(newUserHobby);
}
