export interface CommonResponse {
    message: string;
}

export interface ErrorResponse {
    message: string;
}

export interface User {
    userId: string;
    nickname: string;
    name: string;
    surname: string;
    email: string;
    gender: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}