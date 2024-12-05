// src/components/Auth/Login.jsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', formData);
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        socket.connect();
        socket.emit('userConnected', data.userId);
        navigate('/chat');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleLogin} sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      <TextField
        fullWidth
        label="Email"
        margin="normal"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      <TextField
        fullWidth
        type="password"
        label="Password"
        margin="normal"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
      />
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
        Login
      </Button>
      <Button component={Link} to="/register" fullWidth sx={{ mt: 1 }}>
        Need an account? Register
      </Button>
    </Box>
  );
};

export default Login;