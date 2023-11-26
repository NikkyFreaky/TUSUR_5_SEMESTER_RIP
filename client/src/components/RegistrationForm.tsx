import React, { useState } from 'react';
import axios from 'axios';

const RegistrationForm: React.FC<{ onClose: () => void; onLogin: (token: string, email: string) => void }> = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegistration = async () => {
    if (!isEmailValid) {
      setError('Почта должна быть введена в формате: example@example.com');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/registration', {
        email,
        password,
      });

      console.log('Успешная регистрация', response.data);
      // Предполагаем, что сервер возвращает объект с полями token и email
      onLogin(response.data.token, email);

      onClose();
    } catch (error) {
      console.error('Ошибка регистрации', error);
      setError('Не удалось зарегистрироваться. Возможно, пользователь с такой почтой уже существует.');
    }
  };

  return (
    <div className="RegistrationForm">
      <h2>Регистрация</h2>
      <label>Почта:</label>
      <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
      {!isEmailValid && email && <div style={{ color: 'red' }}>Почта должна быть введена в формате: example@example.com</div>}

      <label>Пароль:</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <button onClick={handleRegistration} disabled={!isEmailValid || !email || !password}>Зарегистрироваться</button>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default RegistrationForm;