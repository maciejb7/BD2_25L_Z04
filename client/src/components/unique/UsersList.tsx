import { useEffect, useState } from "react";
import UserRow from "./UserRow";
import { UserWithSessions } from "../../types/others";
import UserPagination from "./UserPagination";
import {
  deleteUserAccountByAdmin,
  getUsersFromAPIAdmin,
  unbanUserAccount,
} from "../../api/api.admin";
import { useAlert } from "../../contexts/AlertContext";
import BanUserModal from "../modals/BanUserModal";

const PAGE_SIZE = 10;

function UsersList() {
  const { showAlert } = useAlert();

  const [users, setUsers] = useState<UserWithSessions[]>([]);
  const [isBanUserModalOpen, setIsBanUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    try {
      const response = await getUsersFromAPIAdmin();
      const users = response.users;
      setUsers(users);
    } catch (error: any) {
      showAlert(error.message, "error");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.nickname.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const onUserDelete = async (userId: string) => {
    try {
      const response = await deleteUserAccountByAdmin(userId);
      showAlert(response.message, "success");
      await fetchUsers();
    } catch (error: any) {
      showAlert(error.message, "error");
    }
  };

  const onUserUnban = async (userId: string) => {
    try {
      const response = await unbanUserAccount(userId);
      showAlert(response.message, "success");
      await fetchUsers();
    } catch (error: any) {
      showAlert(error.message, "error");
    }
  };

  return (
    <div>
      <BanUserModal
        userId={selectedUserId}
        isOpen={isBanUserModalOpen}
        onBan={() => {
          fetchUsers();
        }}
        onClose={() => {
          setIsBanUserModalOpen(false);
          setSelectedUserId("");
        }}
      ></BanUserModal>
      <div className="p-6 bg-[rgba(255,255,255,0.8)] rounded shadow">
        <h2 className="text-xl font-bold mb-4">Lista Użytkowników</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Szukaj po nicku..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-1/3 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="hidden md:grid grid-cols-[1fr_1fr_8rem_10rem_10rem_10rem_8rem] px-4 py-2 border-b bg-gray-100 font-semibold text-gray-700">
          <div className="text-center">Nick</div>
          <div className="text-center">Email</div>
          <div className="text-center">Rola</div>
          <div className="text-center">Rejestracja</div>
          <div className="text-center">Ostatnie Logowanie</div>
          <div className="text-center">Ostatnie IP</div>
          <div className="text-center">Akcje</div>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-6">
            Brak pasujących użytkowników.
          </p>
        ) : (
          paginatedUsers.map((user) => (
            <UserRow
              key={user.userId}
              user={user}
              onShowDetails={() => {}}
              onBan={() => {
                setSelectedUserId(user.userId);
                setIsBanUserModalOpen(true);
              }}
              onUnban={() => onUserUnban(user.userId)}
              onDelete={() => onUserDelete(user.userId)}
            />
          ))
        )}

        <UserPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}

export default UsersList;
