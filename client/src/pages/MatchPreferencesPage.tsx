import { useState, useEffect } from "react";
import { matchPreferenceApi } from "../services/api";
import { MatchType, UserMatchPreference } from "../types";
import { useAuth } from "../contexts/AuthContext";
import "../styles/MatchPreferences.css";

const MatchPreferencesPage = () => {
  const { isAuthenticated } = useAuth();
  const [matchTypes, setMatchTypes] = useState<MatchType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch match types and user preferences
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get all match types
        const types = await matchPreferenceApi.getAllMatchTypes();
        setMatchTypes(types);

        // If user is authenticated, get their preferences
        if (isAuthenticated) {
          const userPreferences =
            await matchPreferenceApi.getUserMatchPreferences();
          setSelectedTypes(
            userPreferences.map(
              (pref: UserMatchPreference) => pref.match_type_id,
            ),
          );
        }
      } catch (error) {
        setError("Failed to load match preferences");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleToggleType = (typeId: string) => {
    setSelectedTypes((prev) => {
      if (prev.includes(typeId)) {
        return prev.filter((id) => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  const handleSavePreferences = async () => {
    if (!isAuthenticated) {
      setError("You must be logged in to save preferences");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      await matchPreferenceApi.updateUserMatchPreferences(selectedTypes);

      setSuccessMessage("Match preferences saved successfully!");
    } catch (error) {
      setError("Failed to save match preferences");
      console.error(error);
    } finally {
      setIsSaving(false);

      // Clear success message
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="match-preferences-container">
      <h1>What are you looking for?</h1>
      <p>Select one or more options below</p>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="match-types-grid">
        {matchTypes.map((type) => (
          <div
            key={type.match_type_id}
            className={`match-type-card ${selectedTypes.includes(type.match_type_id) ? "selected" : ""}`}
            onClick={() => handleToggleType(type.match_type_id)}
          >
            <div className="checkbox">
              {selectedTypes.includes(type.match_type_id) && (
                // Check icon
                <svg viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </div>
            <h2>{type.match_type_name}</h2>
            <p>{type.match_type_description}</p>
          </div>
        ))}
      </div>

      <button
        className="save-button"
        onClick={handleSavePreferences}
        disabled={isSaving || !isAuthenticated}
      >
        {isSaving ? "Saving..." : "Save Preferences"}
      </button>

      {!isAuthenticated && (
        <p className="login-note">Please log in to save your preferences</p>
      )}
    </div>
  );
};

export default MatchPreferencesPage;
