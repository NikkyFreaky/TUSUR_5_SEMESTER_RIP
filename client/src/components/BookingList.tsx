import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/style.css';

type Booking = {
  id: number;
  guest_name: string;
  room_num: string;
  checkin_date: Date;
  checkout_date: Date;
};

type BookingListProps = {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  isLoggedIn: boolean;
};

const BookingList: React.FC<BookingListProps> = ({ bookings, setBookings, isLoggedIn }) => {

  const [editId, setEditId] = useState<number | null>(null);
  const [selectedField, setSelectedField] = useState<keyof Booking>('guest_name');
  const [editedValue, setEditedValue] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:8000/bookings');
        setBookings(response.data);
      } catch (error) {
        console.error('Ошибка получения данных', error);
      }
    };

    fetchBookings();
  }, [setBookings]);

  const handleEdit = (id: number) => {
    setEditId(id);
  };

  const handleSave = async (id: number) => {
    try {
      const bookingToUpdate = bookings.find((booking) => booking.id === id);
      if (bookingToUpdate) {
        let updatedValue: string | Date | null;
  
        if (selectedField === 'checkin_date' || selectedField === 'checkout_date') {
          updatedValue = editedValue !== null ? new Date(editedValue) : null;
        } else {
          updatedValue = editedValue !== null ? String(editedValue) : null;
        }
  
        const updatedBooking = {
          ...bookingToUpdate,
          [selectedField]: updatedValue,
        };
  
        await axios.put(`http://localhost:8000/bookings/${id}`, updatedBooking, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        const response = await axios.get('http://localhost:8000/bookings');
        setBookings(response.data);
        setEditId(null);
        setEditedValue(null);
      }
    } catch (error) {
      console.error('Ошибка обновления данных', error);
    }
  };
          
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/bookings/${id}`);
      const response = await axios.get('http://localhost:8000/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Ошибка удаления данных', error);
    }
  };
  
  return (
    <div className='results-container'>
      <h2>Список броней</h2>
      <table>
        <thead>
          <tr>
            <th>Имя гостя</th>
            <th>Номер комнаты</th>
            <th>Дата заезда</th>
            <th>Дата выезда</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {bookings &&
            bookings.map((booking) => (
              <tr key={booking.id}>
                {editId === booking.id ? (
                  <>
                    <td>
                      <select
                        value={selectedField}
                        onChange={(e) => setSelectedField(e.target.value as keyof Booking)}
                      >
                        <option value="guest_name">Имя гостя</option>
                        <option value="room_num">Номер комнаты</option>
                        <option value="checkin_date">Дата заезда</option>
                        <option value="checkout_date">Дата выезда</option>
                      </select>
                    </td>
                    <td>
                      {selectedField === 'checkin_date' || selectedField === 'checkout_date' ? (
                        <input
                          type="date"
                          value={editedValue !== null ? editedValue : booking[selectedField].toString().split('T')[0]}
                          onChange={(e) => setEditedValue(e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          value={editedValue !== null ? editedValue : booking[selectedField]}
                          onChange={(e) => setEditedValue(e.target.value)}
                        />
                      )}
                    </td>
                    <td colSpan={3}>
                      {isLoggedIn && editId === booking.id ? (
                        <button className='save-btn' onClick={() => handleSave(booking.id)}>Сохранить</button>
                      ) : null}
                    </td>
                  </>
                ) : (
                  <>
                    <td>{booking.guest_name}</td>
                    <td>{booking.room_num}</td>
                    <td>{new Date(booking.checkin_date).toLocaleDateString()}</td>
                    <td>{new Date(booking.checkout_date).toLocaleDateString()}</td>
                    <td>
                      {isLoggedIn ? (
                        <button onClick={() => handleEdit(booking.id)}>Редактировать</button>
                      ) : null}
                      {isLoggedIn ? (
                        <button onClick={() => handleDelete(booking.id)}>Удалить</button>
                      ) : null}
                    </td>
                  </>
                )}
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingList;