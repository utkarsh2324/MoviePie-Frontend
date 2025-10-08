import React, { useEffect, useState } from 'react';
import { Link ,useNavigate} from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AiOutlineEye } from 'react-icons/ai';
import { useAuth } from './auth';
const Watchlist = () => {
  const {user,isLoading}=useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const API=import.meta.env.VITE_BACKEND_URL;
  // Fetch watchlist
  const fetchWatchlist = async () => {
    try {
      const res = await axios.get(`${API}playlist/watchlist`, {
        withCredentials: true,
      });
      setWatchlist(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Remove from watchlist
  const handleRemove = async (movieId, title) => {
    try {
      await axios.delete(`${API}playlist/watchlist/${movieId}`, {
        withCredentials: true,
      });
      toast.success(`Removed "${title}" from watchlist!`);
      setWatchlist((prev) => prev.filter((item) => item.movieId !== movieId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove from watchlist');
    }
  };

  // Mark as watched and remove from watchlist
  const handleAddToWatched = async (item) => {
    try {
      await axios.post(
        `${API}watched/add`,
        {
          movieId: item.movieId,
          title: item.title,
          posterPath: item.posterPath,
          releaseDate: item.releaseDate,
          mediaType: item.mediaType,
          genres: item.genres || [], 
        },
        { withCredentials: true }
      );

      toast.success(`Marked "${item.title}" as watched! ✅`);

      await axios.delete(`${API}playlist/watchlist/${item.movieId}`, {
        withCredentials: true,
      });

      setWatchlist((prev) => prev.filter((i) => i.movieId !== item.movieId));
    } catch (err) {
      if (err.response?.status === 409) {
        toast('Already in watched, removed from watchlist');
        setWatchlist((prev) => prev.filter((i) => i.movieId !== item.movieId));
      } else {
        toast.error(err.response?.data?.message || 'Failed to mark as watched');
      }
    }
  };

  if (loading) {
    return <div className="text-white text-center py-10">Loading watchlist...</div>;
  }

  return (
    <div className="bg-black text-white py-10 min-h-screen px-4 sm:px-6 lg:px-10 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-purple-500 mb-8">Your Watchlist</h2>

        {watchlist.length === 0 ? (
          <p className="text-gray-400">You have no items in your watchlist yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {watchlist.map((item) => {
              const title = item.title || item.name;
              return (
                <div
                  key={item._id}
                  className="bg-gray-900 rounded-lg overflow-hidden shadow hover:scale-105 transition duration-300 relative group"
                >
                  {item.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${item.posterPath}`}
                      alt={title}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gray-700 flex items-center justify-center text-sm text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* ✅ Eye overlay icon */}
                  <div
                    onClick={() => handleAddToWatched(item)}
                    className="absolute top-2 right-10 bg-purple-700/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition duration-300 hover:bg-purple-600/90 shadow-lg"
                    title="Mark as watched"
                  >
                    <AiOutlineEye size={18} />
                  </div>
                  <div
  onClick={() => {
    if (!user) {
      toast.error('Please login to watch!');
      navigate('/login');
    } else {
      navigate(`/watch/${item.id}?type=${mediaType}`);
    }
  }}
  className="absolute top-2 right-2 bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition duration-300 hover:bg-gray-200 shadow-lg flex items-center justify-center"
  title="Watch Now"
>
  <span className="text-purple-600 font-bold text-lg">▶</span>
</div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold line-clamp-2">{title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Release: {item.releaseDate || 'N/A'}
                    </p>

                    {/* Original buttons side by side */}
                    <div className="flex gap-2 mt-3">
                      <Link
                        to={`/details/${item.movieId}?type=${item.mediaType}`}
                        className="cursor-pointer flex-1 bg-white text-black text-xs font-semibold py-1.5 rounded text-center hover:bg-gray-200 transition"
                      >
                        Details
                      </Link>

                      <button
                        onClick={() => handleRemove(item.movieId, title)}
                        className="cursor-pointer flex-1 bg-purple-700 text-white text-xs font-semibold py-1.5 rounded hover:bg-purple-600 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;