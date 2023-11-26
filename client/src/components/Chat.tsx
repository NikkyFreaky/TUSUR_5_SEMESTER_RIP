// Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatProps {
  username: string;
  onClose: () => void;
}

interface ChatMessage {
  event: 'message' | 'connection';
  data: string;
}

const Chat: React.FC<ChatProps> = ({ username, onClose }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);

  // Get the current user's email from local storage
  const currentUserEmail = localStorage.getItem('email'); // Now we are using it

  useEffect(() => {
    socketRef.current = io('http://localhost:8080');
    
    socketRef.current.on('message', (message: ChatMessage) => {
      if (message && message.data) {
        // Предположим, что данные сообщения приходят в виде 'email: текст сообщения'.
        const parsedMessage = message.data.includes(':') 
          ? message.data 
          : `Аноним: ${message.data}`; // Добавляем 'Аноним', если email отсутствует
        setMessages((prevMessages) => [...prevMessages, parsedMessage]);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() !== '') {
      // Получаем email из localStorage. Если email нет, используем placeholder.
      const email = localStorage.getItem('email') || 'Аноним2';
      console.log(localStorage.getItem('email'))
      const messageObject = {
        event: 'message',
        data: `${email}: ${inputMessage}`
      };
      socketRef.current?.emit('message', messageObject);
      setInputMessage('');
    }
  };
  return (
    <div className="chat-container">
      <div className="chat-header">
        {/* <span>Чат</span> */}
        <button onClick={onClose} className="close-chat">  
          <img src="close.png" height={10} alt="Описание картинки" />
        </button>
      </div>
      <div className="chat-messages">
  {messages.map((message, index) => {
    // Разделяем сообщение на имя пользователя и текст
    const separatorIndex = message.indexOf(':');
    const messageUsername = message.substring(0, separatorIndex);
    const messageText = message.substring(separatorIndex + 1).trim(); // Убираем лишние пробелы
    const isOutgoing = currentUserEmail === messageUsername; // Сравниваем с email текущего пользователя

    const messageClasses = `chat-message ${isOutgoing ? 'outgoing' : 'incoming'}`;

    return (
      <div key={index} className={messageClasses}>
        {/* Отображаем имя пользователя только если сообщение не исходящее */}
        {!isOutgoing && <div className="chat-message-username">{messageUsername}</div>}
        <div className="message-content">{messageText}</div>
      </div>
    );
  })}
</div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Написать сообщение..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Отправить</button>
      </div>
    </div>
  );
};

export default Chat;