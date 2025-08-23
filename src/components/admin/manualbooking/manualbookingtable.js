import React, { useEffect, useState } from 'react';

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

  return (
    <div className="manual-booking-table-wrap">
      <h2>Existing Booking</h2>

      <div className="table-scroll">
        <table className="admin-green-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>RoomType</th>
              <th>Phone</th>
              <th>Email</th>
              <th>startDate</th>
              <th>endDate</th>
              <th>Mode of Payment</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>No data</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name || '-'}</td>
                <td>{r.age || '-'}</td>
                <td>{r.gender || '-'}</td>
                <td>{r.roomname || '-'}</td>
                <td>{r.phone || '-'}</td>
                <td>{r.email || '-'}</td>
                <td>{r.startdate || '-'}</td>
                <td>{r.enddate || '-'}</td>
                <td>{r.modeOfPayment || '-'}</td>
                <td>{r.address || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}