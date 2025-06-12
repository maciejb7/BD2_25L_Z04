import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";
import { useState, useEffect, useRef } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { getUserFromAPI } from "../../api/api.user";
import {
  searchTracks,
  getTrackDetails,
  getUserFavoriteTracks,
  addFavoriteTrack,
  removeFavoriteTrack,
  DeezerTrack,
  TrackDetails,
  UserFavoriteTrack
} from "../../api/api.music";

function MusicPage() {
  const [searchResults, setSearchResults] = useState<DeezerTrack[]>([]);
  const [userFavoriteTracks, setUserFavoriteTracks] = useState<UserFavoriteTrack[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string>("");
  const [actionsInProgress, setActionsInProgress] = useState<{ [key: number]: boolean }>({});
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const { showAlert } = useAlert();
  const initializationRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeData = async () => {
      try {
        setIsLoading(true);
        const user = await getUserFromAPI();
        if (!user) throw new Error("Nie udało się pobrać ID użytkownika");

        let userFavorites: UserFavoriteTrack[] = [];
        try {
          console.log("Próba pobrania ulubionych utworów użytkownika...");
          const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
          console.log("Token dostępny:", !!token);

          if (!token) {
            console.warn("Brak tokenu autoryzacyjnego - użytkownik nie jest zalogowany");
            throw new Error("Brak autoryzacji - zaloguj się ponownie");
          }

          userFavorites = await getUserFavoriteTracks();
          console.log("Pomyślnie pobrano ulubione utwory użytkownika:", userFavorites);
        } catch (userMusicError: any) {
          console.error("Błąd podczas pobierania ulubionych utworów:", userMusicError);

          if (userMusicError.response?.status === 401) {
            showAlert("Sesja wygasła. Zaloguj się ponownie.", "error");
          } else {
            showAlert("Nie udało się pobrać Twoich ulubionych utworów, ale możesz wyszukiwać muzykę.", "info");
          }
        }

        setUserFavoriteTracks(userFavorites || []);
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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      showAlert("Wprowadź nazwę utworu, artysty lub albumu do wyszukania", "info");
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchTracks(searchTerm);
      setSearchResults(results);

      if (results.length === 0) {
        showAlert("Nie znaleziono utworów dla tego wyszukiwania.", "info");
      }
    } catch (error: any) {
      console.error("Błąd podczas wyszukiwania:", error);
      showAlert("Wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToFavorites = async (trackId: number) => {
    try {
      setActionsInProgress(prev => ({ ...prev, [trackId]: true }));

      await addFavoriteTrack(trackId);

      // Refresh favorites list
      const updatedFavorites = await getUserFavoriteTracks();
      setUserFavoriteTracks(updatedFavorites);

      showAlert("Utwór został dodany do ulubionych!", "success");
    } catch (error: any) {
      console.error("Błąd podczas dodawania do ulubionych:", error);
      showAlert("Wystąpił błąd podczas dodawania utworu do ulubionych. Spróbuj ponownie.", "error");
    } finally {
      setActionsInProgress(prev => ({ ...prev, [trackId]: false }));
    }
  };

  const handleRemoveFromFavorites = async (trackId: number) => {
    try {
      setActionsInProgress(prev => ({ ...prev, [trackId]: true }));

      await removeFavoriteTrack(trackId);

      // Refresh favorites list
      const updatedFavorites = await getUserFavoriteTracks();
      setUserFavoriteTracks(updatedFavorites);

      showAlert("Utwór został usunięty z ulubionych!", "success");
    } catch (error: any) {
      console.error("Błąd podczas usuwania z ulubionych:", error);
      showAlert("Wystąpił błąd podczas usuwania utworu z ulubionych. Spróbuj ponownie.", "error");
    } finally {
      setActionsInProgress(prev => ({ ...prev, [trackId]: false }));
    }
  };

  const isTrackInFavorites = (trackId: number) => {
    return userFavoriteTracks.some(fav => fav.track.music_track_id === trackId);
  };

  const handlePlayPreview = (trackId: number, previewUrl?: string) => {
    if (!previewUrl) {
      showAlert("Podgląd nie jest dostępny dla tego utworu.", "info");
      return;
    }

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If clicking the same track that's currently playing, stop it
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
      return;
    }

    // Play new audio
    const audio = new Audio(previewUrl);
    audioRef.current = audio;
    setCurrentlyPlaying(trackId);

    audio.addEventListener('ended', () => {
      setCurrentlyPlaying(null);
      audioRef.current = null;
    });

    audio.addEventListener('error', () => {
      showAlert("Nie udało się odtworzyć podglądu utworu.", "error");
      setCurrentlyPlaying(null);
      audioRef.current = null;
    });

    audio.play().catch(() => {
      showAlert("Nie udało się odtworzyć podglądu utworu.", "error");
      setCurrentlyPlaying(null);
      audioRef.current = null;
    });
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

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
          <SideBar options={getSideBarOptions("Music")} />
          <main className="flex-1 px-4 py-6 ml-12 sm:ml-16 max-w-none">
            <div className="space-y-10 pb-10">
              <h2 className="flex flex-row items-center justify-start gap-4 text-2xl font-bold text-gray-800 mb-6">
                <i className="fas fa-music"></i>Twoja Muzyka
              </h2>
              <hr className="my-6" />

              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Twoje ulubione utwory</h2>

                {userFavoriteTracks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {userFavoriteTracks.map((favorite, index) => (
                      <div
                        key={`${favorite.track.music_track_id}-${index}`}
                        className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-4 border border-gray-200"
                      >
                        <div className="flex items-start space-x-3">
                          {/* Album Cover */}
                          <div className="flex-shrink-0">
                            <img
                              src={favorite.album.music_album_cover_small || '/placeholder-album.png'}
                              alt={`${favorite.album.music_album_title} cover`}
                              className="w-16 h-16 rounded-lg object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-album.png';
                              }}
                            />
                          </div>

                          {/* Track Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-800 truncate">
                              {favorite.track.music_track_title}
                            </h3>
                            <p className="text-gray-600 text-sm truncate">
                              {favorite.artist.music_artist_name}
                            </p>
                            <p className="text-gray-500 text-xs truncate">
                              {favorite.album.music_album_title}
                            </p>
                            {favorite.album.music_album_release_date && (
                              <p className="text-gray-400 text-xs">
                                {new Date(favorite.album.music_album_release_date).getFullYear()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 mt-4">
                          {favorite.track.music_track_preview_link && (
                            <button
                              onClick={() => handlePlayPreview(favorite.track.music_track_id, favorite.track.music_track_preview_link)}
                              className={`flex-1 px-3 py-2 text-sm rounded flex items-center justify-center space-x-1 ${currentlyPlaying === favorite.track.music_track_id
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-green-500 text-white hover:bg-green-600"
                                }`}
                            >
                              <i className={`fas ${currentlyPlaying === favorite.track.music_track_id ? 'fa-stop' : 'fa-play'}`}></i>
                              <span>{currentlyPlaying === favorite.track.music_track_id ? 'Stop' : 'Podgląd'}</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleRemoveFromFavorites(favorite.track.music_track_id)}
                            disabled={actionsInProgress[favorite.track.music_track_id]}
                            className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                          >
                            <i className="fas fa-heart-broken"></i>
                            <span>
                              {actionsInProgress[favorite.track.music_track_id] ? "Usuwanie..." : "Usuń z ulubionych"}
                            </span>
                          </button>

                          {favorite.track.music_track_deezer_link && (
                            <a
                              href={favorite.track.music_track_deezer_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 flex items-center justify-center space-x-1"
                            >
                              <i className="fab fa-deezer"></i>
                              <span>Deezer</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-8 text-center mb-8">
                    <i className="fas fa-music text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600 text-lg">
                      Nie masz jeszcze żadnych ulubionych utworów.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Wyszukaj utwory poniżej i dodaj je do swoich ulubionych.
                    </p>
                  </div>
                )}
              </div>

              <hr className="border-gray-300 max-w-4xl mx-auto" />

              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Wyszukaj utwory</h2>

                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full max-w-2xl">
                    <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
                      Wyszukaj utwory
                    </label>
                    <div className="flex">
                      <input
                        id="search-input"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Wprowadź nazwę utworu, artysty lub albumu..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        disabled={isSearching}
                      />
                      <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isSearching ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Szukam...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-search"></i>
                            <span>Szukaj</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-6 w-full max-w-4xl">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                        Znalezione utwory ({searchResults.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {searchResults.map((track) => (
                          <div
                            key={track.id}
                            className="bg-white bg-opacity-60 backdrop-blur-sm rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-start space-x-4">
                              {/* Album Cover */}
                              <div className="flex-shrink-0">
                                <img
                                  src={track.album.cover_small || '/placeholder-album.png'}
                                  alt={`${track.album.title} cover`}
                                  className="w-20 h-20 rounded-lg object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-album.png';
                                  }}
                                />
                              </div>

                              {/* Track Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-semibold text-gray-800 text-lg">{track.title}</h4>
                                  {isTrackInFavorites(track.id) && (
                                    <span className="text-red-500 text-xl">❤️</span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-base font-medium">{track.artist.name}</p>
                                <p className="text-gray-500 text-sm">{track.album.title}</p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2 mt-4">
                              {track.preview && (
                                <button
                                  onClick={() => handlePlayPreview(track.id, track.preview)}
                                  className={`flex-1 px-3 py-2 text-sm rounded flex items-center justify-center space-x-1 ${currentlyPlaying === track.id
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-green-500 text-white hover:bg-green-600"
                                    }`}
                                >
                                  <i className={`fas ${currentlyPlaying === track.id ? 'fa-stop' : 'fa-play'}`}></i>
                                  <span>{currentlyPlaying === track.id ? 'Stop' : 'Podgląd'}</span>
                                </button>
                              )}

                              <button
                                onClick={() => isTrackInFavorites(track.id)
                                  ? handleRemoveFromFavorites(track.id)
                                  : handleAddToFavorites(track.id)
                                }
                                disabled={actionsInProgress[track.id]}
                                className={`flex-1 px-3 py-2 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 ${isTrackInFavorites(track.id)
                                  ? "bg-red-500 text-white hover:bg-red-600"
                                  : "bg-pink-500 text-white hover:bg-pink-600"
                                  }`}
                              >
                                <i className={`fas ${isTrackInFavorites(track.id) ? 'fa-heart-broken' : 'fa-heart'}`}></i>
                                <span>
                                  {actionsInProgress[track.id]
                                    ? "..."
                                    : (isTrackInFavorites(track.id) ? "Usuń z ulubionych" : "Dodaj do ulubionych")
                                  }
                                </span>
                              </button>

                              <a
                                href={track.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 flex items-center justify-center space-x-1"
                              >
                                <i className="fab fa-deezer"></i>
                                <span>Otwórz w Deezer</span>
                              </a>
                            </div>

                            {actionsInProgress[track.id] && (
                              <div className="text-center text-sm text-gray-500 mt-2">
                                Przetwarzanie...
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.length === 0 && searchTerm && !isSearching && (
                    <div className="text-center text-gray-500 mt-4">
                      <i className="fas fa-search text-3xl text-gray-400 mb-2"></i>
                      <p>Nie znaleziono utworów dla "{searchTerm}".</p>
                      <p className="text-sm mt-1">Spróbuj użyć innych słów kluczowych.</p>
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

export default MusicPage;