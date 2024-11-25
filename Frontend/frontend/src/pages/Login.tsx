import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { validateSingleField, ValidationErrors } from '../utils/validators';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const errors: ValidationErrors = {};
    errors.email = validateSingleField('email', email);
    errors.password = validateSingleField('password', password);

    setValidationErrors(errors);

    if (Object.values(errors).some((err) => err)) {
      return; 
    }

    setLoading(true);
    setError(null);

    try {
      const response = await loginUser({ email, password });
      const { access_token, username } = response;

      login(access_token, username);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: 'email' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;

    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);

    
    const error = validateSingleField(field, value);
    setValidationErrors((prev) => ({ ...prev, [field]: error }));
  };

  return (
    <Box sx={{ maxWidth: 400, margin: '0 auto', textAlign: 'center', mt: 10 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Login
      </Typography>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
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
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
      </Button>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Button component={Link} to="/register" variant="text" color="primary">
            Register here
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
