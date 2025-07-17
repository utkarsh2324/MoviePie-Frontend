import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/v1/playlist/watchlist', {
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

  const handleRemove = async (movieId, title) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/playlist/watchlist/${movieId}`, {
        withCredentials: true,
      });

      toast.success(`Removed "${title}" from watchlist!`);
      setWatchlist((prev) => prev.filter((item) => item.movieId !== movieId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove from watchlist');
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
                  className="bg-gray-900 rounded-lg overflow-hidden shadow hover:scale-105 transition duration-300"
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
                  <div className="p-3">
                    <h3 className="text-sm font-bold line-clamp-2">{title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Release: {item.releaseDate || 'N/A'}
                    </p>
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