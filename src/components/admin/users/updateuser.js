import React, { useEffect, useState } from 'react';
import UserCard from './usercard';
import './updateuser.css';
import MenuBar from '../../menumain/menubar';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('https://www.agathiyarpyramid.org/api/users');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();

        const usersWithAccess = data.map(u => ({
          ...u,
          userrole: u.userrole || 'user',
          useraccess: u.useraccess || [],
          usertype: u.usertype || ''
        }));
        setUsers(usersWithAccess);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdate = (index, updatedUser) => {
    setUsers(prev =>
      prev.map((u, i) => (i === index ? { ...u, ...updatedUser } : u))
    );
  };

  if (loading) return <div className="users-container"><p>Loading...</p></div>;
  if (error) return <div className="users-container"><p>Error: {error}</p></div>;

  return (
    <div className="users-container">
        <MenuBar/>
      {users.map((user, index) => (
        <UserCard
          key={user.id || index}
          user={user}
          onSave={updated => handleUpdate(index, updated)}
        />
      ))}
    </div>
  );
};

export default UserList;
