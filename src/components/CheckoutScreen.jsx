import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { initiateMpesaStkPush, fetchPayments } from '../api/api';

// HEADER STYLES
const HeaderBar = styled.div`
  width: 100%;
  background: #1565a7;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 14px;
  border-radius: 0;
  margin-bottom: 0;
  box-sizing: border-box;
  min-width: 0;
  @media (max-width: 480px) {
    height: 40px;
    padding: 0 6px;
  }
`;
const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;
const HeaderTitle = styled.span`
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  @media (max-width: 480px) {
    font-size: 15px;
  }
`;
const HeaderIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const HeaderButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 22px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  transition: background 0.12s;
  &:hover, &:focus {
    background: rgba(255,255,255,0.13);
    outline: none;
  }
  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: 19px;
  }
`;

// LOGO AND TITLE STYLES
const MpesaLogo = styled.img`
  width: 60px;
  margin-bottom: 8px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  @media (max-width: 480px) {
    width: 48px;
    margin-bottom: 6px;
  }
`;
const Title = styled.h2`
  font-size: 19px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #1565a7;
  text-align: center;
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;
const SubTitle = styled.div`
  font-size: 13px;
  color: #444;
  margin-bottom: 12px;
  text-align: center;
  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 10px;
  }
`;

// DETAILS CARD STYLES
const DetailsCard = styled.div`
  width: 100%;
  background: #f7fafd;
  border-radius: 8px;
  padding: 10px 8px 4px 8px;
  margin-bottom: 12px;
  font-size: 13px;
  box-shadow: 0 1px 2px rgba(21,101,167,0.04);
  @media (max-width: 480px) {
    padding: 8px 4px 2px 4px;
    font-size: 12px;
  }
`;
const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`;
const Label = styled.div`
  color: #888;
  font-size: 12px;
`;
const Value = styled.div`
  color: #222;
  font-weight: 500;
  font-size: 12px;
`;

// CHECKOUT STYLES
const PhoneInput = styled.input`
  width: 100%;
  border: 1.2px solid #b0c4d6;
  border-radius: 6px;
  padding: 9px 7px;
  font-size: 14px;
  margin-bottom: 10px;
  outline: none;
  transition: border 0.2s;
  &:focus {
    border-color: #1565a7;
  }
  @media (max-width: 480px) {
    font-size: 13px;
    padding: 8px 5px;
  }
`;
const PayButton = styled.button`
  width: 100%;
  background: #34b233;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 700;
  padding: 10px 0;
  margin-top: 2px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:disabled {
    background: #b0c4b0;
    cursor: not-allowed;
  }
  @media (max-width: 480px) {
    font-size: 13px;
    padding: 8px 0;
  }
`;
const StatusMsg = styled.p`
  margin-top: 8px;
  color: ${props => props.success ? '#34b233' : '#d32f2f'};
  font-weight: 600;
  text-align: center;
  font-size: 13px;
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;
const AmountNotice = styled.div`
  width: 100%;
  background: #eafbe7;
  color: #228b22;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  padding: 7px 0;
  margin-bottom: 10px;
  text-align: center;
  border: 1.2px solid #b6e2c1;
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 6px 0;
    margin-bottom: 8px;
  }
`;
const ContentWrapper = styled.div`
  padding: 18px 0 14px 0;
  width: 100%;
  max-width: 410px;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 0;
  overflow-x: hidden;
  @media (max-width: 480px) {
    max-width: 100vw;
    padding: 12px 2vw 10px 2vw;
  }
`;

