import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { verifyOTP, sendOTP } from '../../services/api';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const checkmark = keyframes`
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 450px;
  overflow: hidden;
  animation: ${css`${fadeIn} 0.6s ease-out`};
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 30px;
  text-align: center;
  color: white;
`;

const IconWrapper = styled.div`
  font-size: 56px;
  margin-bottom: 15px;
  ${props => props.$animating && css`animation: ${pulse} 2s ease-in-out infinite;`}
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
`;

const Content = styled.div`
  padding: 40px 30px;
`;

const StatusMessage = styled.div`
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 12px;
  background: ${props => 
    props.$type === 'success' ? '#d4edda' : 
    props.$type === 'error' ? '#f8d7da' : 
    '#e8f4fd'};
  color: ${props => 
    props.$type === 'success' ? '#155724' : 
    props.$type === 'error' ? '#721c24' : 
    '#0c5460'};
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: ${css`${spin} 1s linear infinite`};
  margin: 0 auto 20px;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4caf50, #8bc34a);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  
  svg {
    width: 40px;
    height: 40px;
    stroke: white;
    stroke-width: 3;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 100;
    animation: ${css`${checkmark} 0.6s ease-out forwards`};
  }
`;

const InfoBox = styled.div`
  background: #f8f9fa;
  border-left: 4px solid #667eea;
  padding: 15px 20px;
  border-radius: 0 8px 8px 0;
  margin: 20px 0;
  font-size: 14px;
  color: #555;
`;

const OTPInput = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 25px 0;
`;

const OTPDigit = styled.input`
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  border: 2px solid ${props => props.$filled ? '#667eea' : '#e0e0e0'};
  border-radius: 12px;
  outline: none;
  transition: all 0.2s ease;
  background: ${props => props.$filled ? '#f0f3ff' : 'white'};
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: #f0f0f0;
    color: #333;
    
    &:hover:not(:disabled) {
      background: #e0e0e0;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResendLink = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 15px;
  
  &:disabled {
    color: #999;
    cursor: not-allowed;
    text-decoration: none;
  }
`;

const LinkButton = styled(Link)`
  display: block;
  text-align: center;
  color: #667eea;
  font-size: 14px;
  margin-top: 20px;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Get email from URL params or from navigation state (after registration)
  const urlEmail = searchParams.get('email') || '';
  const stateEmail = location.state?.email || '';
  const email = urlEmail || stateEmail;
  const urlOtp = searchParams.get('otp') || '';
  const registrationMessage = location.state?.message || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('idle'); // idle, verifying, success, error
  const [message, setMessage] = useState(registrationMessage);
  const [countdown, setCountdown] = useState(0);
  
  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };
  
  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
    
    // Handle Enter to verify
    if (e.key === 'Enter' && otp.every(d => d)) {
      handleVerify(otp.join(''));
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(''));
      // Focus last input
      const lastInput = document.getElementById('otp-5');
      if (lastInput) lastInput.focus();
    }
  };
  
  const handleVerify = useCallback(async (otpCode = otp.join('')) => {
    if (!email) {
      setStatus('error');
      setMessage('Email address is missing. Please request a new verification link.');
      return;
    }
    
    if (otpCode.length !== 6) {
      setStatus('error');
      setMessage('Please enter a valid 6-digit code.');
      return;
    }
    
    setStatus('verifying');
    setMessage('Verifying your email...');
    
    try {
      await verifyOTP(email, otpCode, 'verification');
      setStatus('success');
      setMessage('Your email has been verified successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Email verified! Please log in to continue.' }
        });
      }, 3000);
    } catch (error) {
      setStatus('error');
      const errorCode = error.response?.data?.error?.code;
      const errorMsg = error.response?.data?.error?.message || 
                       error.response?.data?.message ||
                       'Verification failed. Please try again.';
      
      // Handle specific error cases
      if (errorCode === 'USER_NOT_FOUND') {
        setMessage('This email is not registered. Redirecting to sign up...');
        setTimeout(() => {
          navigate('/register');
        }, 2000);
      } else {
        setMessage(errorMsg);
      }
    }
  }, [email, navigate, otp]);
  
  const handleResend = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Email address is missing.');
      return;
    }
    
    try {
      await sendOTP(email, 'verification');
      setMessage('A new verification code has been sent to your email!');
      setStatus('idle');
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
    } catch (error) {
      setStatus('error');
      const errorCode = error.response?.data?.error?.code;
      const errorMsg = error.response?.data?.error?.message || 
                       error.response?.data?.message ||
                       'Failed to resend code. Please try again.';
      
      // Handle specific error cases
      if (errorCode === 'USER_NOT_FOUND') {
        setMessage('This email is not registered. Redirecting to sign up...');
        setTimeout(() => {
          navigate('/register');
        }, 2000);
      } else {
        setMessage(errorMsg);
      }
    }
  };
  
  // Auto-verify if OTP is provided in URL (after handleVerify is defined)
  useEffect(() => {
    if (urlOtp && urlOtp.length === 6 && email) {
      setOtp(urlOtp.split(''));
      handleVerify(urlOtp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlOtp, email]); // handleVerify is stable due to useCallback
  
  const renderContent = () => {
    if (status === 'verifying') {
      return (
        <div style={{ textAlign: 'center' }}>
          <Spinner />
          <p style={{ color: '#666' }}>{message}</p>
        </div>
      );
    }
    
    if (status === 'success') {
      return (
        <div style={{ textAlign: 'center' }}>
          <SuccessIcon>
            <svg viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </SuccessIcon>
          <h2 style={{ color: '#4caf50', marginBottom: '10px' }}>Email Verified! 🎉</h2>
          <p style={{ color: '#666' }}>{message}</p>
          <p style={{ color: '#999', fontSize: '14px', marginTop: '15px' }}>
            Redirecting to login...
          </p>
        </div>
      );
    }
    
    return (
      <>
        {message && (
          <StatusMessage $type={status === 'error' ? 'error' : 'info'}>
            {message}
          </StatusMessage>
        )}
        
        {email && (
          <InfoBox>
            <strong>📧 Verification sent to:</strong><br />
            {email}
          </InfoBox>
        )}
        
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Enter the 6-digit code from your email
        </p>
        
        <OTPInput onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <OTPDigit
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              $filled={!!digit}
              autoFocus={index === 0 && !urlOtp}
            />
          ))}
        </OTPInput>
        
        <Button 
          $primary 
          onClick={() => handleVerify()}
          disabled={!otp.every(d => d)}
        >
          Verify Email
        </Button>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <ResendLink
            onClick={handleResend}
            disabled={countdown > 0}
          >
            {countdown > 0 
              ? `Resend code in ${countdown}s` 
              : "Didn't receive the code? Resend"}
          </ResendLink>
        </div>
        
        <LinkButton to="/login">
          ← Back to Login
        </LinkButton>
      </>
    );
  };
  
  return (
    <Container>
      <Card>
        <Header>
          <IconWrapper $animating={status === 'verifying'}>
            {status === 'success' ? '✅' : '✉️'}
          </IconWrapper>
          <Title>Email Verification</Title>
          <Subtitle>
            {status === 'success' 
              ? 'Your email is now verified!' 
              : 'Complete your registration'}
          </Subtitle>
        </Header>
        
        <Content>
          {renderContent()}
        </Content>
      </Card>
    </Container>
  );
}

export default VerifyEmail;
