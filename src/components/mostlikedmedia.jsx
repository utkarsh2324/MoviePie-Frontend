import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const TopLikedMedia = () => {
  const [mediaType, setMediaType] = useState('movie');
  const [media, setMedia] = useState([]);
  const [page, setPage] = useState(1);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const itemsPerPage = 5;
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const API=import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchTopMedia = async () => {
      try {
        const url = `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${apiKey}&sort_by=vote_average.desc&vote_count.gte=1000&language=en-US&page=1`;
        const res = await fetch(url);
        const data = await res.json();
        setMedia(data.results.slice(0, 20));
        setPage(1);
      } catch (err) {
        console.error('Failed to fetch top liked media:', err);
        setMedia([]);
      }
    };

    fetchTopMedia();
  }, [mediaType]);

  const addToWatchlist = async (item) => {
    try {
      await axios.post(
        `${API}playlist/watchlist`,
        {
          movieId: item.id,
          title: item.title || item.name,
          posterPath: item.poster_path,
          releaseDate: item.release_date || item.first_air_date,
          mediaType,
        },
        { withCredentials: true }
      );
      toast.success(`"${item.title || item.name}" added to watchlist!`);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please log in to add to your watchlist.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Already exist in watchlist');
      }
    }
  };

  const isSmallScreen = screenWidth < 640;
  const itemsPerPageAdjusted = isSmallScreen ? 2 : itemsPerPage;
  const startIdx = (page - 1) * itemsPerPageAdjusted;
  const currentItems = media.slice(startIdx, startIdx + itemsPerPageAdjusted);
  const totalPages = Math.ceil(media.length / itemsPerPageAdjusted);

  return (
    <div className="bg-black text-white py-10 px-4 sm:px-6 lg:px-10 overflow-x-hidden w-full">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-purple-500">
            Top 20 Liked {mediaType === 'movie' ? 'Movies' : 'Series'}
          </h2>
          <div className="space-x-2">
            <button
              className={`cursor-pointer py-2 px-4 rounded-full text-sm font-semibold transition ${
                mediaType === 'movie'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-purple-600'
              }`}
              onClick={() => setMediaType('movie')}
            >
              Movies
            </button>
            <button
              className={`cursor-pointer py-2 px-4 rounded-full text-sm font-semibold transition ${
                mediaType === 'tv'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-purple-600'
              }`}
              onClick={() => setMediaType('tv')}
            >
              Series
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className={`grid grid-cols-2 ${!isSmallScreen ? 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : ''} gap-4 sm:gap-6`}>
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900 rounded-lg overflow-hidden shadow hover:scale-105 transition duration-300"
            >
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                  alt={item.title || item.name}
                  className="w-full aspect-[2/3] object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-700 flex items-center justify-center text-sm text-gray-400">
                  No Image
                </div>
              )}
              <div className="p-3">
                <h3 className="text-sm font-bold line-clamp-2">
                  {item.title || item.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  ⭐ {item.vote_average} | {item.release_date || item.first_air_date || 'N/A'}
                </p>
                <div className="flex gap-2 mt-3">
                  <Link
                    to={`/details/${item.id}?type=${mediaType}`}
                    className="cursor-pointer flex-1 bg-white text-black text-xs font-semibold py-1.5 rounded text-center hover:bg-gray-200 transition"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => addToWatchlist(item)}
                    className="cursor-pointer flex-1 bg-purple-700 text-white text-xs font-semibold py-1.5 rounded hover:bg-purple-600 transition"
                  >
                    + My List
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="cursor-pointer bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm disabled:opacity-50"
            >
              Prev
            </button>

            {isSmallScreen ? (
              <span className="px-4 py-2 rounded text-sm font-semibold bg-gray-700 text-white">
                Page {page} of {totalPages}
              </span>
            ) : (
              Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`cursor-pointer px-4 py-2 rounded text-sm font-semibold ${
                    page === pg
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-purple-600'
                  }`}
                >
                  {pg}
                </button>
              ))
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="cursor-pointer bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopLikedMedia;