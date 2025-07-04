import React, { useState } from 'react';
import styled from 'styled-components';

const TopBar = styled.div`
  display: flex;
  align-items: center;
  background: #1565a7;
  color: #fff;
  padding: 0 24px;
  height: 56px;
  font-size: 18px;
  font-weight: 600;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;
const IconBtn = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 22px;
  margin-right: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;
const Spacer = styled.div`
  flex: 1;
`;
const Card = styled.div`
  display: flex;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 16px;
  margin-bottom: 24px;
  align-items: flex-start;
`;
const RoomImg = styled.img`
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 18px;
`;
const CardDetails = styled.div`
  flex: 1;
`;
const CardTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
`;
const CardRow = styled.div`
  display: flex;
  font-size: 14px;
  margin-bottom: 2px;
`;
const CardLabel = styled.div`
  width: 70px;
  color: #888;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 500;
`;
const CardValue = styled.div`
  color: #222;
  font-size: 14px;
`;
const SpecialRequestInput = styled.input`
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 14px 12px;
  font-size: 15px;
  margin-bottom: 18px;
  margin-top: 2px;
  outline: none;
`;
const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;
const AddRoomBtn = styled.button`
  flex: 1;
  background: #fff;
  color: #1565a7;
  border: 1.5px solid #1565a7;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  padding: 14px 0;
  cursor: pointer;
`;
const ContinueBtn = styled.button`
  flex: 2;
  background: #1565a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  padding: 14px 0;
  cursor: pointer;
`;
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-height: 80vh;
  overflow-y: auto;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding-bottom: 90px;
`;
const StickyFooter = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f7fafd;
  border-top: 1px solid #e0e0e0;
  padding: 18px 32px 18px 32px;
  font-size: 22px;
  font-weight: 600;
  color: #4a4a4a;
  z-index: 10;
`;

const BookingSummaryScreen = ({
  selectedDates,
  adults,
  children,
  room,
  onCheckout,
  onBack,
  onClose,
  onAddRoom,
  price
}) => {
  const [specialRequest, setSpecialRequest] = useState('');
  const nights = selectedDates && selectedDates.start && selectedDates.end
    ? Math.max(1, Math.round((selectedDates.end - selectedDates.start) / (1000*60*60*24)))
    : 1;
  // Fix: Compute guest string outside JSX
  let guestString = `${adults} adult${adults > 1 ? 's' : ''}`;
  if (children > 0) {
    guestString += `, ${children} child${children > 1 ? 'ren' : ''}`;
  }

  // Use first backend image if available
  let imageUrl = '';
  if (Array.isArray(room.images) && room.images.length > 0) {
    let img = room.images[0].image || room.images[0];
    if (img) {
      if (/^https?:\/\//.test(img)) {
        imageUrl = img;
      } else {
        // Use WSL IP for production
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';
        const imgPath = img.startsWith('/') ? img : `/${img}`;
        imageUrl = `${apiBaseUrl.replace(/\/api\/?$/, '')}${imgPath}`;
      }
    }
  } else if (room.image && typeof room.image === 'string') {
    imageUrl = room.image;
  } else {
    imageUrl = 'https://via.placeholder.com/120x80?text=Room';
  }

  return (
    <ModalContent>
      <TopBar>
        <IconBtn onClick={onBack} title="Back">&#8592;</IconBtn>
        <span style={{fontWeight:600, letterSpacing:1}}>SUMMARY</span>
        <Spacer />
        <IconBtn title="Language"><span role="img" aria-label="globe">&#127760;</span></IconBtn>
        <IconBtn onClick={onClose} title="Close">&#10005;</IconBtn>
      </TopBar>
      <div style={{padding:'32px 24px 0 24px', flex:1}}>
        <div style={{fontSize:22, fontWeight:600, marginBottom:18}}>Booking</div>
        <Card>
          <RoomImg src={imageUrl} alt={room.name} />
          <CardDetails>
            <CardTitle>{room.name}</CardTitle>
            <CardRow><CardLabel>ARRIVE</CardLabel><CardValue>{selectedDates.start && selectedDates.start.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</CardValue></CardRow>
            <CardRow><CardLabel>DEPART</CardLabel><CardValue>{selectedDates.end && selectedDates.end.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</CardValue></CardRow>
            <CardRow><CardLabel>NIGHTS</CardLabel><CardValue>{nights}</CardValue></CardRow>
            <CardRow><CardLabel>GUESTS</CardLabel><CardValue>{guestString}</CardValue></CardRow>
          </CardDetails>
        </Card>
        <SpecialRequestInput
          placeholder="ADD SPECIAL REQUEST"
          value={specialRequest}
          onChange={e => setSpecialRequest(e.target.value)}
        />
        <ButtonRow>
          <AddRoomBtn onClick={onAddRoom}>+ ADD ROOM</AddRoomBtn>
          <ContinueBtn onClick={() => onCheckout(specialRequest)}>CONTINUE</ContinueBtn>
        </ButtonRow>
      </div>
      <StickyFooter>
        Price: {typeof price === 'number' ? `$${price.toFixed(2)}` : price}
      </StickyFooter>
    </ModalContent>
  );
};

export default BookingSummaryScreen;
