import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API=import.meta.env.VITE_BACKEND_URL;
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}users/forgotPassword-otp`, { email });
      toast.success('OTP sent to your email!');
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <form onSubmit={handleRequestOtp} className="bg-[#1f1f1f] p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your registered email"
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full bg-purple-600 hover:bg-purple-700 p-2 rounded font-semibold"
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
}