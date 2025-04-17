
## Jak odpalić serwer w trybie developerskim?

1. Instalujemy Node.js i NPM (o ile nie są zainstalowane).
```bash
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
7. Odpowiednio wypełniamy pola w pliku .env.

8. Uruchamiamy aplikację poprzez komendę:
```bash
docker compose up
```

Aplikacja jest uruchomiona i logger powinien wyświetlić wiadomość o połączeniu z bazą danych i uruchomieniu serwera.

Nie ma potrzeby wyłączania serwera i ponownego jego uruchamiania podczas edycji kodu, gdyż przy każdym zapisie pliku jest automatycznie restartowany.
