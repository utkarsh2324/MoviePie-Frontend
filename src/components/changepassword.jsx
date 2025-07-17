import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (oldPassword === newPassword) {
      toast.error("Old and new passwords must be different.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        'http://localhost:8000/api/v1/users/change-password',
        { oldPassword, newPassword },
        { withCredentials: true }
      );
      toast.success("Password changed successfully!");
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1c1c1c] via-[#111] to-[#0a0a0a] p-6">
      <form onSubmit={handleSubmit} className="bg-[#1f1f1f] text-white p-10 rounded-xl shadow-lg w-full max-w-md border border-purple-800/40">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Change Password</h2>
        {error && <div className="mb-4 px-4 py-2 bg-red-600/20 text-red-400 rounded border border-red-500/40">{error}</div>}
        
        <label className="block mb-2 text-sm">Old Password</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500"
          required
        />

        <label className="block mb-2 text-sm">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-2 mb-6 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition duration-300 text-white font-semibold shadow-md hover:scale-105 cursor-pointer"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}