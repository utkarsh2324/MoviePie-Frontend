import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

import { useAuth } from './auth';

const TMDB_API_key = import.meta.env.VITE_TMDB_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
const TMDB_API_URL = 'https://api.themoviedb.org/3';


const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white h-5 w-5 sm:h-6 sm:w-6">
        <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
);

const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
        <rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /><path d="M12 11v2" /><path d="M12 17v2" /><path d="M12 21v-2" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

export default function MovieBot() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const navigate = useNavigate();
    const API=import.meta.env.VITE_BACKEND_URL;
    const [messages, setMessages] = useState([{ type: 'bot', text: "Hello! Tell me your mood or a genre you like, and I'll recommend something for you to watch." }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Set page background color
    useEffect(() => {
        document.body.style.backgroundColor = '#000';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);


    // Auth redirection
    useEffect(() => {
        if (!isAuthLoading && !user) {
            navigate('/login');
        }
    }, [user, isAuthLoading, navigate]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchWithBackoff = async (url, options, retries = 3, delay = 1000) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                if (response.status === 429 && retries > 0) {
                    await new Promise(res => setTimeout(res, delay));
                    return fetchWithBackoff(url, options, retries - 1, delay * 2);
                }
                const errorBody = await response.text();
                console.error("API Error Body:", errorBody);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error("Fetch error:", error);
            if (retries > 0) {
                await new Promise(res => setTimeout(res, delay));
                return fetchWithBackoff(url, options, retries - 1, delay * 2);
            }
            throw error;
        }
    };

    const callGeminiAPI = async (userInput, chatHistory) => {
        const systemPrompt = `You are a movie recommendation chatbot. Your goal is to understand the user's request based on the conversation history.
        - Review the provided conversation history. Do not suggest movies or TV shows that have already been recommended in this conversation.
        - If the user specifies a mood, feeling, or a vague request, suggest a single, relevant movie or TV series. Respond with a JSON object: {"type": "movie" or "tv", "title": "The Movie Title", "reason": "A brief explanation."}.
        - If the user specifies a clear genre (e.g., "comedy movies", "action series"), provide a list of 5-6 recommendations. Respond with a JSON object: {"recommendations": [{"type": "movie", "title": "Title 1"}, {"type": "tv", "title": "Title 2"}], "reason": "A brief intro sentence."}.
        - Try to provide a diverse list, including classics, blockbusters, and hidden gems.
        - Strictly adhere to the requested media type. If a user asks for 'action movies', only suggest movies.
        - Respond ONLY with the appropriate JSON object. Do not include any other text, greetings, or explanations outside of the JSON.`;
        
        const history = chatHistory.map(msg => {
            if (msg.type === 'user') {
                return { role: 'user', parts: [{ text: msg.text }] };
            }
            let botText = msg.text || msg.reason || '';
            if (botText) {
                return { role: 'model', parts: [{ text: botText }] };
            }
            return null;
        }).filter(Boolean);


        const payload = {
            contents: [
                ...history,
                { role: 'user', parts: [{ text: userInput }] }
            ],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json" }
        };

        try {
            const result = await fetchWithBackoff(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return JSON.parse(text);
            throw new Error("Invalid response structure from Gemini API");
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            return { error: "I had trouble coming up with a recommendation. Please try again." };
        }
    };

    const callTmdbAPI = async (type, title) => {
        try {
            const searchUrl = `${TMDB_API_URL}/search/${type}?api_key=${TMDB_API_key}&query=${encodeURIComponent(title)}`;
            const searchResult = await fetchWithBackoff(searchUrl, {});
            const item = searchResult.results?.[0];
            if (!item) return { error: `Sorry, I couldn't find any details for "${title}".`, details: null };

            const detailsUrl = `${TMDB_API_URL}/${type}/${item.id}?api_key=${TMDB_API_key}&append_to_response=credits,watch/providers`;
            const details = await fetchWithBackoff(detailsUrl, {});
            return { details };
        } catch (error) {
            console.error("Error calling TMDB API:", error);
            return { error: "Sorry, I couldn't fetch movie details.", details: null };
        }
    };

    const addToWatchlist = async (item) => {
        const mediaType = item.name ? 'tv' : 'movie';
        const API=import.meta.env.VITE_BACKEND_URL;
        try {
          await axios.post(
            `${API}playlist/watchlist`,
            {
              movieId: item.id,
              title: item.title || item.name,
              posterPath: item.poster_path,
              releaseDate: item.release_date || item.first_air_date,
              mediaType: mediaType,
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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        
        const userMessage = { type: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const geminiResponse = await callGeminiAPI(input, messages);
            if (geminiResponse.error) {
                setMessages(prev => [...prev, { type: 'bot', text: geminiResponse.error }]);
                return;
            }

            if (geminiResponse.recommendations) {
                const moviePromises = geminiResponse.recommendations.map(rec => callTmdbAPI(rec.type, rec.title));
                const movieResults = await Promise.all(moviePromises);
                const movieData = movieResults.map(res => res.details).filter(Boolean);
                if (movieData.length > 0) {
                    setMessages(prev => [...prev, { type: 'bot_movie_list', reason: geminiResponse.reason, data: movieData }]);
                } else {
                    setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I couldn't fetch details for those recommendations." }]);
                }
            } else if (geminiResponse.title) {
                const { details, error } = await callTmdbAPI(geminiResponse.type, geminiResponse.title);
                if (error) {
                    setMessages(prev => [...prev, { type: 'bot', text: error }]);
                } else if (details) {
                    setMessages(prev => [...prev, { type: 'bot_movie_single', reason: geminiResponse.reason, data: details }]);
                }
            } else {
                setMessages(prev => [...prev, { type: 'bot', text: "I'm not sure how to respond to that. Could you try asking differently?" }]);
            }
        } catch (error) {
            console.error("An unexpected error occurred in handleSendMessage:", error);
            setMessages(prev => [...prev, { type: 'bot', text: "Something went wrong. Please check the console and try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMovieCard = (data, isListItem = false) => {
        const title = data.name || data.title;
        const type = data.name ? 'tv' : 'movie';
        const releaseDate = data.first_air_date || data.release_date;
        const posterPath = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'https://placehold.co/500x750/111827/4B5563?text=No+Image';

        const cardClass = isListItem
            ? "bg-gray-800/50 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition duration-300 flex-shrink-0 w-44 sm:w-52"
            : "bg-gray-800/50 rounded-lg overflow-hidden shadow-lg flex flex-col sm:flex-row gap-4 w-full";

        const singleCardImageClass = "w-full h-48 sm:w-32 sm:h-auto object-cover self-center";
        
        return (
            <div className={cardClass}>
                <img src={posterPath} alt={title} className={isListItem ? "w-full h-64 sm:h-72 object-cover" : singleCardImageClass} />
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <h3 className="text-sm sm:text-md font-bold text-white line-clamp-2">{title}</h3>
                    <p className="text-xs text-gray-400 mt-1">Release: {releaseDate?.substring(0, 4) || 'N/A'}</p>
                     <div className="flex items-center gap-2 mt-2">
                        <StarIcon />
                        <span className="text-gray-300 font-semibold text-sm">{data.vote_average ? data.vote_average.toFixed(1) : 'N/A'}/10</span>
                    </div>
                    {!isListItem && <p className="text-gray-400 mt-2 text-xs line-clamp-3 flex-grow">{data.overview}</p>}
                    <div className="flex gap-2 mt-auto pt-4">
                        <Link to={`/details/${data.id}?type=${type}`} className="cursor-pointer flex-1 bg-white text-black text-xs font-semibold py-1.5 rounded text-center hover:bg-gray-200 transition">
                            Details
                        </Link>
                        <button 
                            onClick={() => addToWatchlist(data)}
                            className="flex-1 bg-purple-700 text-white text-xs font-semibold py-1.5 rounded hover:bg-purple-600 transition cursor-pointer"
                        >
                           + My List
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderMovieList = (data) => (
        <div className="flex overflow-x-auto gap-4 sm:gap-6 pt-3 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
            {data.map((movie) => <div key={movie.id}>{renderMovieCard(movie, true)}</div>)}
        </div>
    );
    
    if (isAuthLoading || !user) {
        return (
            <div className="bg-black text-white h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-black text-white h-[calc(100vh-5rem)] flex flex-col">
            <header className="py-4 sm:py-6 px-4 max-w-7xl mx-auto w-full flex-shrink-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-purple-500 text-center">Cinema-Bot</h1>
                <p className="text-center text-xs sm:text-sm text-gray-400 mt-1">Your AI Movie Recommender</p>
            </header>

            <main className="flex-grow flex-1 overflow-y-auto px-2 sm:px-4 pb-4">
                <div className="space-y-6 max-w-4xl w-full mx-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.type.startsWith('bot') && <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0"><BotIcon/></div>}
                            <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[80%] ${msg.type === 'user' ? 'bg-purple-700 text-white rounded-xl rounded-br-none p-3' : ''}`}>
                                {
                                    msg.type === 'bot' && <div className="bg-gray-800 rounded-xl rounded-bl-none p-3 inline-block"><p className="text-base break-words">{msg.text}</p></div>
                                }
                                {
                                    msg.type === 'bot_movie_list' && (
                                        <div className="bg-gray-800 rounded-xl rounded-bl-none p-4">
                                            <p className="text-base break-words mb-1">{msg.reason}</p>
                                            {renderMovieList(msg.data)}
                                        </div>
                                    )
                                }
                                {
                                    msg.type === 'bot_movie_single' && (
                                        <div className="bg-gray-800 rounded-xl rounded-bl-none p-4">
                                            <p className="text-base break-words mb-3">{msg.reason}</p>
                                            {renderMovieCard(msg.data, false)}
                                        </div>
                                    )
                                }
                                {
                                     msg.type === 'user' && <p className="text-base break-words">{msg.text}</p>
                                }
                            </div>
                            {msg.type === 'user' && <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0"><UserIcon/></div>}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3 justify-start">
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0"><BotIcon/></div>
                            <div className="bg-gray-800 rounded-xl p-3 rounded-bl-none">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </main>

            <footer className="bg-black p-2 sm:p-4 border-t border-gray-800 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., 'Suggest some action movies'"
                        className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-full text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 rounded-full p-2 sm:p-3 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={isLoading || !input.trim()}>
                        <SendIcon />
                    </button>
                </form>
            </footer>
        </div>
    );
}