import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import AnimatedCard from '../shared/AnimatedCard';
import PaperStack from '../shared/PaperStack';
import { AuthContainer } from './AuthStyles';
import { AuthTitle } from './AuthStyles';
import { FormGroup } from './AuthStyles';
import { Label } from './AuthStyles';
import { Input } from './AuthStyles';
import { AuthButton, AuthLink, ErrorMessage } from './AuthStyles';
import './auth.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsSubmitting(true);
    
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      // Handle different error formats
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PaperStack />
      <AuthContainer>
        <AnimatedCard>
          <AuthTitle>Welcome to Invoicely Pro</AuthTitle>
          
          {error && (
            <ErrorMessage
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </ErrorMessage>
          )}
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(''); // Clear error when user starts typing
                }}
                required
                placeholder="your@email.com"
                autoComplete="username"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(''); // Clear error when user starts typing
                }}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </FormGroup>
            
            <AuthButton
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </AuthButton>
          </form>
          
          <AuthLink to="/register">
            Don't have an account? <span>Sign Up</span>
          </AuthLink>
        </AnimatedCard>
      </AuthContainer>
    </>
  );
};

export default Login;