import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const languageOptions = [
  { code: '', name: 'All Languages' },
  { code: 'hi', name: 'Hindi' },
  { code: 'en', name: 'English' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
];

const ReleasedMedia = () => {
  const [media, setMedia] = useState([]);
  const [type, setType] = useState('movie');
  const [language, setLanguage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const pastDate = twoMonthsAgo.toISOString().split('T')[0];
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    const fetchReleased = async () => {
      try {
        const baseURL = `https://api.themoviedb.org/3/discover/${type}`;
        const params = new URLSearchParams({
          api_key: apiKey,
          region: 'IN',
          include_adult: 'false',
          include_video: 'false',
          page,
          sort_by:
            type === 'movie'
              ? 'primary_release_date.desc'
              : 'first_air_date.desc',
          [`${type === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte'}`]: pastDate,
          [`${type === 'movie' ? 'primary_release_date.lte' : 'first_air_date.lte'}`]: today,
        });

        if (language) {
          params.append('with_original_language', language);
        }

        const res = await fetch(`${baseURL}?${params}`);
        const data = await res.json();
        setMedia(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error('Fetching released failed:', err);
      }
    };
    fetchReleased();
  }, [type, page, language]);

  const addToWatchlist = async (item) => {
    try {
      await axios.post(
        'http://localhost:8000/api/v1/playlist/watchlist',
        {
          movieId: item.id,
          title: item.title || item.name,
          posterPath: item.poster_path,
          releaseDate: item.release_date || item.first_air_date,
          mediaType: type,
        },
        { withCredentials: true }
      );
      toast.success(`"${item.title || item.name}" added to watchlist!`);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please log in to add to your watchlist.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add to watchlist');
      }
    }
  };

  return (
    <div className="bg-black text-white py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-3xl font-bold text-purple-500">
              Recently Released {type === 'movie' ? 'Movies' : 'Series'}
            </h2>
            <div className="relative z-10">
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setPage(1);
                }}
                className="bg-gray-800 text-white px-4 py-2 rounded text-sm border border-gray-600 cursor-pointer"
              >
                {languageOptions.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap sm:flex-nowrap">
            <button
              className={`py-2 px-6 rounded-full text-sm font-semibold transition duration-200 cursor-pointer ${
                type === 'movie'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-purple-600'
              }`}
              onClick={() => {
                setType('movie');
                setPage(1);
              }}
            >
              Movies
            </button>
            <button
              className={`py-2 px-6 rounded-full text-sm font-semibold transition duration-200 cursor-pointer ${
                type === 'tv'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-purple-600'
              }`}
              onClick={() => {
                setType('tv');
                setPage(1);
              }}
            >
              Series
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {media.length > 0 ? (
            media.map((item) => {
              const title = item.title || item.name;
              const date = item.release_date || item.first_air_date || 'TBA';
              return (
                <div
                  key={item.id}
                  className="bg-gray-900 rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition duration-300"
                >
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                      alt={title}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-700 flex items-center justify-center text-sm text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="p-4 flex flex-col gap-2">
                    <h3 className="text-sm font-bold line-clamp-2 text-white">{title}</h3>
                    <p className="text-xs text-gray-400">Release: {date}</p>
                    <div className="flex gap-2 mt-2">
                      <Link
                        to={`/details/${item.id}?type=${type}`}
                        className="cursor-pointer flex-1 bg-white text-black text-xs font-semibold py-1.5 rounded text-center hover:bg-gray-200 transition"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => addToWatchlist(item)}
                        className="flex-1 bg-purple-700 text-white text-xs font-semibold py-1.5 rounded hover:bg-purple-600 transition cursor-pointer"
                      >
                        + My List
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="col-span-full text-center text-gray-400">
              No recently released titles found.
            </p>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-10 gap-2 flex-wrap">
          {page > 1 && (
            <button
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-purple-600 text-sm"
            >
              Prev
            </button>
          )}

          {(() => {
            const maxDisplay = 5;
            const pages = [];

            if (totalPages <= maxDisplay) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              if (page <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
              } else if (page >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
              } else {
                pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
              }
            }

            return pages.map((p, i) =>
              p === '...' ? (
                <span key={i} className="px-2 py-1 text-gray-400 text-sm">...</span>
              ) : (
                <button
                  key={i}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded text-sm ${
                    p === page
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {p}
                </button>
              )
            );
          })()}

          {page < totalPages && (
            <button
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-purple-600 text-sm"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReleasedMedia;