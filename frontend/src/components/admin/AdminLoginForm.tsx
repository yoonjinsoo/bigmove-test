import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styled from 'styled-components';

const AdminLoginContainer = styled.div`
  max-width: 400px;
  margin: 80px auto 2rem;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: var(--dark-gray);
  color: var(--light-gray);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid var(--medium-gray);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--light-gray);
  color: var(--dark-gray);
`;

const Button = styled.button`
  padding: 0.8rem;
  background-color: var(--cyan);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: var(--dark-cyan);
  }
`;

const ErrorMessage = styled.p`
  color: var(--orange);
  margin-top: 1rem;
`;

const AdminLoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const credentials = { email, password };
      await adminLogin.mutateAsync(credentials);
    } catch (err) {
      setError('로그인에 실패했습니다.');
    }
  };

  return (
    <AdminLoginContainer>
      <h1>관리자 로그인</h1>
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit">로그인</Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </AdminLoginContainer>
  );
};

export default AdminLoginForm; 