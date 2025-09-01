import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Watched = () => {
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const API=import.meta.env.VITE_BACKEND_URL;
  const fetchWatched = async () => {
    try {
      const res = await axios.get(`${API}watched`, {
        withCredentials: true,
      });

      setWatched(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch watched list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatched();
  }, []);

  if (loading) {
    return <div className="text-white text-center py-10">Loading watched list...</div>;
  }

  return (
    <div className="bg-black text-white py-10 min-h-screen px-4 sm:px-6 lg:px-10 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-purple-500 mb-8">Your Watched List</h2>

        {watched.length === 0 ? (
          <p className="text-gray-400">You haven’t marked anything as watched yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {watched.map((item) => {
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
                    <span className="inline-block mt-2 text-[10px] font-medium px-2 py-1 rounded bg-purple-700 text-white">
                      {item.mediaType?.toUpperCase() || 'MEDIA'}
                    </span>
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

export default Watched;