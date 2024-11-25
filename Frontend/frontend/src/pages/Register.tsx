import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { validateFields, validateSingleField, ValidationErrors } from '../utils/validators';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const navigate = useNavigate();

  const handleRegister = async () => {
    const errors = validateFields(username, email, password);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await registerUser({ username, email, password });
      alert('Registration successful! Please log in.');
      navigate('/');
    } catch (err: any) {
      if (Array.isArray(err.response?.data?.detail)) {
        const errorMessages = err.response.data.detail.map((d: any) => d.msg).join(', ');
        setError(errorMessages);
      } else if (typeof err.response?.data?.detail === 'string') {
        setError(err.response.data.detail);
      } else {
        setError('An error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: 'username' | 'email' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;

    // Actualiza el estado del campo correspondiente
    if (field === 'username') setUsername(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);

    // Validación en tiempo real
    const error = validateSingleField(field, value);
    setValidationErrors((prev) => ({ ...prev, [field]: error }));
  };

  return (
    <Box sx={{ maxWidth: 400, margin: '0 auto', textAlign: 'center', mt: 10 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Register
      </Typography>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <TextField
        label="Username"
        fullWidth
        sx={{ mb: 2 }}
        value={username}
        onChange={handleChange('username')}
        error={!!validationErrors.username}
        helperText={validationErrors.username || ''}
      />
      <TextField
        label="Email"
        type="email"
        fullWidth
        sx={{ mb: 2 }}
        value={email}
        onChange={handleChange('email')}
        error={!!validationErrors.email}
        helperText={validationErrors.email || ''}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        sx={{ mb: 2 }}
        value={password}
        onChange={handleChange('password')}
        error={!!validationErrors.password}
        helperText={validationErrors.password || ''}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
      </Button>
    </Box>
  );
};

export default Register;

