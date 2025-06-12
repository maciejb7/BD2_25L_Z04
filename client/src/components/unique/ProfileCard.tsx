import { useState, useEffect, useRef } from "react";
import { RecommendedUser } from "../../api/api.recommendation";
import Avatar from "../common/Avatar";
import { getUserAvatar } from "../../api/api.user";
import { getUserLocation, UserLocation } from "../../api/api.location";
import { getUserAnswers } from "../../api/api.questions";
import {
    getUserHobbies,
    getCurrentUserHobbies,
    getUserFavoriteMusic,
    UserHobby,
    UserMusicFavorite
} from "../../api/api.hobbies-music";

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
    const [sharedHobby, setSharedHobby] = useState<string | null>(null);
    const [randomMusic, setRandomMusic] = useState<UserMusicFavorite | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

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

                // Load current user's hobbies
                const currentUserHobbiesPromise = getCurrentUserHobbies().catch(() => []);

                // Load target user's hobbies
                const targetUserHobbiesPromise = getUserHobbies(user.userId).catch(() => []);

                // Load target user's music
                const userMusicPromise = getUserFavoriteMusic(user.userId).catch(() => ({ favorites: [], count: 0 }));

                const [avatar, userLocation, answer, currentUserHobbies, targetUserHobbies, userMusic] = await Promise.all([
                    avatarPromise,
                    locationPromise,
                    answersPromise,
                    currentUserHobbiesPromise,
                    targetUserHobbiesPromise,
                    userMusicPromise
                ]);

                setAvatarUrl(avatar || "");
                setLocation(userLocation);
                setRandomAnswer(answer);

                // Find shared hobbies
                const shared = findSharedHobby(currentUserHobbies, targetUserHobbies);
                setSharedHobby(shared);

                // Pick random music
                if (userMusic.favorites && userMusic.favorites.length > 0) {
                    const randomIndex = Math.floor(Math.random() * userMusic.favorites.length);
                    setRandomMusic(userMusic.favorites[randomIndex]);
                }

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

        // If no address, show coordinates in a user-friendly way
        return `${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`;
    };

    const truncateAnswer = (answer: string, maxLength: number = 50): string => {
        if (answer.length <= maxLength) return answer;
        return answer.substring(0, maxLength) + "...";
    };

    const findSharedHobby = (currentUserHobbies: UserHobby[], targetUserHobbies: UserHobby[]): string | null => {
        if (currentUserHobbies.length === 0 || targetUserHobbies.length === 0) {
            return null;
        }

        // Check for exact hobby matches first
        for (const currentHobby of currentUserHobbies) {
            for (const targetHobby of targetUserHobbies) {
                if (currentHobby.hobbyId === targetHobby.hobbyId) {
                    return `You both like ${currentHobby.hobby.hobby_name}`;
                }
            }
        }

        // Check for category matches
        for (const currentHobby of currentUserHobbies) {
            for (const targetHobby of targetUserHobbies) {
                if (currentHobby.hobby.hobby_category_id === targetHobby.hobby.hobby_category_id) {
                    return `You both like ${currentHobby.hobby.category.hobby_category_name}`;
                }
            }
        }

        return null;
    };

    const handleMusicPlay = () => {
        if (!randomMusic || !audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.src = randomMusic.track.music_track_preview_link;
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch((error) => {
                console.error("Error playing audio:", error);
            });
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
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

                {/* Shared Hobby */}
                {sharedHobby && !isLoadingData && (
                    <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center">
                            <i className="fas fa-heart text-green-600 mr-2"></i>
                            <span className="text-sm font-medium text-green-800">
                                {sharedHobby}
                            </span>
                        </div>
                    </div>
                )}

                {/* Random Music */}
                {randomMusic && !isLoadingData && (
                    <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <img
                                    src={randomMusic.album.music_album_cover_small}
                                    alt={randomMusic.album.music_album_title}
                                    className="w-12 h-12 rounded-md object-cover"
                                />
                                <button
                                    onClick={handleMusicPlay}
                                    className="absolute inset-0 bg-black bg-opacity-50 text-white rounded-md flex items-center justify-center hover:bg-opacity-70 transition-opacity"
                                >
                                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-sm`}></i>
                                </button>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-purple-800 truncate">
                                    {randomMusic.track.music_track_title}
                                </p>
                                <p className="text-xs text-purple-600 truncate">
                                    {randomMusic.artist.music_artist_name}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

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

            {/* Hidden audio element for music playback */}
            <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                preload="none"
            />
        </div>
    );
}

export default ProfileCard;