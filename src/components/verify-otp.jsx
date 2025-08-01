import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function VerifyOTP() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const email = state?.email || '';

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/v1/users/resetverify-otp', { email, otp });
      toast.success('OTP verified!');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
  };

  if (!email) {
    return (
      <div className="text-center text-red-500 mt-20 text-lg font-semibold">
        Email not provided. Please restart the password reset process.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1c1c1c] via-[#111] to-[#0a0a0a] p-6">
      <form
        onSubmit={handleVerifyOtp}
        className="bg-[#1f1f1f] text-white p-10 rounded-xl shadow-lg w-full max-w-md border border-purple-800/40"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          Verify OTP
        </h2>

        <p className="text-sm text-gray-400 mb-4 text-center">
          An OTP has been sent to <span className="text-white font-medium">{email}</span>
        </p>

        <label className="block mb-2 text-sm">Enter OTP</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 py-2 mb-6 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500"
          placeholder="e.g. 123456"
          required
        />

        <button
          type="submit"
          className="cursor-pointer w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition duration-300 text-white font-semibold shadow-md hover:scale-105"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
}