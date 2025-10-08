import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './auth';
import { Link ,useNavigate} from 'react-router-dom';
const Watched = () => {
  const {user,isLoading}=useAuth();
  const navigate = useNavigate();
  const [mediaType, setMediaType] = useState('movie');
  const [watched, setWatched] = useState({ movies: [], series: [], totalMovies: 0, totalSeries: 0 });
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_BACKEND_URL;

  const fetchWatched = async () => {
    try {
      const res = await axios.get(`${API}watched`, { withCredentials: true });
      setWatched(res.data.data || { movies: [], series: [], totalMovies: 0, totalSeries: 0 });
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

  const renderSection = (title, items, count) => (
    <div className="mb-10">
      <h3 className="text-2xl font-semibold text-purple-400 mb-4">
        {title} ({count})
      </h3>
      {items.length === 0 ? (
        <p className="text-gray-400">No {title.toLowerCase()} watched yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {items.map((item) => {
            const displayTitle = item.title || item.name;
            return (
              <div
                key={item._id}
                className="bg-gray-900 rounded-lg overflow-hidden shadow hover:scale-105 transition duration-300"
              >
                {item.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${item.posterPath}`}
                    alt={displayTitle}
                    className="w-full aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gray-700 flex items-center justify-center text-sm text-gray-400">
                    No Image
                  </div>
                )}
                <div className="p-3">
                  <h3 className="text-sm font-bold line-clamp-2">{displayTitle}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Release: {item.releaseDate || 'N/A'}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-medium px-2 py-1 rounded bg-purple-700 text-white">
                    {item.mediaType?.toUpperCase() || 'MEDIA'}
                  </span>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-black text-white py-10 min-h-screen px-4 sm:px-6 lg:px-10 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-purple-500 mb-8">Your Watched List</h2>

        {watched.totalMovies === 0 && watched.totalSeries === 0 ? (
          <p className="text-gray-400">You haven’t marked anything as watched yet.</p>
        ) : (
          <>
            {renderSection('Movies', watched.movies, watched.totalMovies)}
            {renderSection('Series', watched.series, watched.totalSeries)}
          </>
        )}
      </div>
    </div>
  );
};

export default Watched;