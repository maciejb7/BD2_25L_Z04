import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";
import { useState, useEffect, useRef } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { getUserFromAPI } from "../../api/api.user";
import {
  getMovies,
  getMovieGenres,
  getUserMovies,
  addUserMovie,
  updateUserMovie,
  removeUserMovie,
  Movie,
  MovieGenre,
  UserMovie
} from "../../api/api.movies";

function MediaPage() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [allGenres, setAllGenres] = useState<MovieGenre[]>([]);
  const [userMovies, setUserMovies] = useState<UserMovie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedGenreName, setSelectedGenreName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [ratingsInProgress, setRatingsInProgress] = useState<{ [key: number]: boolean }>({});
  const { showAlert } = useAlert();
  const initializationRef = useRef(false);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeData = async () => {
      try {
        setIsLoading(true);
        const user = await getUserFromAPI();
        if (!user) throw new Error("Nie udało się pobrać ID użytkownika");

        const [moviesRes, genresRes] = await Promise.all([
          getMovies(),
          getMovieGenres(),
        ]);

        let userMoviesRes: UserMovie[] = [];
        try {
          console.log("Próba pobrania filmów użytkownika...");
          const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
          console.log("Token dostępny:", !!token);

          if (!token) {
            console.warn("Brak tokenu autoryzacyjnego - użytkownik nie jest zalogowany");
            throw new Error("Brak autoryzacji - zaloguj się ponownie");
          }

          userMoviesRes = await getUserMovies();
          console.log("Pomyślnie pobrano filmy użytkownika:", userMoviesRes);
        } catch (userMovieError: any) {
          console.error("Błąd podczas pobierania filmów użytkownika:", userMovieError);

          if (userMovieError.response?.status === 401) {
            showAlert("Sesja wygasła. Zaloguj się ponownie.", "error");
          } else {
            showAlert("Nie udało się pobrać Twoich filmów, ale możesz przeglądać dostępne opcje.", "info");
          }
        }

        if (!moviesRes?.length) throw new Error("Brak dostępnych filmów");
        if (!genresRes?.length) throw new Error("Brak gatunków filmów");

        setAllMovies(moviesRes);
        setAllGenres(genresRes);
        setUserMovies(userMoviesRes || []);

        const storedGenreId = localStorage.getItem("selectedMovieGenre");
        if (storedGenreId) {
          const genreId = parseInt(storedGenreId);
          setSelectedGenre(genreId);
          const genre = genresRes.find(g => g.id === genreId);
          if (genre) setSelectedGenreName(genre.movie_genre_name);

          const moviesByGenre = moviesRes.filter(movie => movie.movie_genre_id === genreId);
          setSelectedMovies(moviesByGenre);
        }
      } catch (err: any) {
        console.error("Błąd podczas inicjalizacji:", err);
        setError("Wystąpił problem z pobieraniem danych.");
        showAlert(`Błąd: ${err.message}`, "error");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [showAlert]);

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGenreId = Number(e.target.value);
    localStorage.setItem("selectedMovieGenre", newGenreId.toString());

    setSelectedGenre(newGenreId);
    const genre = allGenres.find(g => g.id === newGenreId);
    if (genre) setSelectedGenreName(genre.movie_genre_name);

    const moviesByGenre = allMovies.filter(movie => movie.movie_genre_id === newGenreId);
    setSelectedMovies(moviesByGenre);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      showAlert("Wprowadź tytuł filmu do wyszukania", "info");
      return;
    }

    const filteredMovies = allMovies.filter(movie =>
      movie.movie_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSelectedMovies(filteredMovies);
    setSelectedGenre(null);
    setSelectedGenreName(`Wyniki wyszukiwania dla: "${searchTerm}"`);
  };

  const renderStars = (rating: number, interactive = false, movieId?: number) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <span
          key={i}
          className={`${i <= rating ? "text-yellow-400" : "text-gray-300"} ${interactive ? "cursor-pointer hover:text-yellow-500 text-lg" : "text-lg"}`}
          onClick={interactive && movieId ? () => handleRateMovie(movieId, i) : undefined}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const handleRateMovie = async (movieId: number, rating: number) => {
    try {
      setRatingsInProgress(prev => ({ ...prev, [movieId]: true }));

      const existingUserMovie = userMovies.find(um => um.movie_id === movieId);

      let updatedUserMovie;
      if (existingUserMovie) {
        await updateUserMovie(movieId, { rating });
        // Aktualizuj lokalnie istniejący film
        updatedUserMovie = { ...existingUserMovie, rating };
      } else {
        const newUserMovie = await addUserMovie({ movieId, rating });
        updatedUserMovie = newUserMovie;
      }

      setUserMovies(prevUserMovies => {
        if (existingUserMovie) {
          return prevUserMovies.map(um =>
            um.movie_id === movieId
              ? { ...um, rating }
              : um
          );
        } else {
          return [...prevUserMovies, updatedUserMovie];
        }
      });

      showAlert(`Film został oceniony na ${rating}/10!`, "success");
    } catch (error: any) {
      console.error("Błąd podczas oceniania filmu:", error);

      const errorMessage = error?.response?.data?.message || error?.message || "Nieznany błąd";
      showAlert(`Wystąpił błąd podczas oceniania filmu: ${errorMessage}`, "error");

      try {
        const refreshedUserMovies = await getUserMovies();
        setUserMovies(refreshedUserMovies);
      } catch (refreshError) {
        console.error("Błąd podczas odświeżania danych:", refreshError);
      }
    } finally {
      setRatingsInProgress(prev => ({ ...prev, [movieId]: false }));
    }
  };

  const handleRemoveMovie = async (movieId: number) => {
    try {
      // Debug: sprawdź co zostało przekazane
      console.log("handleRemoveMovie wywołane z movieId:", movieId, "typ:", typeof movieId);

      // Dodaj walidację movieId
      if (!movieId || isNaN(movieId) || movieId <= 0) {
        console.error("Błędny movieId:", movieId);
        showAlert("Nieprawidłowy identyfikator filmu", "error");
        return;
      }

      setRatingsInProgress(prev => ({ ...prev, [movieId]: true }));

      console.log(`Próba usunięcia filmu o ID: ${movieId}`); // Debug log

      await removeUserMovie(movieId);

      // POPRAWKA: Aktualizuj stan lokalnie - usuń film z listy (używaj !== zamiast ===)
      setUserMovies(prevUserMovies =>
        prevUserMovies.filter(um => um.movie_id !== movieId)  // Zmienione z === na !==
      );

      showAlert("Film został usunięty z Twojej listy!", "success");
    } catch (error: any) {
      console.error("Błąd podczas usuwania filmu:", error);

      const errorMessage = error?.response?.data?.message || error?.message || "Nieznany błąd";
      showAlert(`Wystąpił błąd podczas usuwania filmu: ${errorMessage}`, "error");

      // Odśwież dane w przypadku błędu
      try {
        const refreshedUserMovies = await getUserMovies();
        setUserMovies(refreshedUserMovies);
      } catch (refreshError) {
        console.error("Błąd podczas odświeżania danych:", refreshError);
      }
    } finally {
      const refreshedMovies = await getUserMovies();
      setUserMovies(refreshedMovies);
      setRatingsInProgress(prev => ({ ...prev, [movieId]: false }));
    }
  };
  const handleToggleFavorite = async (movieId: number) => {
    try {
      // Dodaj walidację movieId
      if (!movieId || isNaN(movieId) || movieId <= 0) {
        showAlert(`Nieprawidłowy identyfikator film${movieId}`, "error");
        return;
      }

      setRatingsInProgress(prev => ({ ...prev, [movieId]: true }));

      const existingUserMovie = userMovies.find(um => um.movie.id === movieId);
      const newFavoriteStatus = existingUserMovie ? !existingUserMovie.is_favorite : true;

      console.log(`Zmiana statusu ulubionego dla filmu ID: ${movieId}`);

      if (existingUserMovie) {
        await updateUserMovie(movieId, { is_favorite: newFavoriteStatus });
      } else {
        await addUserMovie({ movieId, is_favorite: true });
      }

      setUserMovies(prevUserMovies => {
        if (existingUserMovie) {
          return prevUserMovies.map(um =>
            um.movie_id === movieId
              ? { ...um, is_favorite: newFavoriteStatus }
              : um
          );
        } else {
          // Znajdź film w allMovies i utwórz nowy UserMovie
          const movie = allMovies.find(m => m.id === movieId);
          if (movie) {
            // Odśwież dane z serwera zamiast tworzyć tymczasowy obiekt
            getUserMovies().then(refreshedUserMovies => {
              setUserMovies(refreshedUserMovies);
            }).catch(console.error);

            return prevUserMovies; // Zwróć obecny stan, odświeżenie nastąpi asynchronicznie
          }
          return prevUserMovies;
        }
      });

      showAlert(
        newFavoriteStatus ? "Film dodany do ulubionych!" : "Film usunięty z ulubionych!",
        "success"
      );
    } catch (error: any) {
      console.error("Błąd podczas zmiany statusu ulubionego:", error);

      const errorMessage = error?.response?.data?.message || error?.message || "Nieznany błąd";
      showAlert(`Wystąpił błąd: ${errorMessage}`, "error");

      try {
        const refreshedUserMovies = await getUserMovies();
        setUserMovies(refreshedUserMovies);
      } catch (refreshError) {
        console.error("Błąd podczas odświeżania danych:", refreshError);
      }
    } finally {
      setRatingsInProgress(prev => ({ ...prev, [movieId]: false }));
    }
  };
  const getUserMovieData = (movieId: number) => {
    return userMovies.find(um => um.movie_id === movieId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Background blur="lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ładowanie danych...</p>
          </div>
        </Background>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Background blur="lg">
        <div className="flex min-h-screen">
          <SideBar options={getSideBarOptions("Movies")} />
          <main className="flex-1 px-4 py-6 ml-12 sm:ml-16 max-w-none">
            <div className="space-y-10 pb-10">
              <h2 className="flex flex-row items-center justify-start gap-4 text-2xl font-bold text-gray-800 mb-6">
                <i className="fas fa-film"></i>Twoje Filmy
              </h2>
              <hr className="my-6" />

              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Twoje filmy</h2>

                {userMovies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {userMovies.map((userMovie) => (
                      <div
                        key={userMovie.id}
                        className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-4 border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {userMovie.movie.movie_name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {userMovie.movie.genre.movie_genre_name}
                            </span>
                            {userMovie.is_favorite && (
                              <div className="flex items-center space-x-1">
                                <span className="text-red-500 text-lg">❤️</span>
                                <span className="text-xs text-red-600 font-medium">Ulubiony</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{userMovie.movie.movie_description}</p>
                        {userMovie.movie.movie_release_year && (
                          <p className="text-gray-500 text-xs mb-2">Rok: {userMovie.movie.movie_release_year}</p>
                        )}
                        {userMovie.movie.movie_director && (
                          <p className="text-gray-500 text-xs mb-3">Reżyser: {userMovie.movie.movie_director}</p>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Status:</span>
                          <div className="flex items-center space-x-2">
                            {userMovie.is_favorite ? (
                              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                                ❤️ W ulubionych
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                                Na liście
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRemoveMovie(userMovie.movie.id)}
                            disabled={ratingsInProgress[userMovie.movie_id]}
                            className="flex-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {ratingsInProgress[userMovie.movie_id] ? "Usuwanie..." : "Usuń film"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-8 text-center mb-8">
                    <p className="text-gray-600 text-lg">
                      Nie masz jeszcze żadnych filmów na swojej liście.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Wybierz gatunek lub wyszukaj filmy poniżej, aby dodać je do swojej listy.
                    </p>
                  </div>
                )}
              </div>

              <hr className="border-gray-300 max-w-4xl mx-auto" />

              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Przeglądaj filmy</h2>

                <div className="flex flex-col items-center space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
                    <div className="flex-1">
                      <label htmlFor="genre-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Wybierz gatunek
                      </label>
                      <select
                        id="genre-select"
                        value={selectedGenre ?? ""}
                        onChange={handleGenreChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
                      >
                        <option value="" disabled>
                          -- Wybierz gatunek --
                        </option>
                        {allGenres.map((genre) => (
                          <option key={genre.id} value={genre.id}>
                            {genre.movie_genre_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
                        Wyszukaj film
                      </label>
                      <div className="flex">
                        <input
                          id="search-input"
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Wprowadź tytuł filmu..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                          onClick={handleSearch}
                          className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
                        >
                          Szukaj
                        </button>
                      </div>
                    </div>
                  </div>

                  {selectedGenreName && (
                    <div className="text-md font-semibold text-gray-800">
                      {selectedGenreName.includes("Wyniki") ? selectedGenreName : (
                        <>Wybrany gatunek: <span className="text-blue-600">{selectedGenreName}</span></>
                      )}
                    </div>
                  )}

                  {selectedMovies.length > 0 && (
                    <div className="mt-4 w-full max-w-2xl">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {selectedGenreName?.includes("Wyniki") ? "Znalezione filmy:" : "Filmy w tym gatunku:"}
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedMovies.map((movie) => {
                          const userMovieData = getUserMovieData(movie.id);
                          return (
                            <div
                              key={movie.id}
                              className="bg-white bg-opacity-60 backdrop-blur-sm rounded-lg p-4 border border-gray-200"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-800">{movie.movie_name}</h4>
                                <div className="flex items-center space-x-2">
                                  {movie.movie_release_year && (
                                    <span className="text-xs text-gray-500">({movie.movie_release_year})</span>
                                  )}
                                  {userMovieData?.is_favorite && (
                                    <div className="flex items-center space-x-1">
                                      <span className="text-red-500">❤️</span>
                                      <span className="text-xs text-red-600 font-medium">Ulubiony</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mb-2">{movie.movie_description}</p>
                              {movie.movie_director && (
                                <p className="text-gray-500 text-xs mb-2">Reżyser: {movie.movie_director}</p>
                              )}
                              {movie.movie_duration && (
                                <p className="text-gray-500 text-xs mb-3">Czas trwania: {movie.movie_duration} min</p>
                              )}

                              <div className="border-t pt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    {userMovieData?.rating ? "Twoja ocena:" : "Oceń ten film:"}
                                  </span>
                                  {userMovieData?.rating && (
                                    <span className="text-sm font-bold text-blue-600">{userMovieData.rating}/10</span>
                                  )}
                                </div>

                                <div className="flex space-x-2 mt-2">
                                  <button
                                    onClick={() => handleToggleFavorite(movie.id)}
                                    disabled={ratingsInProgress[movie.id]}
                                    className={`flex-1 px-3 py-1 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed ${userMovieData?.is_favorite
                                      ? "bg-red-500 text-white hover:bg-red-600"
                                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                      }`}
                                  >
                                    {ratingsInProgress[movie.id] ? "..." : (userMovieData?.is_favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych")}
                                  </button>

                                  {userMovieData && (
                                    <button
                                      onClick={() => handleRemoveMovie(movie.id)}
                                      disabled={ratingsInProgress[movie.id]}
                                      className="flex-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {ratingsInProgress[movie.id] ? "Usuwanie..." : "Usuń z listy"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedMovies.length === 0 && (selectedGenre || searchTerm) && (
                    <div className="text-center text-gray-500 mt-4">
                      {searchTerm ? "Nie znaleziono filmów dla tego wyszukiwania." : "Brak filmów w tym gatunku."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </Background>
    </div>
  );
}

export default MediaPage;