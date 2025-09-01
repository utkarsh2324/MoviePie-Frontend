import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    userName: '',
    password: '',
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const API=import.meta.env.VITE_BACKEND_URL;
  const handleChange = (e) => {
    if (e.target.name === 'avatar') {
      const file = e.target.files[0];
      if (file) {
        setFormData({ ...formData, avatar: file });
        setAvatarPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('email', formData.email);
      payload.append('userName', formData.userName);
      payload.append('password', formData.password);
      payload.append('avatar', formData.avatar);

      const res = await axios.post(
        `${API}users/register`,
        payload,
        { withCredentials: true }
      );

      alert(res.data.message);
      navigate('/verifyotp', { state: { email: formData.email } });
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-r from-[#0f0f0f] via-[#1c1c1c] to-[#0f0f0f] p-6">
      <div className="max-w-4xl w-full bg-[#1c1c1c] rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-purple-800/40">
        
        {/* Left Side - Greeting */}
        <div className="flex flex-col items-center justify-center p-8 text-white bg-[#111111]">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            Join MoviePie!
          </h2>
          <p className="text-gray-400 mb-4 text-center">
          Create your account to explore and get personalized movie recommendations.
          </p>
          <img
            src="https://media.giphy.com/media/QBd2kLB5qDmysEXre9/giphy.gif"
            alt="Signup"
            className="w-60 h-40 object-contain rounded-lg"
          />
        </div>

        {/* Right Side - Signup Form */}
        <form onSubmit={handleSignup} className="bg-[#1f1f1f] p-10 text-white">
          <h3 className="text-3xl font-semibold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Sign Up to <span className="font-bold">MoviePie</span>
          </h3>

          {error && (
            <div className="mb-4 px-4 py-2 bg-red-600/20 text-red-400 rounded border border-red-500/40">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-2 text-sm text-gray-300">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm text-gray-300">Username *</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm text-gray-300">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm text-gray-300">Upload Avatar *</label>

            {/* Styled Upload Box */}
            <div
              className="w-full border-2 border-dashed border-purple-500 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-800 transition"
              onClick={() => fileInputRef.current.click()}
            >
              <p className="text-sm text-gray-400">
                Click to upload avatar image (jpg, png)
              </p>
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="mt-4 w-16 h-16 mx-auto rounded-full object-cover border-2 border-purple-500"
                />
              )}
            </div>
            <input
              type="file"
              name="avatar"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleChange}
              className="hidden"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition duration-300 text-white font-semibold shadow-md hover:scale-105"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}