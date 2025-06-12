import { useState, useEffect } from "react";
import { RecommendedUser } from "../../api/api.recommendation";
import Avatar from "../common/Avatar";
import { getUserAvatar } from "../../api/api.user";
import { getUserLocation, UserLocation } from "../../api/api.location";
import { getUserAnswers } from "../../api/api.questions";

interface ProfileCardProps {
    user: RecommendedUser;
    onLike: (userId: string) => void;
    onDislike: (userId: string) => void;
    isLoading?: boolean;
}

interface Answer {
    id: string;
    userId: string;
    questionId: string;
    answer: string;
    createdAt: string;
    updatedAt: string;
    user: {
        userId: string;
        nickname: string;
        name: string;
        surname: string;
    };
    question: {
        id: string;
        content: string;
    };
}

function ProfileCard({ user, onLike, onDislike, isLoading = false }: ProfileCardProps) {
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [randomAnswer, setRandomAnswer] = useState<Answer | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Load user data when component mounts
    useEffect(() => {
        const loadUserData = async () => {
            setIsLoadingData(true);

            try {
                // Load avatar
                const avatarPromise = getUserAvatar().catch(() => "");

                // Load location
                const locationPromise = getUserLocation(user.userId).catch(() => null);

                // Load answers and pick a random one
                const answersPromise = getUserAnswers(user.userId)
                    .then(answers => {
                        if (answers && answers.length > 0) {
                            const randomIndex = Math.floor(Math.random() * answers.length);
                            return answers[randomIndex];
                        }
                        return null;
                    })
                    .catch(() => null);

                const [avatar, userLocation, answer] = await Promise.all([
                    avatarPromise,
                    locationPromise,
                    answersPromise
                ]);

                setAvatarUrl(avatar || "");
                setLocation(userLocation);
                setRandomAnswer(answer);
            } catch (error) {
                console.error("Error loading user data:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        loadUserData();
    }, [user.userId]);

    const calculateAge = (birthDate: string): number => {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const formatGender = (gender: string): string => {
        return gender === "male" ? "Mężczyzna" : "Kobieta";
    };

    const formatLocation = (location: UserLocation | null): string => {
        if (!location) return "Lokalizacja niedostępna";

        if (location.address) {
            return location.address;
        }

        // If no address, show coordinates
        return `${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`;
    };

    const truncateAnswer = (answer: string, maxLength: number = 50): string => {
        if (answer.length <= maxLength) return answer;
        return answer.substring(0, maxLength) + "...";
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full mx-auto relative">
            {/* Basic Info */}
            <div className="flex flex-col items-center mb-6">
                <Avatar size="large" />
                <h2 className="text-2xl font-bold text-gray-800 mt-4">
                    {user.name} {user.surname}
                </h2>
                <p className="text-lg text-gray-600 font-medium">@{user.nickname}</p>
            </div>

            {/* Profile Details */}
            <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Wiek i płeć:</span>
                    <span className="text-gray-800">
                        {calculateAge(user.birthDate)} lat, {formatGender(user.gender)}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Lokalizacja:</span>
                    <span className="text-gray-800 text-right text-sm max-w-[150px]">
                        {isLoadingData ? "Ładowanie..." : formatLocation(location)}
                    </span>
                </div>

                {/* Random Question/Answer */}
                {randomAnswer && !isLoadingData && (
                    <div className="bg-blue-50 rounded-lg p-3 mt-4">
                        <p className="text-sm font-medium text-blue-800 mb-1">
                            {randomAnswer.question.content}
                        </p>
                        <p className="text-sm text-blue-600 italic">
                            "{truncateAnswer(randomAnswer.answer)}"
                        </p>
                    </div>
                )}

                {/* No answers placeholder */}
                {!randomAnswer && !isLoadingData && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-4">
                        <p className="text-sm text-gray-500 text-center">
                            Brak odpowiedzi na pytania
                        </p>
                    </div>
                )}

                {/* Loading placeholder */}
                {isLoadingData && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-4">
                        <p className="text-sm text-gray-500 text-center">
                            Ładowanie informacji...
                        </p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
                <button
                    onClick={() => onDislike(user.userId)}
                    disabled={isLoading}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                    <i className="fas fa-times text-xl"></i>
                    <span>Pomiń</span>
                </button>
                <button
                    onClick={() => onLike(user.userId)}
                    disabled={isLoading}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                    <i className="fas fa-heart text-xl"></i>
                    <span>Polub</span>
                </button>
            </div>

            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 rounded-2xl flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}
        </div>
    );
}

export default ProfileCard;