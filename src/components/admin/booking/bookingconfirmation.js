import React, { useEffect, useState } from 'react';
import './bookingconfirmation.css';
import MenuBar from '../../menumain/menubar';

const BookingConfirmation = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('https://www.agathiyarpyramid.org/api/bookings');
        if (!res.ok) throw new Error('Failed to fetch bookings');
        const data = await res.json();
        console.log(data);
        setBookings(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load booking data.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleAction = async (booking, status) => {
    const payload = {
      memberid: booking.memberid,
      userid: booking.userid,
      bookingid: booking.id,
      bookingstatus: status,
    };

    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/booking/update-booking-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update status');

      alert(`Booking ID ${booking.id} has been ${status}.`);

      // Optionally: remove it from list or refresh
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: status } : b
        )
      );
    } catch (err) {
      console.error(err);
      alert(`Error updating status for Booking ID ${booking.id}`);
    }
  };

  return (
    <div className="booking-requests-container">
      <MenuBar />
      <h2 className='booking-text'>Booking Confirmation</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table className="booking-table">
          <thead>
            <tr>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Booking ID</th>
              <th>Name</th>
              <th>User ID</th>
              <th>Destination</th>
              <th>Amount</th>
              <th>Rooms</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((item, index) => (
              <tr key={index}>
                <td>{item.startdate ? new Date(item.startdate).toLocaleDateString() : '-'}</td>
                <td>{item.enddate ? new Date(item.enddate).toLocaleDateString() : '-'}</td>
                <td>{item.id || '-'}</td>
                <td>{item.username || '-'}</td>
                <td>{item.memberid || '-'}</td>
                <td>{item.destination || '-'}</td>
                <td>{item.totalamount || '0'}</td>
                <td>{item.totalrooms || '0'}</td>
                <td style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    className="approve-btn"
                    onClick={() => handleAction(item, 'approved')}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleAction(item, 'rejected')}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookingConfirmation;
