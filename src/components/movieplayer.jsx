import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MoviePlayer() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center text-white">
     

    

      {/* 🎥 Responsive Video Player */}
      <div className="w-full max-w-6xl px-4">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={`https://www.vidking.net/embed/movie/${movieId}`}
            title="Movie Player"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-2xl shadow-2xl border border-gray-700"
          ></iframe>
        </div>
      </div>

      {/* ℹ️ Optional Footer */}
      <p className="text-gray-400 mt-6 text-sm text-center px-4">
        © {new Date().getFullYear()} MoviePie
      </p>
    </div>
  );
}