DB_USER="$1"
DB_NAME="$2"
DB_PASSWORD="$3"
SQL_FILENAME="$4"

DB_CONTAINER="clingclang-db"
SQL_FILE="./sql/$SQL_FILENAME"

if [ -z "$DB_USER" ] || [ -z "$DB_NAME" ] || [ -z "$DB_PASSWORD" ] || [ -z "$SQL_FILENAME" ]; then
  echo "❌ Użycie: ./run-sql.sh <DB_USER> <DB_NAME> <DB_PASSWORD> <SQL_FILENAME>"
  exit 1
fi

if [ ! -f "$SQL_FILE" ]; then
  echo "❌ Plik SQL nie istnieje: $SQL_FILE"
  exit 1
fi

echo "🔄 Kopiuję $SQL_FILE do kontenera $DB_CONTAINER jako /$SQL_FILENAME..."
docker cp "$SQL_FILE" "$DB_CONTAINER:/$SQL_FILENAME"

echo "🚀 Wykonuję plik jako $DB_USER na bazie $DB_NAME..."
docker exec -e PGPASSWORD="$DB_PASSWORD" -i "$DB_CONTAINER" \
  psql -U "$DB_USER" -d "$DB_NAME" -f "/$SQL_FILENAME"

echo "🧹 Usuwam plik /$SQL_FILENAME z kontenera..."
docker exec "$DB_CONTAINER" rm "/$SQL_FILENAME"

echo "✅ Gotowe."
