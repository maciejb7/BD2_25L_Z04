-- Makes an admin account with nickname 'Admin' and password 'Haslo123@'.
INSERT INTO users ("userId", "nickname", "name", "surname", "email", "password", "gender", "birthDate", "role", "isActive", "createdAt", "updatedAt")
VALUES 
('123e4567-e89b-12d3-a456-426614174000', 'Admin', 'Jan', 'Kowalski', 'admin@gmail.com', '$2b$10$CW3Re3vR8.4PX.cd07/c8Ob9Hj0sDe8v3DhNA88nNQa.D5Shq0Sj.', 'male', '1980-01-01', 'admin', true, NOW(), NOW());
