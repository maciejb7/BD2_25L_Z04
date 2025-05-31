# **ClingClang**

University Project for BD2 subject (Bazy Danych 2) at Warsaw University of Technology.

Web application for looking friends.

## Table of Contents

- [About The Project](#about-the-project)
- [Authors](#authors)
- [Features](#features)
- [Technologies](#technologies)
- [Requirements](#requirements)
- [How To Run](#how-to-run)
- [Gallery](#gallery)

## About The Project

Looking for a friend or businness partner, however it's too hard?
Not anymore.

Cling clang - application which will help you achive your goal in the simplest way possible.

Project written in Polish language.

## Authors
- [Maciej Bogusławski](https://github.com/maciejb7)
- [Hubert Kaczyński](https://github.com/hkaczyns)
- [Amadeusz Lewandowski](https://github.com/alewand)
- [Bartosz Żelazko]()

## Features (work in progress)

- User authenticaction with JWT short-term access tokens and long-term refresh tokens.
- Server-side users actions logging.
- User registering and logging in.
- Changing your account details (nickname, email etc.).
- Basic actions you can do with your account (change password, log out, log out from all devices and delete account entirerly).
- Client-side alert system (alerts after successful and unsuccessful actions).
- Mobile devices adapting UI.
- Profile picture uploading and cropping.

## Technologies

### Client-Side:
- ![TypeScript](https://img.shields.io/badge/TYPESCRIPT-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
- ![React](https://img.shields.io/badge/REACT-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
- ![Axios](https://img.shields.io/badge/AXIOS-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
- ![Tailwind CSS](https://img.shields.io/badge/TAILWIND_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
- ![Vite](https://img.shields.io/badge/VITE-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### Server-Side:
- ![TypeScript](https://img.shields.io/badge/TYPESCRIPT-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
- ![Express.js](https://img.shields.io/badge/EXPRESS.js-000000?style=for-the-badge&logo=express&logoColor=white)
- ![Sequelize](https://img.shields.io/badge/SEQUELIZE-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)

### Database:
- ![PostgreSQL](https://img.shields.io/badge/POSTGRESQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

### Others:
- ![Docker](https://img.shields.io/badge/DOCKER-2496ED?style=for-the-badge&logo=docker&logoColor=white)

[⬆️ Go Back Up ⬆️](#table-of-contents)

## Requirements

Project is fully dockerized so the only requirements in order to run it is Docker, make sure you have it installed.

## How To Run

After cloning repository:

1. Copy .env.example file and fill it accordingly.
```bash
cp .env.example .env
``` 

2. Then, build and start the app by running the following command:
```bash
docker compose up
```
Alternatively you can use:
```bash
./launch.sh
```
If you want to launch tests:
```bash
./launch.sh test
```

3. Go on `http://localhost:5173/` in your browser and enjoy.

## Gallery

Some screenshots to present UI (work in progress).

**Main Page**

![Main Page](https://i.imgur.com/uNeVuBf.jpeg)

**Register Page**

![Register Page](https://i.imgur.com/Fig9adK.jpeg)


**Login Page**

![Login Page](https://i.imgur.com/KevISGr.jpeg)

**Dashboard Page**

![Dashboard Page](https://i.imgur.com/ct3XWEM.png)

**User Details Page**

![User Details Page](https://i.imgur.com/GZcoUem.png)

**Profile Picture Cropping**

![Profile Picture Cropping](https://i.imgur.com/GJYMB9z.png)

**User Details Page with Profile Picture**

![User Details Page with Profile Picture](https://i.imgur.com/d74bWgJ.png)

**Extended Sidebar**

![Extended Sidebar](https://i.imgur.com/nUFvSuL.png)