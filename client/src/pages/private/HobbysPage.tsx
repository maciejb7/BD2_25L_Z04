import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";
import { useState, useEffect, useRef } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { getUser } from "../../utils/userAuthentication";
import { getUserHobbies, get } from "../../api/api.hobbys";

interface Hobby {
  id: number;
  hobby_name: string;
  hobby_description: string;
  hobby_category_id: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  category: {
    hobby_category_name: string;
    hobby_category_description: string;
  };
}
interface Category {
  id: number;
  category_name: string;
  category_description: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface UserHobbyAnser {
  hobbyId: number;
  userId: number;
}

function HobbyPage() {

  const [allHobbies, setAllHobbies] = useState<Hobby[]>([]);
  const [userHobbies, setUserHobbies] = useState<Hobby[]>([]);
  const [allCategories, setAllCastegories] = useState<Category[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { showAlert } = useAlert();

  const initializationRef = useRef(false);

  useEffect(() => {
    if (!initializationRef.current) {
      return;
    }
    initializationRef.current = true;
    const initializeUserHobbies = async () => {
      try {
        setIsLoading(true);
        const user = await getUser();
        if (!user) {
          throw new Error("Nie udało się pobrać ID użytkownika");
        }
        setUserId(user.userId);
        const userHobbies = await getUserHobbies(user.userId);
        if (!userHobbies) {
          throw new Error("Nie udało się pobrać hobby użytkownika");
        }
        const allHobbiesResponse = await getAllHobbyCategories();
        if (!allHobbiesResponse || allHobbiesResponse.length === 0) {
          throw new Error("Nie udało się pobrać wszystkich hobby");
        }
        setAllHobbies(allHobbiesResponse);
        setUserHobbies(userHobbies)
      }
      catch (error: any) {
        console.error("Błąd podczas inicjalizacji hobby użytkownika:", error);
        setError("Nie udało się pobrać hobby użytkownika. Spróbuj ponownie.");
        showAlert("Nie udało się pobrać hobby użytkownika. Spróbuj ponownie.", "error");
      }
      finally {
        setIsLoading(false);
      }
    };
    initializeUserHobbies();
  }, [showAlert]);

  if (userHobbies.length === 0) {
    return (
      <div className="relative min-h-screen flex">
        <Background blur="lg">
          <SideBar options={getSideBarOptions("Pytania")} />
          <div className="ml-12 sm:ml-16 py-8 px-4 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
              <i className="fas fa-question-circle text-gray-400 text-4xl mb-4"></i>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Brak pytań
              </h3>
              <p className="text-gray-600">
                Aktualnie nie masz żadnych hobby dodanych do swojego profilu.
              </p>
            </div>
          </div>
        </Background>
      </div>
    );
  }




  return (
    <div className="flex flex-col items-center justify-center">
      <Background blur="lg">
        <SideBar options={getSideBarOptions("Hobby")} />
        <div className="ml-12 sm:ml-16"></div>
      </Background>
    </div>
  );
}

export default HobbyPage;