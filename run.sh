if [ "$1" != "test" ]; then
    docker compose -f docker-compose.yml up
    echo "✅ Gotowe. Uruchomiono aplikację."
else
    docker compose -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from test-server
    echo "✅ Gotowe. Uruchomiono testy do aplikacji."
fi