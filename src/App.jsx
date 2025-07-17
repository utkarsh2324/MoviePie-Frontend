import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar.jsx';
import HeroSection from './components/herosection.jsx';
import UpcomingMedia from './components/upcomingmedia.jsx';
import Login from './components/login.jsx';
import Signup from './components/signup.jsx';
import VerifyOtp from './components/verifyotp.jsx';
import Profile from './components/profile.jsx';
import ChangeUsername from './components/changeusername.jsx';
import ChangeAvatar from './components/changeavatar.jsx';
import ChangePassword from './components/changepassword.jsx';
import BrowseAndBinge from './components/browseandbinge.jsx';
import TopLikedMedia from './components/mostlikedmedia.jsx';
import TrendingPopularMedia from './components/trendingmedia.jsx';
import Details from './components/detail.jsx';
import Watchlist from './components/watchlist.jsx';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <TopLikedMedia />
              <TrendingPopularMedia />
            </>
          }
        />
        <Route path="/upcoming" element={<UpcomingMedia />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verifyotp" element={<VerifyOtp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/changeusername" element={<ChangeUsername />} />
        <Route path="/changeavatar" element={<ChangeAvatar />} />
        <Route path="/changepassword" element={<ChangePassword />} />
        <Route path="/browseandbinge" element={<BrowseAndBinge />} />
        <Route path="/details/:id" element={<Details />} />
        <Route path="/watchlist" element={<Watchlist/>} />
      </Routes>
    </>
  );
}

export default App;