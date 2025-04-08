
## Jak odpalić serwer w trybie developerskim?

1. Instalujemy PostgreSQL, Node.js i NPM (o ile nie są zainstalowane).
```bash
sudo apt install postgresql
sudo apt install nodejs npm
```
2. Wchodzimy do folderu "server".
```bash
cd server
```
3. Instalujemy wszystkie potrzebne biblioteki.
```bash
npm install
```
4. Pobieramy wtyczkę [EsLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) do VSCode.
5. Wchodzimy do ustawień VSCode w wersji JSON (Ctrl+Shift+P -> Open User Settings (JSON)) i dodajemy podaną zawartość (o ile jej nie ma):
```json
    "eslint.validate": [
        "typescript"
    ],
    "[typescript]": {
        "editor.defaultFormatter": "dbaeumer.vscode-eslint",
        "editor.formatOnSave": true
    },
    "eslint.format.enable": true,
    "editor.formatOnSave": true
```
Od teraz po zapisaniu pliku kod będzie się sam formatował.
Konwencja nazewnictwa w TypeScript - camelCase.

6. Tworzymy plik .env i kopiujemy do niego zawartość z pliku [.env.example](server/.env.example).
```bash
cp .env.example .env
```
7. Wypełniamy wybrane pola w pliku .env w sposób następujący:
```env
SERVER_PORT=3000
LOGS_DB_CONSOLE=true
LOGS_WINSTON_CONSOLE=true
```
8. Uruchamiamy aplikację.
```bash
npm run dev
```
W tym momencie aplikacja się uruchomi i logger powinien wyświetlić error związany z połączeniem z bazą danych.

9. Uruchamiany PostgreSQL i tworzymy w nim bazę danych.
```bash
sudo -i -u postgres
createdb example_db
createuser -P example_user
psql
GRANT ALL PRIVILEGES ON DATABASE example_db TO example_user;
\c example_db
GRAND CREATE ON SCHEMA public TO example_user;
\q
logout
```
10. Wypełniamy pozostałe pola w pliku .env w sposób następujący:
```env
DB_NAME=example_db
DB_USER=example_user
DB_PASSWORD=example_pass
DB_HOST=127.0.0.1
```
11. Po raz kolejny uruchamiamy naszą aplikację.
```bash
npm run dev
```
Aplikacja jest uruchomiona i logger powinien wyświetlić wiadomość o połączeniu z bazą danych i uruchomieniu serwera.

Nie ma potrzeby wyłączania serwera i ponownego jego uruchamiania podczas edycji kodu, gdyż przy każdym zapisie pliku jest automatycznie restartowany.
