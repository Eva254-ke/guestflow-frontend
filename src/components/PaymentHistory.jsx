import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../api/api';

const Wrapper = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 0;
`;
const Title = styled.h2`
  font-size: 22px;
  color: #1565a7;
  margin-bottom: 18px;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
`;
const Th = styled.th`
  background: #f7fafd;
  color: #1565a7;
  font-weight: 700;
  padding: 10px 6px;
  border-bottom: 2px solid #e0e7ef;
`;
const Td = styled.td`
  padding: 8px 6px;
  border-bottom: 1px solid #e0e7ef;
  font-size: 14px;
`;
const Status = styled.span`
  color: ${p => p.status === 'paid' ? '#34b233' : p.status === 'pending' ? '#f9a825' : '#d32f2f'};
  font-weight: 600;
`;

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await api.get('payments/');
        setPayments(resp.data);
      } catch (err) {
        setError('Failed to load payment history.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <Wrapper>
      <Title>Payment History</Title>
      {loading ? <div>Loading...</div> : error ? <div>{error}</div> : (
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Room</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <Td>{new Date(p.created_at || p.timestamp).toLocaleString()}</Td>
                <Td>{p.room_name || p.room || ''}</Td>
                <Td>KES {Number(p.amount).toLocaleString()}</Td>
                <Td><Status status={p.status}>{p.status}</Status></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Wrapper>
  );
};

export default PaymentHistory;
