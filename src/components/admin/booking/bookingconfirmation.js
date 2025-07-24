import React, { useEffect, useState } from 'react';
import './bookingconfirmation.css';
import MenuBar from '../../menumain/menubar';
import { toast, ToastContainer } from "react-toastify";

const BookingConfirmation = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState('');

  const fetchBookings = async () => {
      try {
        const res = await fetch('https://www.agathiyarpyramid.org/api/bookings');
        if (!res.ok) throw new Error('Failed to fetch bookings');
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load booking data.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openConfirmationModal = (booking, status) => {
    setSelectedBooking(booking);
    setActionType(status);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setActionType('');
  };

  const confirmAction = async () => {
    if (!selectedBooking || !actionType) return;

    const payload = {
      memberid: selectedBooking.memberid,
      userid: selectedBooking.userid,
      bookingid: selectedBooking.id,
      bookingstatus: actionType,
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

      toast.success(`Booking ID ${selectedBooking.id} has been ${actionType}.`,  {
        toastId: 'booking-update-success',
      });
      await fetchBookings();
    } catch (err) {
      console.error(err);
      alert(`Error updating status for Booking ID ${selectedBooking.id}`);
    } finally {
      closeModal();
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
              <th>Status</th>
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
                <td>{item.bookingstatus || '-'}</td>
                <td style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   {item.bookingstatus === 'pending-approval' ? (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => openConfirmationModal(item, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => openConfirmationModal(item, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span style={{ fontStyle: 'italic', color: 'gray' }}>No Actions</span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className='confirm-header-text'>Confirm {actionType === 'approved' ? 'Approval' : 'Rejection'}</h3>
            <p>Are you sure you want to <strong>{actionType}</strong> booking ID <strong>{selectedBooking.id}</strong>?</p>
            <div className="modal-actions">
              <button onClick={confirmAction} className="save-btn">Yes, Confirm</button>
              <button onClick={closeModal} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmation;
