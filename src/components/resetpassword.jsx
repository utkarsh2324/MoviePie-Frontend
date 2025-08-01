import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email || '';
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/v1/users/resetpassword', {
        email,
        newPassword,
      });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  if (!email) return <div className="text-center text-red-500">Email not provided. Restart flow.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <form onSubmit={handleResetPassword} className="bg-[#1f1f1f] p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <input
          type="password"
          placeholder="Enter new password"
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 mb-4"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="cursor-pointer w-full bg-pink-600 hover:bg-pink-700 p-2 rounded font-semibold"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}