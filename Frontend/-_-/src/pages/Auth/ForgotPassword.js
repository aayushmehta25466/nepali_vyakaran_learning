import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { forgotPassword } from '../../services/api';

/**
 * FORGOT PASSWORD PAGE
 * 
 * Purpose: Allow users to request a password reset via email OTP
 * 
 * Flow:
 * 1. User enters their email address
 * 2. System sends an OTP (One-Time Password) to that email
 * 3. User is redirected to Reset Password page to enter OTP and new password
 * 
 * Backend Endpoint: POST /api/v1/auth/forgot-password/
 * Request: { email: string }
 * Response: { success: true, message: string }
 */

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  /**
   * Handle form submission
   * 
   * Steps:
   * 1. Validate email format
   * 2. Call forgot password API
   * 3. If successful, show success message and redirect
   * 4. If failed, show error message
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic email validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      // Call the forgot password API
      await forgotPassword(email);
      
      // Show success message
      setSuccess(true);
      
      // Redirect to reset password page after 2 seconds
      // Pass email as state so reset page knows which email to use
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
      
    } catch (err) {
      // Even if user doesn't exist, backend returns success for security
      // So errors here are actual system errors
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        'Unable to process request. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <IconWrapper>🔐</IconWrapper>
        <Title>Forgot Password?</Title>
        <Subtitle>
          No worries! Enter your email and we'll send you a reset code.
        </Subtitle>
        
        {success ? (
          <SuccessBox>
            <SuccessIcon>✅</SuccessIcon>
            <SuccessText>
              If an account exists with this email, you will receive a password reset OTP.
              Redirecting to reset page...
            </SuccessText>
          </SuccessBox>
        ) : (
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={loading}
                autoFocus
              />
              <HelpText>
                Enter the email address associated with your account
              </HelpText>
            </InputGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <SubmitButton type="submit" disabled={loading}>
              {loading ? '🔄 Sending...' : '📧 Send Reset Code'}
            </SubmitButton>
          </Form>
        )}

        <Footer>
          Remember your password?{' '}
          <StyledLink to="/login">Back to Login</StyledLink>
        </Footer>
      </Card>
    </Container>
  );
};

// ============================================
// STYLED COMPONENTS
// Following the same design pattern as Login page
// ============================================

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const IconWrapper = styled.div`
  font-size: 48px;
  margin-bottom: 10px;
`;

const Title = styled.h1`
  font-size: 28px;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0 0 30px 0;
  font-size: 14px;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const HelpText = styled.small`
  color: #888;
  font-size: 12px;
`;

const ErrorMessage = styled.div`
  padding: 12px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
  text-align: center;
`;

const SuccessBox = styled.div`
  padding: 20px;
  background-color: #e8f5e9;
  border: 1px solid #a5d6a7;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const SuccessIcon = styled.div`
  font-size: 36px;
  margin-bottom: 10px;
`;

const SuccessText = styled.p`
  color: #2e7d32;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
`;

const SubmitButton = styled.button`
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 25px;
  font-size: 14px;
  color: #666;
`;

const StyledLink = styled(Link)`
  color: #667eea;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

export default ForgotPasswordPage;
