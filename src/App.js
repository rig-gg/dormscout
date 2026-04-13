import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Homepage from './pages/Home/HomePage.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import ForgotPassword from './pages/Auth/ForgotPassword.jsx';
import Support from './pages/Support/Support.jsx';
import AboutUs from './pages/About/AboutUs.jsx';
import ProfilePage from './pages/Profile/ProfilePage.jsx';
import Settings from './pages/Settings/Settings.jsx';
import Reviews from './pages/Reviews/Reviews.jsx';

function App() {
  const [userType, setUserType] = useState(null); // 'landlord' or 'tenant'
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login setUserType={setUserType} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={
          userType ? (
            <Dashboard userType={userType} darkMode={darkMode} setDarkMode={setDarkMode} />
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/profile" element={
          <ProfilePage userType={userType} darkMode={darkMode} setDarkMode={setDarkMode} />
        } />
        <Route path="/support" element={<Support darkMode={darkMode} />} />
        <Route path="/about" element={<AboutUs darkMode={darkMode} />} />
        <Route path="/settings" element={
          <Settings userType={userType} darkMode={darkMode} setDarkMode={setDarkMode} />
        } />
        <Route path="/reviews" element={
          <Reviews userType={userType} darkMode={darkMode} setDarkMode={setDarkMode} />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;