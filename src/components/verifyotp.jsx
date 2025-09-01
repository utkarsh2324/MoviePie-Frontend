import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const API=import.meta.env.VITE_BACKEND_URL;
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(
        `${API}users/verify-otp`, // ✅ Direct route
        {
          email: state?.email,
          otp,
        },
        { withCredentials: true }
      );

      alert(res.data.message || 'OTP verified successfully!');
      navigate('/login');
    } catch (err) {
      console.error('OTP Verification Error:', err);
      setError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1c1c1c] p-4">
      <form onSubmit={handleOtpVerify} className="bg-[#222] p-8 rounded-lg shadow-xl text-white w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">Verify OTP</h2>
        
        {error && <div className="mb-4 bg-red-500/20 text-red-300 p-2 rounded">{error}</div>}

        <label className="block mb-2 text-sm text-gray-300">Enter OTP</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-purple-500"
          placeholder="e.g. 123456"
          required
        />

        <button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:scale-105 transition"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
}