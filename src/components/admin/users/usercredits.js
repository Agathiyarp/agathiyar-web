import React, { useEffect, useState } from 'react';
import './usercredits.css';
import MenuBar from '../../menumain/menubar';

const UserCredits = () => {
  const [creditsList, setCreditsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newCredit, setNewCredit] = useState('');
  const [updateReason, setUpdateReason] = useState('');
  const fetchCredits = async () => {
    try {
      const res = await fetch('https://www.agathiyarpyramid.org/api/users');
      if (!res.ok) throw new Error('Failed to fetch credits');
      const data = await res.json();
      setCreditsList(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load user credits.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCredits();
  }, []);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setNewCredit(user.credits ?? 0);
    setShowModal(true);
    setUpdateReason('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setNewCredit('');
    setUpdateReason('');
  };

  const handleUpdateCredit = async () => {
    if (!selectedUser || newCredit === '') return;
    try {
      const res = await fetch(
        `https://www.agathiyarpyramid.org/api/update-credits/${selectedUser.usermemberid}`,
        {
          method: 'POST', // or 'PUT'
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            credits: Number(newCredit), 
            creditmodifyreason: updateReason,
            creditmodifiedate: new Date().toISOString()
          }),
        }
      );
      if (!res.ok) throw new Error('Failed to update credits');

      // Update local state
      fetchCredits();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Error updating credits');
    }
  };

  return (
    <div className="user-credits-container">
      <MenuBar />
      <h2>User Credits</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : creditsList.length === 0 ? (
        <p>No credits found.</p>
      ) : (
        <table className="user-credits-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>User ID</th>
              <th>Credits</th>
              <th>Modified Date</th>
              <th>Modifed Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {creditsList.map((item, index) => (
              <tr key={index}>
                <td>{item.name || '-'}</td>
                <td>{item.usermemberid || '-'}</td>
                <td>{item.credits ?? 0}</td>
                <td>
                  {item.creditmodifiedate
                    ? new Date(item.creditmodifiedate).toLocaleDateString()
                    : '-'}
                </td>
                <td>{item.creditmodifyreason || '-'}</td>
                <td>
                  <button className="update-btn" onClick={() => handleOpenModal(item)}>
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className='update-credit-text'>Update Credits</h3>
            <p>
              <strong>{selectedUser.name}</strong> ({selectedUser.usermemberid})
            </p>
            <input
              type="number"
              min={0}
              value={newCredit}
              onChange={(e) => setNewCredit(e.target.value)}
              placeholder="Enter new credit value"
            />
            <textarea
              rows="3"
              value={updateReason}
              onChange={(e) => setUpdateReason(e.target.value)}
              placeholder="Enter reason for update"
              className="reason-textarea"
            />
            {updateReason.trim() === '' && (
              <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                Reason is required to proceed.
              </p>
            )}
            <div className="modal-actions-1">
              <button onClick={handleUpdateCredit} disabled={updateReason.trim() === ''} className="save-btn">Save</button>
              <button onClick={handleCloseModal} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCredits;
