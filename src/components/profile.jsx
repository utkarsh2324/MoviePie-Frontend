import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserEdit, FaImage, FaKey } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/v1/users/current-user', { withCredentials: true })
      .then(res => setUser(res.data.data))
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load user');
      });
  }, []);

  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!user) return <div className="text-white text-center mt-10">Loading profile...</div>;

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-gradient-to-br from-[#1c1c1c] via-[#111] to-[#0a0a0a] px-6 py-10 text-white">
      <div className="text-center mb-10">
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 drop-shadow-md">
          Welcome to your profile, {user.userName} !
        </h2>
        <p className="text-gray-300 mt-3 text-lg">Manage your personal info and customize your MoviePie experience.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-28 h-28 rounded-full object-cover border-4 border-purple-500 shadow-lg"
          />
          <div>
            <h1 className="text-4xl font-bold text-white">{user.userName}</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <ActionCard
          icon={<FaUserEdit className="text-xl text-purple-400" />}
          title="Change Username"
          desc="Update your display name anytime"
          onClick={() => navigate('/changeusername')}
        />
        <ActionCard
          icon={<FaImage className="text-xl text-pink-400" />}
          title="Change Avatar"
          desc="Upload a new profile picture"
          onClick={() => navigate('/changeavatar')}
        />
        <ActionCard
          icon={<FaKey className="text-xl text-purple-300" />}
          title="Change Password"
          desc="Secure your account with a new password"
          onClick={() => navigate('/changepassword')}
        />
      </div>
    </div>
  );
}

// ✅ Now just use the onClick passed from props
function ActionCard({ icon, title, desc, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:shadow-2xl transition hover:scale-[1.02] cursor-pointer hover:bg-white/10"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-full bg-white/10 group-hover:bg-purple-600/20 transition">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
}