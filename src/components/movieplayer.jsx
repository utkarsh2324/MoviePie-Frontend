import React from "react";
import { useParams, useLocation } from "react-router-dom";

export default function MoviePlayer() {
  const { movieId } = useParams();
  const location = useLocation();
  
  // Check if type is passed in query
  const queryParams = new URLSearchParams(location.search);
  const mediaType = queryParams.get("type") || "movie";

  // Default for TV series
  const season = 1;
  const episode = 1;

  const embedUrl =
    mediaType === "movie"
      ? `https://www.vidking.net/embed/movie/${movieId}`
      : `https://www.vidking.net/embed/tv/${movieId}/${season}/${episode}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true`;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center text-white">
      <h1 className="text-2xl font-bold my-6">{mediaType === "movie" ? "Movie Player" : "TV Series Player"}</h1>

      <div className="w-full max-w-6xl px-4">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={embedUrl}
            title="Video Player"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-2xl shadow-2xl border border-gray-700"
          ></iframe>
        </div>
      </div>

      <p className="text-gray-400 mt-6 text-sm text-center px-4">
        © {new Date().getFullYear()} MoviePie
      </p>
    </div>
  );
}