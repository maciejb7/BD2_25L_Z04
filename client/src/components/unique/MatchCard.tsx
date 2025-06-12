import { useState, useEffect } from "react";
import { Match } from "../../api/api.recommendation";
import Avatar from "../common/Avatar";
import { getUserAvatar } from "../../api/api.user";
import { getDateFormatter } from "../../utils/formatters";

interface MatchCardProps {
    match: Match;
}

function MatchCard({ match }: MatchCardProps) {
    const [avatarUrl, setAvatarUrl] = useState<string>("");

    useEffect(() => {
        const loadAvatar = async () => {
            try {
                const url = await getUserAvatar();
                setAvatarUrl(url || "");
            } catch (error) {
                setAvatarUrl("");
            }
        };
        loadAvatar();
    }, []);

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

    return (
        <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center space-x-4">
                <Avatar src={avatarUrl} size="medium" />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {match.otherUser.name} {match.otherUser.surname}
                    </h3>
                    <p className="text-gray-600">@{match.otherUser.nickname}</p>
                    <a
                        href={`mailto:${match.otherUser.email}`}
                        className="text-sm text-blue-600 hover:text-blue-800 break-all hover:underline transition-colors cursor-pointer"
                        title={`Wyślij email do ${match.otherUser.name} ${match.otherUser.surname}`}
                    >
                        {match.otherUser.email}
                    </a>
                    <p className="text-sm text-gray-500">
                        {calculateAge(match.otherUser.birthDate)} lat
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Dopasowanie:</p>
                    <p className="text-sm font-medium text-green-600">
                        {getDateFormatter(match.matchedAt)?.getDMY() || "Nieznana data"}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default MatchCard;