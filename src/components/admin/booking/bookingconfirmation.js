import React, { useEffect, useState } from 'react';
import './bookingconfirmation.css';
import MenuBar from '../../menumain/menubar';
import { toast, ToastContainer } from "react-toastify";

const BookingConfirmation = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchBookingId, setSearchBookingId] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState('');

  const userInfo = sessionStorage.getItem('userDetails')
  const userDetails = userInfo ? JSON.parse(userInfo): '';
  const userType = userDetails?.usertype?.trim().toLowerCase() || "";

  const fetchBookings = async () => {
    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data);
      setFilteredBookings(data);
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
      totalroomsbooked: selectedBooking.totalroomsbooked,
      creditused: userType !== "user" ? (actionType === 'approved' ? selectedBooking.creditused : 0) : 0,
      startdate: selectedBooking.startdate,
      enddate: selectedBooking.enddate,
    };

    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/booking/update-booking-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success(`Booking ID ${selectedBooking.id} has been ${actionType}.`, { toastId: 'booking-update-success' });
      await fetchBookings();
    } catch (err) {
      console.error(err);
      alert(`Error updating status for Booking ID ${selectedBooking.id}`);
    } finally {
      closeModal();
    }
  };

  const handleSearchAndFilter = () => {
    let filtered = bookings;

    if (searchBookingId)
      filtered = filtered.filter(item => item.id?.toString().includes(searchBookingId));

    if (searchUserId)
      filtered = filtered.filter(item => item.memberid?.toString().includes(searchUserId));

    if (filterStartDate)
      filtered = filtered.filter(item => new Date(item.startdate) >= new Date(filterStartDate));

    if (filterEndDate)
      filtered = filtered.filter(item => new Date(item.enddate) <= new Date(filterEndDate));

    setFilteredBookings(filtered);
  };

  const exportToCSV = () => {
    const csv = [
      ["BookingID", "UserID", "Username", "StartDate", "EndDate", "RoomName", "Amount", "Rooms", "Status"],
      ...filteredBookings.map(b => [
        b.id, b.userid, b.username, b.startdate, b.enddate, b.roomname, b.totalamount, b.totalroomsbooked, b.bookingstatus
      ])
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="booking-requests-container">
      <MenuBar />
      <h2 className='booking-text'>Booking Confirmation</h2>

      {/* Search and Filter */}
      <div className="filter-section">
        <input
          type="text"
          placeholder="Search Booking ID"
          value={searchBookingId}
          onChange={(e) => setSearchBookingId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search User ID"
          value={searchUserId}
          onChange={(e) => setSearchUserId(e.target.value)}
        />
        <input
          type="date"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
        />
        <input
          type="date"
          value={filterEndDate}
          onChange={(e) => setFilterEndDate(e.target.value)}
        />
        <button className="search-btn" onClick={handleSearchAndFilter}>Search</button>
        <button className="export-btn" onClick={exportToCSV}>Export CSV</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : filteredBookings.length === 0 ? (
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
              <th>Room Name</th>
              <th>Amount</th>
              <th>Rooms</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((item, index) => (
              <tr key={index}>
                <td>{item.startdate ? new Date(item.startdate).toLocaleDateString() : '-'}</td>
                <td>{item.enddate ? new Date(item.enddate).toLocaleDateString() : '-'}</td>
                <td>{item.id || '-'}</td>
                <td>{item.username || '-'}</td>
                <td>{item.memberid || '-'}</td>
                <td>{item.roomname || '-'}</td>
                <td>{item.totalamount || '0'}</td>
                <td>{item.totalroomsbooked || '0'}</td>
                <td>{item.bookingstatus || '-'}</td>
                <td style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {item.bookingstatus === 'pending-approval' ? (
                    <>
                      <button className="approve-btn" onClick={() => openConfirmationModal(item, 'approved')}>
                        Approve
                      </button>
                      <button className="reject-btn" onClick={() => openConfirmationModal(item, 'rejected')}>
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

      <ToastContainer />
    </div>
  );
};

export default BookingConfirmation;
