import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth';
import { Link } from 'react-router-dom'; 

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-r from-[#0f0f0f] via-[#1c1c1c] to-[#0f0f0f] p-6">
      <div className="max-w-4xl w-full bg-[#1c1c1c] rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-purple-800/40">
        
        {/* Left Side - Greeting */}
        <div className="flex flex-col items-center justify-center p-8 text-white bg-[#111111]">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            Welcome Back!
          </h2>
          <p className="text-gray-400 mb-4 text-center">
            Log in to continue browsing and bingeing your favorite titles.
          </p>
          <img
  src="https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"
  alt="Popcorn Time"
  className="w-60 h-40 object-contain rounded-lg"
/>
        </div>

        {/* Right Side - Login Form */}
        <form onSubmit={handleLogin} className="bg-[#1f1f1f] p-10 text-white">
          <h3 className="text-3xl font-semibold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Login to <span className="font-bold">MoviePie</span>
          </h3>

          {error && (
            <div className="mb-4 px-4 py-2 bg-red-600/20 text-red-400 rounded border border-red-500/40">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block mb-2 text-sm text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Link section */}
          <div className="flex justify-between items-center mb-6 text-sm">
          <Link to="/forgot-password" className="text-gray-400 hover:underline">
  Forgot Password?
</Link>
            <Link
  to="/signup"
  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full font-medium text-xs shadow-md hover:scale-105 transition"
>
  Create Account
</Link>
          </div>

          <button
            type="submit"
            className="cursor-pointer w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition duration-300 text-white font-semibold shadow-md hover:scale-105"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}