const CheckoutScreen = ({
  selectedDates,
  adults,
  children,
  room,
  onBack,
  onLangClick,
  onClose,
}) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [polling, setPolling] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const pollTimeout = useRef(null);
  const amount = room.total_price || room.base_price || 0;

  // Poll payment status by fetching latest payments and matching checkoutRequestId
  const pollPaymentStatus = async (checkoutId, attempt = 0) => {
    if (!checkoutId || attempt > 30) { // 2min max (4s interval)
      setPolling(false);
      return;
    }
    try {
      const payments = await fetchPayments();
      const payment = payments.find(p => p.mpesa_checkout_request_id === checkoutId);
      if (payment) {
        if (payment.status === 'paid') {
          setStatus('Payment successful! Your booking is confirmed.');
          setPolling(false);
          return;
        } else if (payment.status === 'failed') {
          setStatus('Payment failed. Please try again.');
          setPolling(false);
          return;
        }
      }
    } catch (e) {
      // Ignore polling errors, try again
    }
    pollTimeout.current = setTimeout(() => pollPaymentStatus(checkoutId, attempt + 1), 4000);
  };

  const handlePay = async () => {
    if (!phone || phone.length < 10) {
      setStatus('Please enter a valid phone number.');
      return;
    }
    // Format phone number to 2547XXXXXXXX for M-Pesa
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.replace(/^\+/, '');
    }
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    }
    if (!/^2547\d{8}$/.test(formattedPhone)) {
      setStatus('Phone number must be in the format 07XXXXXXXX or 2547XXXXXXXX.');
      return;
    }
    // Check for required backend fields
    const rentalSlug = room.rental_slug || room.rentalSlug || room.rental || '';
    const roomId = room.id;
    if (!rentalSlug || !roomId) {
      setStatus('Internal error: Room or rental information missing. Please try again or contact support.');
      console.error('Missing rental_slug or room_id', { room });
      return;
    }
    setLoading(true);
    setStatus('');
    setCheckoutRequestId(null);
    setPolling(false);
    const payload = {
      phone: formattedPhone,
      amount,
      rental_slug: rentalSlug,
      room_id: roomId,
      account_ref: room.name || 'Room',
      transaction_desc: `Booking for ${room.name}`,
    };
    console.log('Initiating M-Pesa STK Push with payload:', payload);
    try {
      const resp = await initiateMpesaStkPush(payload);
      if (resp && resp.CheckoutRequestID) {
        setCheckoutRequestId(resp.CheckoutRequestID);
        setStatus('STK Push sent! Please complete payment on your phone.');
        setPolling(true);
        pollPaymentStatus(resp.CheckoutRequestID);
      } else if (resp && resp.status && resp.status.toLowerCase().includes('success')) {
        setStatus('Success! Please complete payment on your phone.');
      } else if (resp && resp.message) {
        setStatus(resp.message);
      } else {
        setStatus('Payment initiated. Please check your phone.');
      }
    } catch (err) {
      // Show backend error details if available
      const backendMsg = err?.response?.data?.error || err?.response?.data?.message || err?.response?.data?.safaricom_response;
      setStatus(backendMsg || err?.message || 'Failed to initiate payment. Please try again.');
      console.error('Payment error:', err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      if (pollTimeout.current) clearTimeout(pollTimeout.current);
    };
  }, []);

  return (
    <>
      <HeaderBar>
        <HeaderLeft>
          <HeaderButton aria-label="Back" onClick={onBack}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </HeaderButton>
          <HeaderTitle>CHECKOUT</HeaderTitle>
        </HeaderLeft>
        <HeaderIcons>
          <HeaderButton aria-label="Change language" onClick={onLangClick}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M2.5 12h19M12 2.5c2.5 2.5 2.5 16.5 0 19M12 2.5c-2.5 2.5-2.5 16.5 0 19" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </HeaderButton>
          <HeaderButton aria-label="Close" onClick={onClose}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </HeaderButton>
        </HeaderIcons>
      </HeaderBar>
      <ContentWrapper>
        <MpesaLogo src="https://i.ibb.co/Z18GSSs5/Lipa-na-mpesa.webp" alt="Lipa na M-Pesa" />
        <Title>Checkout</Title>
        <SubTitle>
          Enter your M-Pesa number to receive an STK push and complete your booking.
        </SubTitle>
        <AmountNotice>
          Amount to be deducted: <span style={{fontWeight:700}}>
            KES {Number(amount).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
          </span>
        </AmountNotice>
        <DetailsCard>
          <DetailRow>
            <Label>Room</Label>
            <Value>{room.name}</Value>
          </DetailRow>
          <DetailRow>
            <Label>Check-in</Label>
            <Value>{selectedDates.start && selectedDates.start.toLocaleDateString()}</Value>
          </DetailRow>
          <DetailRow>
            <Label>Check-out</Label>
            <Value>{selectedDates.end && selectedDates.end.toLocaleDateString()}</Value>
          </DetailRow>
          <DetailRow>
            <Label>Guests</Label>
            <Value>
              {adults} Adult{adults > 1 ? 's' : ''}
              {children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}
            </Value>
          </DetailRow>
        </DetailsCard>
        <PhoneInput
          type="tel"
          placeholder="e.g. 07XXXXXXXX"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          maxLength={13}
          pattern="^0[17][0-9]{8,}$"
          autoFocus
          inputMode="tel"
          disabled={loading || polling}
        />
        <PayButton onClick={handlePay} disabled={loading || polling || !phone || phone.length < 10}>
          <img src="https://i.ibb.co/Z18GSSs5/Lipa-na-mpesa.webp" alt="M-Pesa" style={{height: 20, marginRight: 4}} />
          {loading ? 'Processing...' : polling ? 'Waiting for payment...' : 'Pay with M-Pesa'}
        </PayButton>
        {status && <StatusMsg success={status.toLowerCase().includes('success') || status.toLowerCase().includes('confirm')}>{status}</StatusMsg>}
      </ContentWrapper>
    </>
  );
};

export default CheckoutScreen;