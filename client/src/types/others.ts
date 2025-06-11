/* eslint-disable prettier/prettier */
export interface User {
  userId: string;
  nickname: string;
  name: string;
  surname: string;
  email: string;
  gender: string;
  role: string;
  birthDate: string;
  createdAt: string;
}

export interface UserWithSessions extends User {
  lastIp: string | null;
  lastDevice: string | null;
  lastLogin: string | null;
  sessions: UserSession[];
}

export interface UserSession {
  sessionId: string;
  ipAddress: string | null;
  deviceInfo: string | null;
  createdAt: string;
}
