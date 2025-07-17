import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const Details = () => {
  const { id } = useParams();
  const { search } = useLocation();
  const mediaType = new URLSearchParams(search).get('type') || 'movie';

  const [details, setDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videoId, setVideoId] = useState('');
  const [loading, setLoading] = useState(true);

  const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;
  const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detailRes, creditRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${tmdbApiKey}&language=en-US`),
          fetch(`https://api.themoviedb.org/3/${mediaType}/${id}/credits?api_key=${tmdbApiKey}&language=en-US`)
        ]);
        const detailData = await detailRes.json();
        const creditData = await creditRes.json();
        setDetails(detailData);
        setCredits(creditData);

        const query = `${detailData.title || detailData.name} official trailer`;
        const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query)}&key=${youtubeApiKey}`);
        const ytJson = await ytRes.json();
        const found = ytJson.items?.[0]?.id?.videoId;
        if (found) setVideoId(found);
      } catch (err) {
        console.error('Error fetching data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, mediaType]);

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (!details) return <div className="text-red-500 p-10">Unable to load details.</div>;

  const mainDirector = credits?.crew?.find(person => person.job === 'Director');
  const writers = credits?.crew?.filter(person => person.job === 'Writer');
  const topCast = credits?.cast?.slice(0, 10);

  return (
    <div className="bg-black text-white px-4 py-10 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">{details.title || details.name}</h1>
          <p className="text-gray-400 text-sm">Release: {details.release_date || details.first_air_date || 'N/A'}</p>
        </div>
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Trailer"
            allowFullScreen
            className="w-full aspect-video rounded"
          />
        ) : (
          <p className="text-gray-500">No trailer found.</p>
        )}
        <div>
          <h2 className="text-2xl font-semibold">Overview</h2>
          <p className="text-gray-300">{details.overview || 'No overview.'}</p>
        </div>
        {mainDirector && (
  <div>
    <h2 className="text-xl font-semibold">Director</h2>
    <div className="flex flex-col items-center gap-2 mt-2 w-28 text-center">
      {mainDirector.profile_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w185${mainDirector.profile_path}`}
          alt={mainDirector.name}
          className="w-24 h-24 object-cover rounded-full mx-auto"
        />
      ) : (
        <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-xs mx-auto">
          No Image
        </div>
      )}
      {/* Name split on two lines */}
      <div className="text-sm leading-tight">
        <p>{mainDirector.name.split(' ')[0]}</p>
        <p>{mainDirector.name.split(' ').slice(1).join(' ')}</p>
      </div>
    </div>
  </div>
)}
        {writers?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold">Writers</h2>
            <div className="flex flex-wrap gap-4">
              {writers.map(w => (
                <div key={w.id} className="w-28 text-center">
                  {w.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${w.profile_path}`}
                      alt={w.name}
                      className="w-24 h-24 object-cover rounded-full mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto flex items-center justify-center text-xs">No Image</div>
                  )}
                  <p className="text-sm">{w.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {topCast?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold">Top Cast</h2>
            <div className="flex flex-wrap gap-4">
              {topCast.map(a => (
                <div key={a.id} className="w-28 text-center">
                  {a.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${a.profile_path}`}
                      alt={a.name}
                      className="w-24 h-24 object-cover rounded-full mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto flex items-center justify-center text-xs">No Image</div>
                  )}
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {details.homepage && (
          <a
            href={details.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-purple-600 text-white py-2 px-6 rounded hover:bg-purple-700 transition"
          >
            Visit Official Site
          </a>
        )}
      </div>
    </div>
  );
};

export default Details;