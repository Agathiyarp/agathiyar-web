import React, { useEffect, useState } from 'react';
import './bookingconfirmation.css';
import MenuBar from '../../menumain/menubar';
import { toast } from "react-toastify";

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
  const [confirming, setConfirming] = useState(false); // 👈 add loader state

  const userInfo = sessionStorage.getItem('userDetails')
  const userDetails = userInfo ? JSON.parse(userInfo): '';
  const userType = userDetails?.usertype?.trim().toLowerCase() || "";

  const fetchBookings = async () => {
    try {
      setLoading(true);
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
    if (confirming) return; // prevent closing while loading
    setShowModal(false);
    setSelectedBooking(null);
    setActionType('');
  };

  const confirmAction = async () => {
    if (!selectedBooking || !actionType || confirming) return;

    const payload = {
      memberid: selectedBooking.memberid,
      userid: selectedBooking.userid,
      bookingid: selectedBooking.bookingId,
      bookingstatus: actionType,
      totalroomsbooked: selectedBooking.totalroomsbooked,
      creditused: userType !== "user" ? (actionType === 'approved' ? selectedBooking.creditused : 0) : 0,
      startdate: selectedBooking.startdate,
      enddate: selectedBooking.enddate,
    };

    setConfirming(true);

    const id = selectedBooking.bookingId;
    const toastId = `booking-update-${id}-${actionType}`;

    try {
      await toast.promise(
        (async () => {
          const res = await fetch('https://www.agathiyarpyramid.org/api/booking/update-booking-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(text || 'Failed to update status');
          }
          return res.json().catch(() => ({}));
        })(),
        {
          pending: `Updating booking ${id}...`,
          success: `Booking ID ${id} has been ${actionType}.`,
          error: {
            render({ data }) {
              // data is the error thrown
              const msg = data?.message || 'Error updating booking. Please try again.';
              return msg.length > 140 ? msg.slice(0, 140) + '…' : msg;
            }
          }
        },
        { toastId }
      );

      // Refresh and close after success
      await fetchBookings();
      setShowModal(false);
      setSelectedBooking(null);
      setActionType('');
    } catch (err) {
      console.error(err);
      // toast.promise already handled the error toast
    } finally {
      setConfirming(false);
    }
  };

  const handleSearchAndFilter = () => {
    let filtered = bookings;

    if (searchBookingId)
      filtered = filtered.filter(item => item.bookingId?.toString().includes(searchBookingId));

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
        b.bookingId, b.userid, b.username, b.startdate, b.enddate, b.roomname ?? b.destination, b.totalamount, b.totalroomsbooked, b.bookingstatus
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

  const renderActionButtons = (item) => {
    if (item.bookingstatus === 'pending-approval') {
      const disabled = confirming && selectedBooking?.bookingId === item.bookingId;
      return (
        <div className="action-buttons">
          <button
            className="approve-btn"
            onClick={() => openConfirmationModal(item, 'approved')}
            disabled={confirming || showModal} // avoid double-opens
          >
            Approve
          </button>
          <button
            className="reject-btn"
            onClick={() => openConfirmationModal(item, 'rejected')}
            disabled={confirming || showModal}
          >
            Reject
          </button>
        </div>
      );
    }
    return <span style={{ fontStyle: 'italic', color: 'gray' }}>No Actions</span>;
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
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      ) : error ? (
        <div className="loading-container">
          <p className="error">{error}</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-container">
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Created Date</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Booking ID</th>
                <th>Name</th>
                <th>User ID</th>
                <th>User Type</th>
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
                  <td>{item.createddate || '-'}</td>
                  <td>{item.startdate || '-'}</td>
                  <td>{item.enddate || '-'}</td>
                  <td>{item.bookingId || '-'}</td>
                  <td>{item.username || '-'}</td>
                  <td>{item.memberid || '-'}</td>
                  <td>{item.usertype || '-'}</td>
                  <td>{item.destination || item.roomname || '-'}</td>
                  <td>{item.totalamount || '0'}</td>
                  <td>{item.totalroomsbooked || '0'}</td>
                  <td>{item.bookingstatus || '-'}</td>
                  <td>{renderActionButtons(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-header">
            <h3 id="confirm-header" className='confirm-header-text'>
              Confirm {actionType === 'approved' ? 'Approval' : 'Rejection'}
            </h3>
            <p>
              Are you sure you want to <strong>{actionType}</strong> booking ID{' '}
              <strong>{selectedBooking.bookingId}</strong>?
            </p>
            <div className="modal-actions">
              <button
                onClick={confirmAction}
                className="save-btn"
                disabled={confirming}
              >
                {confirming ? (
                  <>
                    <span className="btn-spinner" aria-hidden /> Processing…
                  </>
                ) : (
                  'Yes, Confirm'
                )}
              </button>
              <button onClick={closeModal} className="cancel-btn" disabled={confirming}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmation;
