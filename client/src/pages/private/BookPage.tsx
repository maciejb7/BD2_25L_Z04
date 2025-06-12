import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";
import { useState, useEffect, useRef } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { getUser } from "../../utils/userAuthentication";
import {
  getBooks,
  getBookAuthors,
  getBookGenres,
  getUserBooks,
  addUserBook,
  updateUserBook,
  removeUserBook,
  Book,
  BookAuthor,
  UserBook,
  BooksFilter
} from "../../api/api.books";

function BooksPage() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [allAuthors, setAllAuthors] = useState<BookAuthor[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedAuthor, setSelectedAuthor] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [actionsInProgress, setActionsInProgress] = useState<{ [key: number]: boolean }>({});
  const { showAlert } = useAlert();
  const initializationRef = useRef(false);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeData = async () => {
      try {
        setIsLoading(true);
        const user = await getUser();
        if (!user) throw new Error("Nie udało się pobrać ID użytkownika");

        const [booksRes, authorsRes, genresRes] = await Promise.all([
          getBooks(),
          getBookAuthors(),
          getBookGenres(),
        ]);

        let userBooksRes: UserBook[] = [];
        try {
          console.log("Próba pobrania książek użytkownika...");
          const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
          console.log("Token dostępny:", !!token);

          if (!token) {
            console.warn("Brak tokenu autoryzacyjnego - użytkownik nie jest zalogowany");
            throw new Error("Brak autoryzacji - zaloguj się ponownie");
          }

          userBooksRes = await getUserBooks();
          console.log("Pomyślnie pobrano książki użytkownika:", userBooksRes);
        } catch (userBookError: any) {
          console.error("Błąd podczas pobierania książek użytkownika:", userBookError);

          if (userBookError.response?.status === 401) {
            showAlert("Sesja wygasła. Zaloguj się ponownie.", "error");
          } else {
            showAlert("Nie udało się pobrać Twoich książek, ale możesz przeglądać dostępne opcje.", "info");
          }
        }

        if (!booksRes?.length) throw new Error("Brak dostępnych książek");
        if (!authorsRes?.length) throw new Error("Brak autorów książek");
        if (!genresRes?.length) throw new Error("Brak gatunków książek");

        setAllBooks(booksRes);
        setAllAuthors(authorsRes);
        setAllGenres(genresRes);
        setUserBooks(userBooksRes || []);

        const storedGenre = localStorage.getItem("selectedBookGenre");
        if (storedGenre) {
          setSelectedGenre(storedGenre);
          const booksByGenre = booksRes.filter(book => book.book_genre === storedGenre);
          setSelectedBooks(booksByGenre);
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
    const newGenre = e.target.value;
    localStorage.setItem("selectedBookGenre", newGenre);

    setSelectedGenre(newGenre);
    setSelectedAuthor(null);

    const booksByGenre = allBooks.filter(book => book.book_genre === newGenre);
    setSelectedBooks(booksByGenre);
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAuthorId = Number(e.target.value);
    setSelectedAuthor(newAuthorId);
    setSelectedGenre("");

    const booksByAuthor = allBooks.filter(book => book.book_author_id === newAuthorId);
    setSelectedBooks(booksByAuthor);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      showAlert("Wprowadź tytuł książki do wyszukania", "info");
      return;
    }

    const filteredBooks = allBooks.filter(book =>
      book.book_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.author_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSelectedBooks(filteredBooks);
    setSelectedGenre("");
    setSelectedAuthor(null);
  };

  const renderStars = (rating: number, interactive = false, bookId?: number) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <span
          key={i}
          className={`${i <= rating ? "text-yellow-400" : "text-gray-300"} ${interactive ? "cursor-pointer hover:text-yellow-500 text-lg" : ""}`}
          onClick={interactive && bookId ? () => handleRateBook(bookId, i) : undefined}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const handleRateBook = async (bookId: number, rating: number) => {
    try {
      setActionsInProgress(prev => ({ ...prev, [bookId]: true }));

      const existingUserBook = userBooks.find(ub => ub.book_id === bookId);

      if (existingUserBook) {
        await updateUserBook(bookId, { rating });
      } else {
        await addUserBook({ bookId, rating, reading_status: "to_read" });
      }

      const updatedUserBooks = await getUserBooks();
      setUserBooks(updatedUserBooks);

      showAlert(`Książka została oceniona na ${rating}/10!`, "success");
    } catch (error: any) {
      console.error("Błąd podczas oceniania książki:", error);
      showAlert("Wystąpił błąd podczas oceniania książki. Spróbuj ponownie.", "error");
    } finally {
      setActionsInProgress(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const handleToggleFavorite = async (bookId: number) => {
    try {
      setActionsInProgress(prev => ({ ...prev, [bookId]: true }));

      const existingUserBook = userBooks.find(ub => ub.book_id === bookId);

      if (existingUserBook) {
        await updateUserBook(bookId, { is_favorite: !existingUserBook.is_favorite });
      } else {
        await addUserBook({ bookId, is_favorite: true, reading_status: "to_read" });
      }

      const updatedUserBooks = await getUserBooks();
      setUserBooks(updatedUserBooks);

      showAlert(
        existingUserBook?.is_favorite ? "Książka usunięta z ulubionych!" : "Książka dodana do ulubionych!",
        "success"
      );
    } catch (error: any) {
      console.error("Błąd podczas zmiany statusu ulubionego:", error);
      showAlert("Wystąpił błąd. Spróbuj ponownie.", "error");
    } finally {
      setActionsInProgress(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const handleStatusChange = async (bookId: number, status: string) => {
    try {
      setActionsInProgress(prev => ({ ...prev, [bookId]: true }));

      const existingUserBook = userBooks.find(ub => ub.book_id === bookId);

      if (existingUserBook) {
        await updateUserBook(bookId, { reading_status: status as any });
      } else {
        await addUserBook({ bookId, reading_status: status as any });
      }

      const updatedUserBooks = await getUserBooks();
      setUserBooks(updatedUserBooks);

      showAlert("Status czytania został zaktualizowany!", "success");
    } catch (error: any) {
      console.error("Błąd podczas zmiany statusu:", error);
      showAlert("Wystąpił błąd podczas zmiany statusu. Spróbuj ponownie.", "error");
    } finally {
      setActionsInProgress(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const handleRemoveBook = async (bookId: number) => {
    try {
      setActionsInProgress(prev => ({ ...prev, [bookId]: true }));

      await removeUserBook(bookId);

      const updatedUserBooks = await getUserBooks();
      setUserBooks(updatedUserBooks);

      showAlert("Książka została usunięta z Twojej biblioteki!", "success");
    } catch (error: any) {
      console.error("Błąd podczas usuwania książki:", error);
      showAlert("Wystąpił błąd podczas usuwania książki. Spróbuj ponownie.", "error");
    } finally {
      setActionsInProgress(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const getUserBookData = (bookId: number) => {
    return userBooks.find(ub => ub.book_id === bookId);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "to_read": return "Do przeczytania";
      case "reading": return "Czytam";
      case "finished": return "Przeczytane";
      case "abandoned": return "Porzucone";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "to_read": return "bg-blue-100 text-blue-800";
      case "reading": return "bg-yellow-100 text-yellow-800";
      case "finished": return "bg-green-100 text-green-800";
      case "abandoned": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
          <SideBar options={getSideBarOptions("Books")} />
          <main className="flex-1 px-4 py-6 ml-12 sm:ml-16 max-w-none">
            <div className="space-y-10 pb-10">
              <h2 className="flex flex-row items-center justify-start gap-4 text-2xl font-bold text-gray-800 mb-6">
                <i className="fas fa-book"></i>Twoje Książki
              </h2>
              <hr className="my-6" />

              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Twoja biblioteka</h2>

                {userBooks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {userBooks.map((userBook) => (
                      <div
                        key={userBook.id}
                        className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-4 border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {userBook.book.book_title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userBook.reading_status)}`}>
                              {getStatusLabel(userBook.reading_status)}
                            </span>
                            {userBook.is_favorite && (
                              <span className="text-red-500">❤️</span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">Autor: {userBook.book.author.author_name}</p>
                        {userBook.book.book_description && (
                          <p className="text-gray-600 text-sm mb-2">{userBook.book.book_description}</p>
                        )}
                        {userBook.book.publication_year && (
                          <p className="text-gray-500 text-xs mb-2">Rok wydania: {userBook.book.publication_year}</p>
                        )}
                        {userBook.book.book_genre && (
                          <p className="text-gray-500 text-xs mb-3">Gatunek: {userBook.book.book_genre}</p>
                        )}
                        {userBook.rating && (
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-medium text-gray-700">Ocena:</span>
                              <div className="flex">{renderStars(userBook.rating)}</div>
                            </div>
                            <span className="text-sm font-bold text-blue-600">{userBook.rating}/10</span>
                          </div>
                        )}
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleFavorite(userBook.book_id)}
                              disabled={actionsInProgress[userBook.book_id]}
                              className={`flex-1 px-3 py-1 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed ${userBook.is_favorite
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                              {actionsInProgress[userBook.book_id] ? "..." : (userBook.is_favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych")}
                            </button>
                            <button
                              onClick={() => handleRemoveBook(userBook.book_id)}
                              disabled={actionsInProgress[userBook.book_id]}
                              className="flex-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionsInProgress[userBook.book_id] ? "Usuwanie..." : "Usuń książkę"}
                            </button>
                          </div>
                          <select
                            value={userBook.reading_status}
                            onChange={(e) => handleStatusChange(userBook.book_id, e.target.value)}
                            disabled={actionsInProgress[userBook.book_id]}
                            className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200 disabled:opacity-50"
                          >
                            <option value="to_read">Do przeczytania</option>
                            <option value="reading">Czytam</option>
                            <option value="finished">Przeczytane</option>
                            <option value="abandoned">Porzucone</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-8 text-center mb-8">
                    <p className="text-gray-600 text-lg">
                      Nie masz jeszcze żadnych książek w swojej bibliotece.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Wybierz gatunek, autora lub wyszukaj książki poniżej, aby dodać je do swojej biblioteki.
                    </p>
                  </div>
                )}
              </div>

              <hr className="border-gray-300 max-w-4xl mx-auto" />

              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Przeglądaj książki</h2>

                <div className="flex flex-col items-center space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-3xl">
                    <div className="flex-1">
                      <label htmlFor="genre-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Wybierz gatunek
                      </label>
                      <select
                        id="genre-select"
                        value={selectedGenre}
                        onChange={handleGenreChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
                      >
                        <option value="">-- Wybierz gatunek --</option>
                        {allGenres.map((genre) => (
                          <option key={genre} value={genre}>
                            {genre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label htmlFor="author-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Wybierz autora
                      </label>
                      <select
                        id="author-select"
                        value={selectedAuthor ?? ""}
                        onChange={handleAuthorChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
                      >
                        <option value="">-- Wybierz autora --</option>
                        {allAuthors.map((author) => (
                          <option key={author.id} value={author.id}>
                            {author.author_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
                        Wyszukaj książkę
                      </label>
                      <div className="flex">
                        <input
                          id="search-input"
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Tytuł lub autor..."
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

                  {(selectedGenre || selectedAuthor || searchTerm) && (
                    <div className="text-md font-semibold text-gray-800">
                      {searchTerm && `Wyniki wyszukiwania dla: "${searchTerm}"`}
                      {selectedGenre && !searchTerm && `Wybrany gatunek: ${selectedGenre}`}
                      {selectedAuthor && !searchTerm && `Wybrany autor: ${allAuthors.find(a => a.id === selectedAuthor)?.author_name}`}
                    </div>
                  )}

                  {selectedBooks.length > 0 && (
                    <div className="mt-4 w-full max-w-3xl">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Znalezione książki:
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedBooks.map((book) => {
                          const userBookData = getUserBookData(book.id);
                          return (
                            <div
                              key={book.id}
                              className="bg-white bg-opacity-60 backdrop-blur-sm rounded-lg p-4 border border-gray-200"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-800">{book.book_title}</h4>
                                <div className="flex items-center space-x-2">
                                  {book.publication_year && (
                                    <span className="text-xs text-gray-500">({book.publication_year})</span>
                                  )}
                                  {userBookData?.is_favorite && (
                                    <span className="text-red-500">❤️</span>
                                  )}
                                  {userBookData && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userBookData.reading_status)}`}>
                                      {getStatusLabel(userBookData.reading_status)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mb-2">Autor: {book.author.author_name}</p>
                              {book.book_description && (
                                <p className="text-gray-600 text-sm mb-2">{book.book_description}</p>
                              )}
                              {book.book_genre && (
                                <p className="text-gray-500 text-xs mb-2">Gatunek: {book.book_genre}</p>
                              )}
                              {book.book_pages && (
                                <p className="text-gray-500 text-xs mb-3">Strony: {book.book_pages}</p>
                              )}

                              <div className="border-t pt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    {userBookData?.rating ? "Twoja ocena:" : "Oceń tę książkę:"}
                                  </span>
                                  {userBookData?.rating && (
                                    <span className="text-sm font-bold text-blue-600">{userBookData.rating}/10</span>
                                  )}
                                </div>

                                <div className="flex items-center justify-center space-x-1 mb-2">
                                  {renderStars(userBookData?.rating || 0, true, book.id)}
                                </div>

                                <div className="flex flex-col space-y-2 mt-2">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleToggleFavorite(book.id)}
                                      disabled={actionsInProgress[book.id]}
                                      className={`flex-1 px-3 py-1 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed ${userBookData?.is_favorite
                                        ? "bg-red-500 text-white hover:bg-red-600"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                    >
                                      {actionsInProgress[book.id] ? "..." : (userBookData?.is_favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych")}
                                    </button>

                                    {userBookData && (
                                      <button
                                        onClick={() => handleRemoveBook(book.id)}
                                        disabled={actionsInProgress[book.id]}
                                        className="flex-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {actionsInProgress[book.id] ? "Usuwanie..." : "Usuń z biblioteki"}
                                      </button>
                                    )}
                                  </div>

                                  <select
                                    value={userBookData?.reading_status || "to_read"}
                                    onChange={(e) => handleStatusChange(book.id, e.target.value)}
                                    disabled={actionsInProgress[book.id]}
                                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200 disabled:opacity-50"
                                  >
                                    <option value="to_read">Do przeczytania</option>
                                    <option value="reading">Czytam</option>
                                    <option value="finished">Przeczytane</option>
                                    <option value="abandoned">Porzucone</option>
                                  </select>
                                </div>

                                {actionsInProgress[book.id] && (
                                  <div className="text-center text-sm text-gray-500 mt-2">
                                    Przetwarzanie...
                                  </div>
                                )}

                                <div className="text-xs text-gray-500 mt-2 text-center">
                                  Kliknij na gwiazdkę, aby ocenić (1-10)
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedBooks.length === 0 && (selectedGenre || selectedAuthor || searchTerm) && (
                    <div className="text-center text-gray-500 mt-4">
                      Nie znaleziono książek dla wybranych kryteriów.
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

export default BooksPage;