import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import AnimatedCard from '../shared/AnimatedCard';
import PaperStack from '../shared/PaperStack';
import {
  AuthContainer,
  FormGroup,
  Label,
  Input,
  AuthButton,
  AuthTitle,
  AuthLink,
  ErrorMessage
} from './AuthStyles';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    address: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const [success, setSuccess] = useState(false); // Add success state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await register(formData);
        
        if (!result.success) {
          setError(result.error);
        } else {
          setSuccess(true);
          // Optionally auto-redirect after delay
          setTimeout(() => navigate('/login'), 3000);
        }
      };
    
      if (success) {
        return (
          <AuthContainer>
            <AnimatedCard>
              <AuthTitle>Registration Successful!</AuthTitle>
              <p>You can now login with your credentials</p>
              <AuthLink to="/login">Go to Login</AuthLink>
            </AnimatedCard>
          </AuthContainer>
        );
      }
    

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      // Handle both string errors and Error objects
      const errorMessage = typeof err === 'string' 
        ? err 
        : err.message || 'Registration failed. Please try again.';
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
          <AuthTitle>Create Your Account</AuthTitle>
          
          {error && (
            <ErrorMessage>
              {typeof error === 'object' ? error.message : error}
            </ErrorMessage>
          )}
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                minLength="6"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Company Name</Label>
              <Input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Acme Inc."
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Business Address</Label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="123 Business St, City"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Phone (Optional)</Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </FormGroup>
            
            <AuthButton
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </AuthButton>
          </form>
          
          <AuthLink to="/login">
            Already have an account? <span>Sign In</span>
          </AuthLink>
        </AnimatedCard>
      </AuthContainer>
    </>
  );
};

export default Register;