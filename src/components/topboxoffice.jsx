import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AiOutlineEye } from 'react-icons/ai';
import { useAuth } from './auth'; 

const TopBoxOffice = () => {
  const { user, isLoading } = useAuth();
  const [mediaType] = useState('movie'); // only 'movie' supports revenue
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;

  const addToWatchlist = async (item) => {
    try {
      await axios.post(
        `${API}playlist/watchlist`,
        {
          movieId: item.id,
          title: item.title,
          posterPath: item.poster_path,
          releaseDate: item.release_date,
          mediaType: 'movie',
        },
        { withCredentials: true }
      );
      toast.success(`"${item.title}" added to watchlist!`);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please log in to add to your watchlist.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Already exists in watchlist');
      }
    }
  };

  const addToWatched = async (item) => {
    try {
      await axios.post(
        `${API}watched/add`,
        {
          movieId: item.id,
          title: item.title,
          posterPath: item.poster_path,
          releaseDate: item.release_date,
          mediaType: 'movie',
          genres: item.genre_ids || [],
        },
        { withCredentials: true }
      );
      toast.success(`Marked "${item.title}" as watched! ✅`);
      await axios.delete(`${API}playlist/watchlist/${item.id}`, { withCredentials: true }).catch(() => {});
    } catch (err) {
      if (err.response?.status === 409) {
        toast('Already in watched!');
      } else {
        toast.error(err.response?.data?.message || 'Failed to mark as watched');
      }
    }
  };

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchTopRevenue = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${apiKey}&sort_by=revenue.desc&page=1`
        );
        const data = await res.json();
        setList(data.results);
      } catch (error) {
        console.error('Failed to fetch top box office movies:', error);
        setList([]);
      }
    };
    fetchTopRevenue();
  }, [mediaType]);

  const isSmall = screenWidth < 640;
  const perPage = isSmall ? 2 : 5;
  const totalPages = Math.ceil(list.length / perPage);
  const displayed = list.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-black text-white py-10 px-4 sm:px-6 lg:px-10 w-full min-h-screen">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-purple-500 mb-6">Top Box Office Movies</h2>

        <div className={`grid grid-cols-2 ${!isSmall ? 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : ''} gap-4 sm:gap-6`}>
          {displayed.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900 rounded-lg overflow-hidden shadow hover:scale-105 transition relative group"
            >
              {/* Poster Image */}
              <div className="relative group">
                {item.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                    alt={item.title}
                    className="w-full aspect-[2/3] object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gray-700 flex items-center justify-center text-sm text-gray-400 rounded-t-lg">
                    No Image
                  </div>
                )}

                {/* 👁 Mark as watched */}
              {/* 👁 Mark as watched */}
<div
  onClick={() => addToWatched(item)}
  className="absolute top-2 right-10 bg-purple-700/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition duration-300 hover:bg-purple-600/90 shadow-lg"
  title="Mark as watched"
>
  <AiOutlineEye size={18} />
</div>

{/* ▶ Watch Now */}
{/* ▶ Play Button */}
<div
  onClick={() => {
    if (!user) {
      toast.error('Please login to watch!');
      navigate('/login');
    } else {
      navigate(`/watch/${item.id}`);
    }
  }}
  className="absolute top-2 right-2 bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition duration-300 hover:bg-gray-200 shadow-lg flex items-center justify-center"
  title="Watch Now"
>
  <span className="text-purple-600 font-bold text-lg">▶</span>
</div>
              </div>

              <div className="p-3">
                <h3 className="text-sm font-bold line-clamp-2">{item.title}</h3>
                <p className="text-xs text-gray-400 mt-1">Release: {item.release_date || 'N/A'}</p>

                {/* Details & My List Buttons */}
                <div className="flex gap-2 mt-3">
                  <Link
                    to={`/details/${item.id}?type=${mediaType}`}
                    className="flex-1 bg-gray-100 text-black text-xs font-semibold py-2 rounded-lg text-center
                               hover:bg-gray-200 hover:scale-105 transform transition duration-300 shadow-lg"
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
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm disabled:opacity-50"
            >
              Prev
            </button>
            {!isSmall ? (
              Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded text-sm font-semibold ${
                    page === i + 1 ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-purple-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))
            ) : (
              <span className="px-4 py-2 rounded bg-gray-700 text-sm font-semibold text-white">
                Page {page} of {totalPages}
              </span>
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBoxOffice;