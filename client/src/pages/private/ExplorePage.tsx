import { useState, useEffect } from "react";
import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";
import ProfileCard from "../../components/unique/ProfileCard";
import MatchCard from "../../components/unique/MatchCard";
import {
    getRecommendations,
    recordInteraction,
    getMatches,
    RecommendedUser,
    Match,
} from "../../api/api.recommendation";
import { useAlert } from "../../contexts/AlertContext";

function ExplorePage() {
    const [recommendations, setRecommendations] = useState<RecommendedUser[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [currentUserIndex, setCurrentUserIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
    const [activeTab, setActiveTab] = useState<"explore" | "matches">("explore");
    const { showAlert } = useAlert();

    useEffect(() => {
        loadRecommendations();
        loadMatches();
    }, []);

    const loadRecommendations = async () => {
        try {
            setIsLoadingRecommendations(true);
            const response = await getRecommendations(10);
            setRecommendations(response.recommendations);
            setCurrentUserIndex(0);
        } catch (error: any) {
            showAlert(error.message, "error");
        } finally {
            setIsLoadingRecommendations(false);
        }
    };

    const loadMatches = async () => {
        try {
            const response = await getMatches();
            setMatches(response.matches);
        } catch (error: any) {
            showAlert(error.message, "error");
        }
    };

    const handleInteraction = async (
        userId: string,
        action: "like" | "dislike"
    ) => {
        try {
            setIsLoading(true);
            const response = await recordInteraction(userId, action);

            if (response.isMatch) {
                showAlert("Mamy dopasowanie! Sprawdź zakładkę Dopasowania.", "success");
                loadMatches(); // Refresh matches
            } else {
                showAlert(response.message, "success");
            }

            // Move to next user
            const nextIndex = currentUserIndex + 1;
            if (nextIndex >= recommendations.length) {
                // Load more recommendations (if we're running out)
                await loadRecommendations();
            } else {
                setCurrentUserIndex(nextIndex);
            }
        } catch (error: any) {
            showAlert(error.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLike = (userId: string) => {
        handleInteraction(userId, "like");
    };

    const handleDislike = (userId: string) => {
        handleInteraction(userId, "dislike");
    };

    const currentUser = recommendations[currentUserIndex];

    return (
        <div className="relative min-h-screen flex">
            <Background blur="lg">
                <SideBar options={getSideBarOptions("Eksploruj")} />
                <div className="ml-12 sm:ml-16 py-8 px-4 w-full">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
                            <h2 className="flex items-center gap-4 text-2xl font-bold text-gray-800">
                                <i className="fas fa-compass"></i>
                                Eksploruj
                            </h2>

                            {/* Tab Navigation */}
                            <div className="flex bg-white rounded-lg shadow-md p-1 mt-4 sm:mt-0">
                                <button
                                    onClick={() => setActiveTab("explore")}
                                    className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "explore"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 hover:text-blue-600"
                                        }`}
                                >
                                    <i className="fas fa-search mr-2"></i>
                                    Odkryj ({recommendations.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab("matches")}
                                    className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "matches"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-600 hover:text-blue-600"
                                        }`}
                                >
                                    <i className="fas fa-heart mr-2"></i>
                                    Dopasowania ({matches.length})
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        {activeTab === "explore" && (
                            <div className="flex flex-col items-center">
                                {isLoadingRecommendations ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                        <p className="text-gray-600">Szukamy idealnych dopasowań...</p>
                                    </div>
                                ) : currentUser ? (
                                    <div className="relative">
                                        <ProfileCard
                                            user={currentUser}
                                            onLike={handleLike}
                                            onDislike={handleDislike}
                                            isLoading={isLoading}
                                        />

                                        {/* Progress indicator */}
                                        <div className="mt-6 flex justify-center">
                                            <div className="bg-white rounded-full px-4 py-2 shadow-md">
                                                <span className="text-sm text-gray-600">
                                                    {currentUserIndex + 1} z {recommendations.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <i className="fas fa-search text-6xl text-gray-400 mb-4"></i>
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                            Brak więcej rekomendacji
                                        </h3>
                                        <p className="text-gray-500 text-center mb-6">
                                            Nie ma aktualnie więcej profili do pokazania.
                                            <br />
                                            Spróbuj ponownie później!
                                        </p>
                                        <button
                                            onClick={loadRecommendations}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                                        >
                                            <i className="fas fa-refresh mr-2"></i>
                                            Odśwież
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "matches" && (
                            <div>
                                {matches.length > 0 ? (
                                    <div className="space-y-4">
                                        {matches.map((match) => (
                                            <MatchCard key={match.matchId} match={match} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <i className="fas fa-heart text-6xl text-gray-400 mb-4"></i>
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                            Brak dopasowań
                                        </h3>
                                        <p className="text-gray-500 text-center">
                                            Nie masz jeszcze żadnych dopasowań.
                                            <br />
                                            Zacznij lajkować profile w zakładce Odkryj!
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Background>
        </div>
    );
}

export default ExplorePage;