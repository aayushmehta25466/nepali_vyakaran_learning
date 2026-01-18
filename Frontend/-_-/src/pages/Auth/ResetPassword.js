import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { resetPassword, forgotPassword } from '../../services/api';

/**
 * RESET PASSWORD PAGE
 * 
 * Purpose: Allow users to reset their password using an OTP code
 * 
 * Flow:
 * 1. User arrives here after requesting a password reset (from ForgotPassword page)
 * 2. User enters the OTP code they received via email
 * 3. User enters their new password (twice for confirmation)
 * 4. System validates OTP and updates the password
 * 5. User is redirected to login page
 * 
 * Backend Endpoint: POST /api/v1/auth/reset-password/
 * Request: { email: string, otp_code: string, new_password: string }
 * Response: { success: true, message: string }
 */

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state (passed from ForgotPassword page)
  const emailFromState = location.state?.email || '';
  
  // Form state
  const [formData, setFormData] = useState({
    email: emailFromState,
    otp_code: '',
    new_password: '',
    confirm_password: '',
  });
  
  // OTP input refs for auto-focus between digits
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Combine OTP digits into single string
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      otp_code: otpDigits.join('')
    }));
  }, [otpDigits]);

  /**
   * Handle OTP digit input
   * Auto-advances to next input field when digit is entered
   */
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // Take only last character
    setOtpDigits(newDigits);
    
    // Auto-advance to next field
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  /**
   * Handle backspace in OTP fields
   * Moves focus to previous field when current is empty
   */
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  /**
   * Handle paste for OTP
   * Allows pasting full OTP code at once
   */
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newDigits = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtpDigits(newDigits);
      otpRefs[Math.min(pastedData.length, 5)].current?.focus();
    }
  };

  /**
   * Handle input changes for email and password fields
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Resend OTP code
   */
  const handleResendOtp = async () => {
    if (resendTimer > 0 || !formData.email) return;
    
    try {
      await forgotPassword(formData.email);
      setResendTimer(60); // 60 second cooldown
      setError('');
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  /**
   * Validate form before submission
   */
  const validateForm = () => {
    if (!formData.email) {
      setError('Please enter your email address.');
      return false;
    }
    
    if (formData.otp_code.length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return false;
    }
    
    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    
    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return false;
    }
    
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // Call reset password API
      await resetPassword({
        email: formData.email,
        otp_code: formData.otp_code,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });
      
      // Show success message
      setSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successful. Please login with your new password.' }
        });
      }, 3000);
      
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        'Invalid or expired OTP. Please request a new code.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <IconWrapper>🔑</IconWrapper>
        <Title>Reset Password</Title>
        <Subtitle>
          Enter the 6-digit code sent to your email and your new password.
        </Subtitle>
        
        {success ? (
          <SuccessBox>
            <SuccessIcon>✅</SuccessIcon>
            <SuccessText>
              Password reset successfully!<br />
              Redirecting to login page...
            </SuccessText>
          </SuccessBox>
        ) : (
          <Form onSubmit={handleSubmit}>
            {/* Email Field (if not provided via state) */}
            {!emailFromState && (
              <InputGroup>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                  disabled={loading}
                />
              </InputGroup>
            )}

            {/* OTP Input */}
            <InputGroup>
              <Label>Verification Code</Label>
              <OtpContainer onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <OtpInput
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    maxLength={1}
                    disabled={loading}
                    autoFocus={index === 0}
                  />
                ))}
              </OtpContainer>
              <ResendRow>
                <HelpText>
                  Didn't receive the code?{' '}
                </HelpText>
                <ResendButton 
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || !formData.email}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </ResendButton>
              </ResendRow>
            </InputGroup>

            {/* New Password */}
            <InputGroup>
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Enter new password (min 8 characters)"
                required
                disabled={loading}
                minLength={8}
              />
            </InputGroup>

            {/* Confirm Password */}
            <InputGroup>
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <Input
                id="confirm_password"
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm your new password"
                required
                disabled={loading}
              />
            </InputGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <SubmitButton type="submit" disabled={loading}>
              {loading ? '🔄 Resetting...' : '🔐 Reset Password'}
            </SubmitButton>
          </Form>
        )}

        <Footer>
          <StyledLink to="/forgot-password">← Request New Code</StyledLink>
          {' | '}
          <StyledLink to="/login">Back to Login</StyledLink>
        </Footer>
      </Card>
    </Container>
  );
};

// ============================================
// STYLED COMPONENTS
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

const OtpContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 10px 0;
`;

const OtpInput = styled.input`
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
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

const ResendRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 5px;
`;

const HelpText = styled.small`
  color: #888;
  font-size: 12px;
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  padding: 0;

  &:hover:not(:disabled) {
    text-decoration: underline;
  }

  &:disabled {
    color: #888;
    cursor: not-allowed;
  }
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

export default ResetPasswordPage;
