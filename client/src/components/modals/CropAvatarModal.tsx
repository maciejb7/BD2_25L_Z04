import Cropper from "react-easy-crop";
import { useState } from "react";
import { getCroppedImg } from "../../utils/cropImage";
import { getUserAvatar, uploadUserAvatar } from "../../api/api.user";
import { useAlert } from "../../contexts/AlertContext";

interface AvatarCropModalProps {
  imageSrc: string;
  onClose: () => void;
  onSave: (url: string) => void;
}

function AvatarCropModal({ imageSrc, onClose, onSave }: AvatarCropModalProps) {
  const { showAlert } = useAlert();

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedSize, setCroppedSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const handleCropComplete = (_: any, cropped: any) => {
    setCroppedAreaPixels(cropped);
    setCroppedSize({
      width: Math.round(cropped.width),
      height: Math.round(cropped.height),
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsLoading(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      const response = await uploadUserAvatar(file);
      showAlert(response.message, "success");

      const avatarUrl = await getUserAvatar();
      onSave(avatarUrl);
    } catch (error: any) {
      showAlert(
        error.message || "Wystąpił błąd podczas zapisywania awatara.",
        "error",
      );
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <dialog
        open
        className="p-6 rounded-lg shadow-md max-w-md w-full border-0 bg-white"
      >
        <div className="relative flex items-center justify-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            Dostosuj Zdjęcie Profilowe
          </h1>
          <button
            type="button"
            className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 z-10"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="relative w-full h-80 bg-gray-100 border rounded-md overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
          <span className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded shadow">
            {croppedSize.width}×{croppedSize.height}px
          </span>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            {isLoading ? "Przetwarzanie..." : "Zapisz"}
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default AvatarCropModal;
