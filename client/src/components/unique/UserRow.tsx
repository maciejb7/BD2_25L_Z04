import { useState } from "react";
import { twoWayRoleMap } from "../../constants/maps";
import { UserWithSessions } from "../../types/others";
import { getDateFormatter } from "../../utils/formatters";

interface UserRowProps {
  user: UserWithSessions;
  onShowDetails: () => void;
  onBan: () => void;
  onUnban: () => void;
  onDelete: () => void;
}

/**
 * UserRow is a component that displays a single user in the user management table.
 */
function UserRow({
  user,
  onShowDetails,
  onBan,
  onUnban,
  onDelete,
}: UserRowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isAdmin = user.role === "admin";
  const isBanned = user.role === "banned";

  return (
    <div
      className="
        flex flex-col md:grid 
        md:grid-cols-[1fr_1fr_8rem_10rem_10rem_10rem_8rem]
        px-4 py-3 border-b 
        bg-[rgba(255,255,255,0.8)] 
        hover:bg-gray-100 transition-colors
      "
    >
      <div
        className={`font-medium text-gray-800 flex items-center justify-center mb-1 md:mb-0 ${user.role === "banned" ? "line-through" : ""}`}
      >
        {user.nickname}
      </div>
      <div className="text-gray-600 flex items-center justify-center mb-1 md:mb-0">
        {user.email}
      </div>
      <div className="text-center text-gray-700 flex items-center justify-center mb-1 md:mb-0">
        {twoWayRoleMap.to(user.role)}
      </div>
      <div className="text-center text-gray-500 flex items-center justify-center mb-1 md:mb-0">
        {getDateFormatter(user.createdAt)?.getDMYWithTime() ?? "Brak Daty"}
      </div>
      <div className="text-center text-gray-500 flex items-center justify-center mb-1 md:mb-0">
        {getDateFormatter(user.lastLogin)?.getDMYWithTime() ?? "Brak Daty"}
      </div>
      <div className="text-center text-gray-500 flex items-center justify-center mb-1 md:mb-0">
        {user.lastIp ?? "Brak IP"}
      </div>
      <div className="flex justify-center items-center space-x-3 mt-2 md:mt-0">
        <button
          onClick={() => onShowDetails()}
          className="text-blue-500 hover:text-blue-700 transition-colors"
          title="Szczegóły"
        >
          <i className="fas fa-info-circle text-lg"></i>
        </button>

        {!isAdmin && (
          <>
            {isBanned ? (
              <button
                onClick={() => {
                  setIsLoading(true);
                  onUnban();
                  setIsLoading(false);
                }}
                className="text-green-500 hover:text-green-700 transition-colors"
                title="Odbanuj"
                disabled={isLoading}
              >
                <i className="fas fa-unlock text-lg"></i>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsLoading(true);
                  onBan();
                  setIsLoading(false);
                }}
                className="text-yellow-500 hover:text-yellow-700 transition-colors"
                title="Zbanuj"
                disabled={isLoading}
              >
                <i className="fas fa-ban text-lg"></i>
              </button>
            )}

            <button
              onClick={() => onDelete()}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Usuń"
            >
              <i className="fas fa-trash text-lg"></i>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default UserRow;
