// src/components/auth/authStyles.js
import styled from 'styled-components';
import { motion } from 'framer-motion';  // Add this import
import { Link } from 'react-router-dom';

export const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }
`;

export const AuthButton = styled(motion.button)`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
`;

export const AuthTitle = styled.h1`
  font-size: 1.75rem;
  color: #2d3748;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;
`;

export const AuthLink = styled(Link)`
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  display: block;
  text-align: center;
  margin-top: 1.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const ErrorMessage = styled.div`
  color: #e53e3e;
  background-color: #fff5f5;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;
