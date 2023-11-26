import React, { useState, useEffect } from 'react';
import './App.css';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import RegistrationModal from './components/RegistrationForm';
import LoginModal from './components/LoginForm';
import Chat from './components/Chat';
import axios from 'axios';

const App: React.FC = () => {
  const [bookings, setBookings] = useState([] as any[]);

  const [isRegistrationFormOpen, setRegistrationFormOpen] = useState(false);
  const [isLoginFormOpen, setLoginFormOpen] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
  
  const [isChatOpen, setChatOpen] = useState(false);
  const [isOverlayActive, setIsOverlayActive] = useState(false);

  const addBooking = (booking: any) => {
    setBookings([...bookings, { id: bookings.length + 1, ...booking }]);
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:8000/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Ошибка получения данных', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openRegistrationForm = () => {
    setRegistrationFormOpen(true);
    setLoginFormOpen(false);
  };

  const openLoginForm = () => {
    setLoginFormOpen(true);
    setRegistrationFormOpen(false);
  };

  const closeAuthForms = () => {
    setRegistrationFormOpen(false);
    setLoginFormOpen(false);
  };

  const handleLogin = (token: string, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email); // Сохраняем email в localStorage
    setLoggedIn(true);
    console.log('Токен и email сохранены в локальном хранилище');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    console.log('Токен удален из локального хранилища');
  };

  const openChat = () => {
    setChatOpen(true);
    setIsOverlayActive(true); // Активировать затемнение фона
  };

  const closeChat = () => {
    setChatOpen(false);
    setIsOverlayActive(false); // Деактивировать затемнение фона
  };

  return (
    <div className="App">
      <div className="header">
        <h1>Гостиничная бронь</h1>
  
        <div className="auth-buttons">
          {!isLoggedIn ? (
            <>
              <button onClick={openRegistrationForm}>Регистрация</button>
              <button onClick={openLoginForm}>Войти</button>
            </>
          ) : (
            <>
              <button onClick={openChat}>Чат</button>
              <button onClick={handleLogout}>Выйти</button>
            </>
          )}
        </div>
      </div>
  
      {isLoggedIn && <BookingForm addBooking={addBooking} fetchBookings={fetchBookings} />}
      <BookingList bookings={bookings} setBookings={setBookings} isLoggedIn={isLoggedIn} />

      <div className={`overlay ${isRegistrationFormOpen || isLoginFormOpen ? 'active' : ''}`} onClick={closeAuthForms}></div>

      <div className={`modal ${isRegistrationFormOpen ? 'active' : ''}`}>
        <RegistrationModal onClose={closeAuthForms} onLogin={handleLogin} />
      </div>

      <div className={`modal ${isLoginFormOpen ? 'active' : ''}`}>
        <LoginModal onClose={closeAuthForms} onLogin={handleLogin} />
      </div>

      {isChatOpen && (
        <>
          <div className={`overlay ${isOverlayActive ? 'active' : ''}`} onClick={closeChat}></div>
          <Chat username={localStorage.getItem('email') || ''} onClose={closeChat} />
        </>
      )}
    </div>
  );
};

export default App;