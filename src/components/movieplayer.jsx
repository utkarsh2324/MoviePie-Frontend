import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";

export default function MoviePlayer() {
  const { movieId } = useParams();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const mediaType = queryParams.get("type") || "movie";

  // TV series controls
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  const embedUrl =
    mediaType === "movie"
      ? `https://www.vidking.net/embed/movie/${movieId}?autoPlay=true`
      : `https://www.vidking.net/embed/tv/${movieId}/${season}/${episode}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true`;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center text-white py-10 px-4">
      <h1 className="text-2xl font-bold my-6">
        {mediaType === "movie" ? "Movie Player" : "TV Series Player"}
      </h1>

      {mediaType === "tv" && (
        <div className="flex gap-4 mb-4">
          <input
            type="number"
            min={1}
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="Season"
            className="bg-gray-800 px-3 py-1 rounded w-24 text-white"
          />
          <input
            type="number"
            min={1}
            value={episode}
            onChange={(e) => setEpisode(e.target.value)}
            placeholder="Episode"
            className="bg-gray-800 px-3 py-1 rounded w-24 text-white"
          />
        </div>
      )}

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