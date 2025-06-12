import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";
import { useState, useEffect, useRef } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { getUser } from "../../utils/userAuthentication";
import {
  getBooks,
  getUserBooks,
  addUserBook,
  updateUserBook,
  removeUserBook,
  getBookAuthors,
  getBookGenres,
  getUserReadingStats,
  Book,
  UserBook,
  BookAuthor,
  BooksFilter,
  AddUserBookData,
  UpdateUserBookData,
  ReadingStats
} from "../../api/api.books";

function BooksPage() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<BookAuthor[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [readingStats, setReadingStats] = useState<ReadingStats | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGenreName, setSelectedGenreName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [operationsInProgress, setOperationsInProgress] = useState<{ [key: number]: boolean }>({});
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [selectedBookToAdd, setSelectedBookToAdd] = useState<Book | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUserBook, setSelectedUserBook] = useState<UserBook | null>(null);
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

        // Pobieranie książek użytkownika i statystyk osobno
        let userBooksRes: UserBook[] = [];
        let statsRes: ReadingStats | null = null;
        try {
          console.log("Próba pobrania książek użytkownika...");

          const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
          console.log("Token dostępny:", !!token);

          if (!token) {
            console.warn("Brak tokenu autoryzacyjnego - użytkownik nie jest zalogowany");
            throw new Error("Brak autoryzacji - zaloguj się ponownie");
          }

          [userBooksRes, statsRes] = await Promise.all([
            getUserBooks(),
            getUserReadingStats()
          ]);
          console.log("Pomyślnie pobrano książki użytkownika:", userBooksRes);
        } catch (userBooksError: any) {
          console.error("Błąd podczas pobierania książek użytkownika:", userBooksError);

          if (userBooksError.response?.status === 401) {
            showAlert("Sesja wygasła. Zaloguj się ponownie.", "error");
          } else {
            showAlert("Nie udało się pobrać Twojej biblioteki, ale możesz przeglądać dostępne książki.", "info");
          }
        }

        if (!booksRes?.length) throw new Error("Brak dostępnych książek");
        if (!authorsRes?.length) throw new Error("Brak autorów");
        if (!genresRes?.length) throw new Error("Brak gatunków");

        setAllBooks(booksRes);
        setFilteredBooks(booksRes);
        setAuthors(authorsRes);
        setGenres(genresRes);
        setUserBooks(userBooksRes || []);
        setReadingStats(statsRes);

        const storedGenre = localStorage.getItem("selectedBookGenre");
        if (storedGenre) {
          setSelectedGenre(storedGenre);
          setSelectedGenreName(storedGenre);
          applyFilters(booksRes, storedGenre, selectedAuthor, searchQuery);
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

  const applyFilters = (books: Book[], genre: string, author: string, search: string) => {
    let filtered = books;

    if (genre) {
      filtered = filtered.filter(book => book.book_genre === genre);
    }

    if (author) {
      filtered = filtered.filter(book => book.author.author_name.toLowerCase().includes(author.toLowerCase()));
    }

    if (search) {
      filtered = filtered.filter(book =>
        book.book_title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.author_name.toLowerCase().includes(search.toLowerCase()) ||
        book.book_description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredBooks(filtered);
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGenre = e.target.value;
    setSelectedGenre(newGenre);
    setSelectedGenreName(newGenre || null);
    localStorage.setItem("selectedBookGenre", newGenre);
    applyFilters(allBooks, newGenre, selectedAuthor, searchQuery);
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAuthor = e.target.value;
    setSelectedAuthor(newAuthor);
    applyFilters(allBooks, selectedGenre, newAuthor, searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setSearchQuery(newSearch);
    applyFilters(allBooks, selectedGenre, selectedAuthor, newSearch);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`${i <= rating ? "text-yellow-400" : "text-gray-300"}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const getReadingStatusColor = (status: string) => {
    switch (status) {
      case "finished": return "bg-green-100 text-green-800";
      case "reading": return "bg-blue-100 text-blue-800";
      case "to_read": return "bg-yellow-100 text-yellow-800";
      case "abandoned": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getReadingStatusText = (status: string) => {
    switch (status) {
      case "finished": return "Przeczytane";
      case "reading": return "Czytam";
      case "to_read": return "Do przeczytania";
      case "abandoned": return "Porzucone";
      default: return status;
    }
  };

  const handleAddToLibrary = (book: Book) => {
    setSelectedBookToAdd(book);
    setShowAddBookModal(true);
  };

  const handleUpdateBook = (userBook: UserBook) => {
    setSelectedUserBook(userBook);
    setShowUpdateModal(true);
  };

  const handleRemoveFromLibrary = async (bookId: number) => {
    try {
      setOperationsInProgress(prev => ({ ...prev, [bookId]: true }));

      await removeUserBook(bookId);

      const updatedUserBooks = await getUserBooks();
      const updatedStats = await getUserReadingStats();
      setUserBooks(updatedUserBooks);
      setReadingStats(updatedStats);

      showAlert("Książka została usunięta z biblioteki!", "success");
    } catch (error: any) {
      console.error("Błąd podczas usuwania książki:", error);
      showAlert(`Wystąpił błąd podczas usuwania książki. Spróbuj ponownie.${error}, ${bookId}`, "error");
    } finally {
      setOperationsInProgress(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const isBookInLibrary = (bookId: number): boolean => {
    return userBooks.some(ub => ub.book_id === bookId);
  };

  const AddBookModal = () => {
    const [formData, setFormData] = useState<AddUserBookData>({
      bookId: selectedBookToAdd?.id || 0,
      reading_status: "to_read",
      is_favorite: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await addUserBook(formData);

        const updatedUserBooks = await getUserBooks();
        const updatedStats = await getUserReadingStats();
        setUserBooks(updatedUserBooks);
        setReadingStats(updatedStats);

        setShowAddBookModal(false);
        showAlert("Książka została dodana do biblioteki!", "success");
      } catch (error: any) {
        console.error("Błąd podczas dodawania książki:", error);
        showAlert("Wystąpił błąd podczas dodawania książki. Spróbuj ponownie.", "error");
      }
    };

    if (!showAddBookModal || !selectedBookToAdd) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold mb-4">Dodaj książkę do biblioteki</h3>
          <p className="text-gray-600 mb-4">"{selectedBookToAdd.book_title}" - {selectedBookToAdd.author.author_name}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status czytania
              </label>
              <select
                value={formData.reading_status}
                onChange={(e) => setFormData({ ...formData, reading_status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="to_read">Do przeczytania</option>
                <option value="reading">Czytam</option>
                <option value="finished">Przeczytane</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ocena (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.rating || ""}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_favorite"
                checked={formData.is_favorite}
                onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_favorite" className="text-sm font-medium text-gray-700">
                Dodaj do ulubionych
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notatki
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddBookModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Dodaj
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const UpdateBookModal = () => {
    const [formData, setFormData] = useState<UpdateUserBookData>({
      reading_status: selectedUserBook?.reading_status || "to_read",
      rating: selectedUserBook?.rating,
      is_favorite: selectedUserBook?.is_favorite || false,
      current_page: selectedUserBook?.current_page,
      notes: selectedUserBook?.notes || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedUserBook) return;

      try {
        await updateUserBook(selectedUserBook.book.id, formData);

        const updatedUserBooks = await getUserBooks();
        const updatedStats = await getUserReadingStats();
        setUserBooks(updatedUserBooks);
        setReadingStats(updatedStats);

        setShowUpdateModal(false);
        showAlert("Książka została zaktualizowana!", "success");
      } catch (error: any) {
        console.error("Błąd podczas aktualizacji książki:", error);
        showAlert(`Wystąpił błąd podczas aktualizacji książki. Spróbuj ponownie. ${error}`, "error");
      }
    };
    console.log("userBooks:", userBooks);
    if (!showUpdateModal || !selectedUserBook) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold mb-4">Edytuj książkę</h3>
          <p className="text-gray-600 mb-4">"{selectedUserBook.book.book_title}" - {selectedUserBook.book.author.author_name}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status czytania
              </label>
              <select
                value={formData.reading_status}
                onChange={(e) => setFormData({ ...formData, reading_status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="to_read">Do przeczytania</option>
                <option value="reading">Czytam</option>
                <option value="finished">Przeczytane</option>
                <option value="abandoned">Porzucone</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ocena (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.rating || ""}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aktualna strona
              </label>
              <input
                type="number"
                min="0"
                value={formData.current_page || ""}
                onChange={(e) => setFormData({ ...formData, current_page: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_favorite_update"
                checked={formData.is_favorite}
                onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_favorite_update" className="text-sm font-medium text-gray-700">
                Dodaj do ulubionych
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notatki
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Zapisz
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
          <SideBar options={getSideBarOptions("Książki")} />
          <main className="flex-1 px-4 py-6 ml-12 sm:ml-16 max-w-none">
            <div className="space-y-10 pb-10">
              <h2 className="flex flex-row items-center justify-start gap-4 text-2xl font-bold text-gray-800 mb-6">
                <i className="fas fa-book"></i>Twoja Biblioteka
              </h2>
              <hr className="my-6" />

              {/* Statystyki czytania */}
              {readingStats && (
                <div className="max-w-4xl mx-auto mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Statystyki czytania</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{readingStats.totalBooks}</div>
                      <div className="text-sm text-gray-600">Wszystkie</div>
                    </div>
                    <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{readingStats.finishedBooks}</div>
                      <div className="text-sm text-gray-600">Przeczytane</div>
                    </div>
                    <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{readingStats.currentlyReading}</div>
                      <div className="text-sm text-gray-600">Czytam</div>
                    </div>
                    <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">{readingStats.toRead}</div>
                      <div className="text-sm text-gray-600">Do przeczytania</div>
                    </div>
                    <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{readingStats.abandoned}</div>
                      <div className="text-sm text-gray-600">Porzucone</div>
                    </div>
                    <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{readingStats.averageRating.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Średnia ocena</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Książki użytkownika */}
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Twoje książki</h2>

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
                          {userBook.is_favorite && (
                            <span className="text-red-500 text-xl">♥</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{userBook.book.author.author_name}</p>
                        <p className="text-gray-600 text-sm mb-3">{userBook.book.book_description}</p>

                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReadingStatusColor(userBook.reading_status)}`}>
                            {getReadingStatusText(userBook.reading_status)}
                          </span>
                          {userBook.rating && (
                            <div className="flex items-center space-x-1">
                              <div className="flex">{renderStars(userBook.rating)}</div>
                              <span className="text-sm font-bold text-blue-600">{userBook.rating}/5</span>
                            </div>
                          )}
                        </div>

                        {userBook.current_page && userBook.book.book_pages && (
                          <div className="mb-2">
                            <div className="text-sm text-gray-600 mb-1">
                              Postęp: {userBook.current_page}/{userBook.book.book_pages} stron
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(userBook.current_page / userBook.book.book_pages) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {userBook.notes && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-700 italic">"{userBook.notes}"</p>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateBook(userBook)}
                            className="flex-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Edytuj
                          </button>
                          <button
                            onClick={() => handleRemoveFromLibrary(userBook.book.id)}
                            disabled={operationsInProgress[userBook.book_id]}
                            className="flex-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {operationsInProgress[userBook.book_id] ? "Usuwanie..." : "Usuń"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-8 text-center mb-8">
                    <p className="text-gray-600 text-lg">
                      Nie masz jeszcze żadnych książek w bibliotece.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Przeglądaj dostępne książki poniżej i dodaj je do swojej biblioteki.
                    </p>
                  </div>
                )}
              </div>

              <hr className="border-gray-300 max-w-6xl mx-auto" />

              {/* Przeglądanie książek */}
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Przeglądaj książki</h2>

                {/* Filtry */}
                <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wyszukiwanie
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Szukaj po tytule, autorze..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gatunek
                      </label>
                      <select
                        value={selectedGenre}
                        onChange={handleGenreChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Wszystkie gatunki</option>
                        {genres.map((genre) => (
                          <option key={genre} value={genre}>
                            {genre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Autor
                      </label>
                      <select
                        value={selectedAuthor}
                        onChange={handleAuthorChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Wszyscy autorzy</option>
                        {authors.map((author) => (
                          <option key={author.id} value={author.author_name}>
                            {author.author_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Lista książek do dodania */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBooks.length > 0 ? (
                    filteredBooks.map((book) => (
                      <div
                        key={book.id}
                        className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-4 border border-gray-200"
                      >
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{book.book_title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{book.author.author_name}</p>
                        <p className="text-gray-600 text-sm mb-3">{book.book_description}</p>
                        <div className="text-sm text-gray-500 mb-4">Liczba stron: {book.book_pages}</div>
                        <button
                          onClick={() => handleAddToLibrary(book)}
                          disabled={operationsInProgress[book.id]}
                          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {operationsInProgress[book.id] ? "Dodawanie..." : "Dodaj do biblioteki"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-600">
                      Brak książek spełniających kryteria wyszukiwania.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </Background>
      {showAddBookModal && <AddBookModal />}
      {showUpdateModal && <UpdateBookModal />}
    </div>
  );
}

export default BooksPage;
