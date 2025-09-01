import React, { useEffect, useState, useRef } from 'react';

const HeroSection = () => {
  const [topMedia, setTopMedia] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const intervalRef = useRef(null);
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;

  // Fetch top new popular media
  useEffect(() => {
    const fetchTopMedia = async () => {
      try {
        const [movieRes, tvRes] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&primary_release_date.gte=2024-01-01&page=1`
          ),
          fetch(
            `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&first_air_date.gte=2024-01-01&page=1`
          ),
        ]);

        const movies = await movieRes.json();
        const tvShows = await tvRes.json();

        const combined = [...movies.results, ...tvShows.results]
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 10);

        setTopMedia(combined);
      } catch (err) {
        console.error('Failed to fetch medias:', err);
      }
    };

    fetchTopMedia();
  }, []);

  // Auto slider
  useEffect(() => {
    if (!isHovering) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % topMedia.length);
        setIsImageLoaded(false); // reset for fade
      }, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [topMedia, isHovering]);

  // Fetch trailer for current item
  useEffect(() => {
    const fetchTrailer = async () => {
      const current = topMedia[currentSlide];
      if (!current) return;

      const mediaType = current.title ? 'movie' : 'tv';

      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${current.id}/videos?api_key=${apiKey}&language=en-US`
        );
        const data = await res.json();
        const trailer = data.results.find(
          (vid) => vid.type === 'Trailer' && vid.site === 'YouTube'
        );
        setTrailerKey(trailer ? trailer.key : null);
      } catch (err) {
        console.error('Failed to fetch trailer:', err);
      }
    };

    if (topMedia.length > 0) {
      fetchTrailer();
    }
  }, [topMedia, currentSlide]);

  if (topMedia.length === 0) return null;

  const current = topMedia[currentSlide];

  return (
    <section
      onMouseEnter={() => {
        setIsHovering(true);
        clearInterval(intervalRef.current);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
      }}
      className="relative w-full overflow-hidden bg-black h-[40vh] sm:h-[50vh] md:h-[70vh] lg:min-h-[calc(100vh-64px)] pt-16 sm:pt-20"
    >
      {/* Trailer or Poster */}
      {isHovering && trailerKey ? (
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&modestbranding=1&showinfo=0&rel=0`}
          title="Trailer"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : (
        <img
          src={`https://image.tmdb.org/t/p/original${current.backdrop_path}`}
          alt={current.title || current.name}
          onLoad={() => setIsImageLoaded(true)}
          className="absolute top-0 left-0 w-full h-full object-cover object-top sm:object-center transition-opacity duration-700"
          style={{ opacity: isImageLoaded ? 1 : 0 }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

      {/* Content */}
      {isImageLoaded && (
        <div className="relative z-10 px-4 sm:px-8 md:px-12 lg:px-20 text-white flex flex-col justify-end h-full pb-6 transition-opacity duration-700">
          <h1 className="text-xl sm:text-3xl md:text-5xl font-bold drop-shadow-md">
            {current.title || current.name}
          </h1>
          <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg max-w-xl text-gray-200 line-clamp-3">
            {current.overview}
          </p>

        </div>
      )}
    </section>
  );
};

export default HeroSection;