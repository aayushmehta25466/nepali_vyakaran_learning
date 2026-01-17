import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

/**
 * LOGIN PAGE
 * 
 * Purpose: Let users log in to access protected features
 * 
 * What it does:
 * 1. Show email and password form
 * 2. On submit, call login() from AuthContext
 * 3. If successful, redirect to home page
 * 4. If failed, show error message
 */

const LoginPage = () => {
  // useNavigate hook from react-router to redirect after login
  const navigate = useNavigate();
  
  // Get login function from AuthContext
  const { login } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '', // Backend expects 'email' field (but accepts username or email)
    password: '',
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle input changes
   * 
   * Updates formData state when user types in input fields
   * 
   * Example:
   * User types "john@example.com" in email field
   * → name = "email", value = "john@example.com"
   * → setFormData({ ...formData, email: "john@example.com" })
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle form submission
   * 
   * Steps:
   * 1. Prevent default form submission (which would reload page)
   * 2. Clear any previous errors
   * 3. Set loading = true (show spinner)
   * 4. Try to login
   * 5. If success → redirect to home
   * 6. If fail → show error message
   * 7. Set loading = false
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError('');
    setLoading(true);

    try {
      // Call login from AuthContext
      await login(formData);
      
      // Login successful - redirect to home
      navigate('/');
    } catch (err) {
      // Login failed - show error
      setError(
        err.response?.data?.detail || 
        err.response?.data?.non_field_errors?.[0] ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      // Always set loading to false when done
      setLoading(false);
    }
  };

  return (
    <Container>
      <LoginCard>
        <Title>नमस्ते! 🙏</Title>
        <Subtitle>Welcome to Nepali Vyakaran Learning</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">Username or Email</Label>
            <Input
              id="email"
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="username or your.email@example.com"
              required
              disabled={loading}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
            <ForgotLink to="/forgot-password">Forgot password?</ForgotLink>
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? '🔄 Logging in...' : '🔐 Login'}
          </SubmitButton>
        </Form>

        <Footer>
          Don't have an account?{' '}
          <StyledLink to="/register">Create one here</StyledLink>
        </Footer>
      </LoginCard>
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

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 36px;
  margin: 0 0 10px 0;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin: 0 0 30px 0;
  font-size: 14px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  padding: 12px 16px;
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

const ErrorMessage = styled.div`
  padding: 12px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
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
  margin-top: 20px;
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

const ForgotLink = styled(Link)`
  color: #667eea;
  text-decoration: none;
  font-size: 13px;
  text-align: right;
  margin-top: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

export default LoginPage;
