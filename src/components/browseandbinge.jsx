import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './auth'; 
import { AiOutlineEye } from 'react-icons/ai';

const languageOptions = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ru', name: 'Russian' },
];

const BrowseAndBinge = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;

  const [mediaType, setMediaType] = useState('movie');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [year, setYear] = useState('');
  const [language, setLanguage] = useState('');
  const [mediaList, setMediaList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [genreLoading, setGenreLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) navigate('/login');
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setGenreLoading(true);
        const res = await fetch(
          `https://api.themoviedb.org/3/genre/${mediaType}/list?api_key=${apiKey}&language=en-US`
        );
        const data = await res.json();
        setGenres(data.genres || []);
        setSelectedGenre('');
      } catch (err) {
        console.error('Failed to fetch genres:', err.message);
        setGenres([]);
      } finally {
        setGenreLoading(false);
      }
    };
    fetchGenres();
  }, [mediaType]);

  const fetchMedia = async () => {
    if (!selectedGenre || !year) {
      setError('Please select both Genre and Year.');
      return;
    }
    try {
      const params = new URLSearchParams({
        api_key: apiKey,
        sort_by: 'popularity.desc',
        page,
        with_genres: selectedGenre,
      });
      if (language) params.append('with_original_language', language);
      if (mediaType === 'movie') params.append('primary_release_year', year);
      else params.append('first_air_date_year', year);

      const res = await fetch(
        `https://api.themoviedb.org/3/discover/${mediaType}?${params}`
      );
      const data = await res.json();
      setMediaList(data.results || []);
      setTotalPages(data.total_pages || 1);
      setError('');
    } catch (err) {
      console.error('Failed to fetch media:', err.message);
      setError('Something went wrong while fetching media.');
    }
  };

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
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Please log in to add to your watchlist.');
        navigate('/login');
      } else {
        toast.error(err.response?.data?.message || 'Failed to add to watchlist');
      }
    }
  };

  const addToWatched = async (item) => {
    try {
      await axios.post(
        `${API}watched/add`,
        {
          movieId: item.id,
          title: item.title || item.name,
          posterPath: item.poster_path,
          releaseDate: item.release_date || item.first_air_date,
          mediaType,
          genres: item.genre_ids || [],
        },
        { withCredentials: true }
      );
      toast.success(`Marked "${item.title || item.name}" as watched! ✅`);
      // Optionally remove from watchlist if exists
      await axios.delete(`${API}playlist/watchlist/${item.id}`, { withCredentials: true }).catch(() => {});
    } catch (err) {
      if (err.response?.status === 409) toast('Already in watched!');
      else toast.error(err.response?.data?.message || 'Failed to mark as watched');
    }
  };

  useEffect(() => {
    if (page !== 1) fetchMedia();
  }, [page]);

  if (isLoading) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="bg-black text-white min-h-screen py-10 px-4 sm:px-6 lg:px-10">
      <h1 className="text-3xl font-bold text-purple-500 mb-6 text-center">Browse & Binge</h1>

      {error && (
        <div className="mb-4 px-4 py-2 bg-red-600/20 text-red-400 rounded border border-red-500/40 text-center">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <select
          value={mediaType}
          onChange={(e) => {
            setMediaType(e.target.value);
            setPage(1);
          }}
          className="bg-gray-800 text-white px-4 py-2 rounded cursor-pointer"
        >
          <option value="movie">Movies</option>
          <option value="tv">TV Shows</option>
        </select>

        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded cursor-pointer"
        >
          {genreLoading ? (
            <option>Loading genres...</option>
          ) : (
            <>
              <option value="">Select Genre</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </>
          )}
        </select>

        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Release Year"
          className="bg-gray-800 text-white px-4 py-2 rounded w-40 cursor-pointer"
        />

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded w-40 cursor-pointer"
        >
          <option value="">All Languages</option>
          {languageOptions.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>

        <button
          onClick={() => { setPage(1); fetchMedia(); }}
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* Media Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {mediaList.map((item) => (
          <div key={item.id} className="bg-gray-900 rounded-lg overflow-hidden shadow hover:scale-105 transition duration-300 relative group">
            {item.poster_path ? (
              <div className="w-full aspect-[2/3] bg-gray-700">
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-700 flex items-center justify-center text-sm text-gray-400">
                No Image
              </div>
            )}

            {/* Eye icon for watched */}
            <div
              onClick={() => addToWatched(item)}
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
      // Append timestamp to force remount even if same movie
      navigate(`/watch/${item.movieId}?type=${mediaType}&t=${Date.now()}`);
    }
  }}
  className="absolute top-2 right-2 bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition duration-300 hover:bg-gray-200 shadow-lg flex items-center justify-center"
  title="Watch Now"
>
  <span className="text-purple-600 font-bold text-lg">▶</span>
</div>
            <div className="p-4">
              <h3 className="text-sm font-bold line-clamp-2">{item.title || item.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{item.release_date || item.first_air_date || 'Unknown Date'}</p>
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
        <div className="flex justify-center gap-4 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="bg-gray-800 hover:bg-gray-700 px-5 py-2 rounded disabled:opacity-50 text-sm cursor-pointer"
          >
            Prev
          </button>
          <span className="text-sm flex items-center font-semibold">Page {page}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="bg-gray-800 hover:bg-gray-700 px-5 py-2 rounded disabled:opacity-50 text-sm cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowseAndBinge;