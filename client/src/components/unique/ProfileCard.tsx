import { useState } from "react";
import { RecommendedUser } from "../../api/api.recommendation";
import Avatar from "../common/Avatar";
import { getUserAvatar } from "../../api/api.user";
import { getDateFormatter } from "../../utils/formatters";

interface ProfileCardProps {
    user: RecommendedUser;
    onLike: (userId: string) => void;
    onDislike: (userId: string) => void;
    isLoading?: boolean;
}

function ProfileCard({ user, onLike, onDislike, isLoading = false }: ProfileCardProps) {
    const [avatarUrl, setAvatarUrl] = useState<string>("");

    // Load user avatar when component mounts
    useState(() => {
        const loadAvatar = async () => {
            try {
                const url = await getUserAvatar();
                setAvatarUrl(url || "");
            } catch (error) {
                setAvatarUrl("");
            }
        };
        loadAvatar();
    });

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

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full mx-auto">
            {/* Basic Info */}
            <div className="flex flex-col items-center mb-6">
                <Avatar src={avatarUrl} size="large" />
                <h2 className="text-2xl font-bold text-gray-800 mt-4">
                    {user.name} {user.surname}
                </h2>
                <p className="text-lg text-gray-600 font-medium">@{user.nickname}</p>
            </div>

            {/* Profile Details */}
            <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Wiek:</span>
                    <span className="text-gray-800">{calculateAge(user.birthDate)} lat</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Płeć:</span>
                    <span className="text-gray-800">{formatGender(user.gender)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Dołączył:</span>
                    <span className="text-gray-800">
                        {getDateFormatter(user.createdAt)?.getDMY() || "Nieznana data"}
                    </span>
                </div>
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