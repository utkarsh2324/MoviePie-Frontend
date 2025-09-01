import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from './auth'; // adjust path if needed

export default function ChangeAvatar() {
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth(); // ✅ so navbar updates
  const API=import.meta.env.VITE_BACKEND_URL;
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    if (file) {
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!avatar) return setError('Please select an avatar');
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('avatar', avatar);

    try {
      await axios.patch(`${API}avatar`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await refreshUser(); // ✅ updates context so navbar reflects change
      toast.success('Avatar updated successfully!');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1c1c1c] via-[#111] to-[#0a0a0a] p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1f1f1f] text-white p-10 rounded-xl shadow-lg w-full max-w-md border border-purple-800/40"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Change Avatar</h2>

        {error && (
          <div className="mb-4 px-4 py-2 bg-red-600/20 text-red-400 rounded border border-red-500/40">
            {error}
          </div>
        )}

        {/* Avatar preview */}
        {previewUrl && (
          <div className="flex justify-center mb-6">
            <img
              src={previewUrl}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-6 text-white bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg cursor-pointer"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition duration-300 text-white font-semibold shadow-md hover:scale-105 cursor-pointer"
        >
          {loading ? 'Updating...' : 'Update Avatar'}
        </button>
      </form>
    </div>
  );
}