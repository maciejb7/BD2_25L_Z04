@echo off
set DB_USER=%1
set DB_NAME=%2
set DB_PASSWORD=%3
set SQL_FILENAME=%4

set DB_CONTAINER=clingclang-db
set SQL_FILE=.\sql\%SQL_FILENAME%

if "%DB_USER%"=="" goto usage
if "%DB_NAME%"=="" goto usage
if "%DB_PASSWORD%"=="" goto usage
if "%SQL_FILENAME%"=="" goto usage
goto check_file

:usage
echo Uzycie: run-sql.bat ^<DB_USER^> ^<DB_NAME^> ^<DB_PASSWORD^> ^<SQL_FILENAME^>
exit /b 1

:check_file
if not exist "%SQL_FILE%" (
    echo ❌ Plik SQL nie istnieje: %SQL_FILE%
    exit /b 1
)

echo Kopiuje %SQL_FILE% do kontenera %DB_CONTAINER% jako /%SQL_FILENAME%...
docker cp "%SQL_FILE%" "%DB_CONTAINER%:/%SQL_FILENAME%"

echo Wykonuje plik jako %DB_USER% na bazie %DB_NAME%...
docker exec -e PGPASSWORD="%DB_PASSWORD%" -i "%DB_CONTAINER%" psql -U "%DB_USER%" -d "%DB_NAME%" -f "/%SQL_FILENAME%"

echo Usuwam plik /%SQL_FILENAME% z kontenera...
docker exec "%DB_CONTAINER%" rm "/%SQL_FILENAME%"

echo Gotowe.