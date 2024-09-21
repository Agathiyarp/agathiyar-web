import React, { useState } from 'react';
import axios from 'axios';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MenuIntroduction from './components/menu/menu';
import './App.css'
import mainlogo from './images/mainlogo.png'
import Slider from './components/slider/slider';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    await axios.post('http://localhost:8081/register', { username, password });
  };

  const handleLogin = async () => {
    await axios.post('http://localhost:8081/login', { username, password });
  };

  const handleLogout = async () => {
    await axios.post('http://localhost:8081/logout');
  };

  return (
    <div>
      <div class='main-container'>
        <div class="image-container">
          <img class='logo-image' src={mainlogo}/>
          <div class='title'>
            <h2 class='align-center m-30'>AGATHIYAR PYRAMID</h2>
            <h2 class='align-center'>DHYANA ASHRAM</h2>
            <h4 class='align-center m-0'>Mounam - Dhyanam - Gnanam</h4>
          </div>
        </div>
        <MenuIntroduction/>
        <div class='account-icon'>
          <AccountCircleIcon/>
        </div>
      </div>
      
      <div>
        <div>
          <Slider />
        </div>
      {/* <Stack direction="row" spacing={2}>
        <Button>WORKSHOP LOGIN</Button>
      </Stack> */}
      </div>
      {/* <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button> */}
    </div>
  );
}

export default App;
