import { useEffect, useState } from "react";
import { getUserBanStatusAdmin } from "../../api/api.admin";
import { getDateFormatter } from "../../utils/formatters";

interface AccountBanInfoProps {
  userId: string;
}

function AccountBanInfo({ userId }: AccountBanInfoProps) {
  const [banStatus, setIsBanStatus] = useState({
    isBanned: false,
    givenBy: "",
    reason: "",
    givenAt: "",
  });

  const fetchBanInfo = async () => {
    try {
      const response = await getUserBanStatusAdmin(userId);
      setIsBanStatus({
        isBanned: true,
        givenBy: response.givenBy,
        reason: response.reason,
        givenAt: response.givenAt,
      });
    } catch {
      setIsBanStatus({
        isBanned: false,
        givenBy: "",
        reason: "",
        givenAt: "",
      });
    }
  };

  useEffect(() => {
    fetchBanInfo();
  }, []);

  if (!banStatus.isBanned) return null;

  return (
    <div className="w-full max-w-4xl px-4 mt-6 mx-auto flex flex-col gap-4 justify-center items-center">
      <div className="w-full bg-red-100 border border-red-300 text-red-800 rounded-xl shadow-sm p-5 text-center">
        <h3 className="font-bold text-lg mb-2">UŻYTKOWNIK ZBANOWANY</h3>
        <p>
          <span className="font-semibold">Powód:</span>{" "}
          {banStatus.reason || "Nie podano"}
        </p>
        <p>
          <span className="font-semibold">Zbanowany przez:</span>{" "}
          {banStatus.givenBy || "Nieznany"}
        </p>
        <p>
          <span className="font-semibold">Data bana:</span>{" "}
          {getDateFormatter(banStatus.givenAt)?.getDMYWithTime() ??
            "Nieznana data"}
        </p>
      </div>
    </div>
  );
}

export default AccountBanInfo;
