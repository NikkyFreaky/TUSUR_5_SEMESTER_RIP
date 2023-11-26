import React, { useState } from 'react';
import '../styles/style.css';

const BookingForm: React.FC<{ addBooking: (booking: any) => void; fetchBookings: () => void }> = ({ addBooking, fetchBookings }) => {
  
  const [guest_name, setGuestName] = useState('');
  const [room_num, setRoomNum] = useState('');
  const [checkin_date, setCheckinDate] = useState('');
  const [checkout_date, setCheckoutDate] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking = {
      guest_name: guest_name,
      room_num: room_num,
      checkin_date: checkin_date,
      checkout_date: checkout_date,
    };

    try {
      const response = await fetch('http://localhost:8000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBooking),
      });

      if (response.ok) {
        setGuestName('');
        setRoomNum('');
        setCheckinDate('');
        setCheckoutDate('');

        fetchBookings();
      } else {
        console.error('Ошибка создания брони.');
      }
    } catch (error) {
      console.error('Ошибка создания брони:', error);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Имя гостя"
          value={guest_name}
          onChange={(e) => setGuestName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Номер комнаты"
          value={room_num}
          onChange={(e) => setRoomNum(e.target.value)}
          required
        />
        <input
          type="date"
          placeholder="Дата заезда"
          value={checkin_date}
          onChange={(e) => setCheckinDate(e.target.value)}
          required
        />
        <input
          type="date"
          placeholder="Дата выезда"
          value={checkout_date}
          onChange={(e) => setCheckoutDate(e.target.value)}
          required
        />
        <button type="submit">Создать</button>
      </form>
    </div>
  );
};

export default BookingForm;