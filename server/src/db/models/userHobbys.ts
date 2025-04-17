export type UserHobby = {
  userId: number;
  hobbyId: number;
  rating: number; // 1-10
};

export const userHobbys: UserHobby[] = []; // tymczasowe "pseudo-db"
