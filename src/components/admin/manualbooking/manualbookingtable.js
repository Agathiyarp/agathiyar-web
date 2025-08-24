import React, { useEffect, useState } from 'react';
import './manualbookingtable.css';

export default function ManualBookingTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  console.log(rows, "rows");

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/manualbooking');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRows(data);
    } catch (e) {
      console.error(e);
      setErr('Failed to load manual bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="manual-booking-table-wrap">
        <h2>Existing Booking</h2>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="manual-booking-table-wrap">
        <h2>Existing Booking</h2>
        <div className="error-container">
          <p className="error-message">{err}</p>
          <button onClick={load} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="manual-booking-table-wrap">
      <div className="table-header">
        <h2>Existing Booking</h2>
        <button 
          onClick={load} 
          className="refresh-btn"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="table-container">
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th style={{width: '20px'}}>Age</th>
                <th>Gender</th>
                <th>Room Type</th>
                <th>Phone</th>
                <th>Email</th>
                <th style={{width: '120px'}}>Start Date</th>
                <th style={{width: '120px'}}>End Date</th>
                <th>Payment</th>
                <th style={{width: '120px'}}>Address</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="no-data">
                    No bookings found
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.id || index}>
                    <td data-label="Full Name">{row.name || '-'}</td>
                    <td data-label="Age">{row.age || '-'}</td>
                    <td data-label="Gender">{row.gender || '-'}</td>
                    <td data-label="Room Type">{row.roomname || '-'}</td>
                    <td data-label="Phone">{row.phone || '-'}</td>
                    <td data-label="Email" className="email-cell">{row.email || '-'}</td>
                    <td data-label="Start Date">{formatDate(row.startdate)}</td>
                    <td data-label="End Date">{formatDate(row.enddate)}</td>
                    <td data-label="Payment">{row.modeOfPayment || '-'}</td>
                    <td data-label="Address" className="address-cell">{row.address || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="table-footer">
          <p className="record-count">Total records: {rows.length}</p>
        </div>
      )}
    </div>
  );
}