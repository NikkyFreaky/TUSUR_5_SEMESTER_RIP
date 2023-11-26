import React, { useState } from 'react';
import axios from 'axios';

const LoginForm: React.FC<{ onClose: () => void; onLogin: (token: string, email: string) => void }> = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8000/login', {
        email,
        password,
      });

      console.log('Успешный вход', response.data);

      // Обновление чтобы передать email и token
      onLogin(response.data.token, email);

      onClose();
    } catch (error) {
      console.error('Ошибка входа', error);
      setError('Неверная почта или пароль');
    }
  };

  return (
    <div className="LoginForm">
      <h2>Вход</h2>
      <label>Почта:</label>
      <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
      {!isEmailValid && email && <div style={{ color: 'red' }}>Почта должна быть введена в формате: example@example.com</div>}

      <label>Пароль:</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <button onClick={handleLogin} disabled={!isEmailValid || !email || !password}>Войти</button>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default LoginForm;