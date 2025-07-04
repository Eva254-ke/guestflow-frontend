import React, { useState } from 'react';
import BookingCalendarScreen from './BookingCalendarScreen';
import SelectRoomScreen from './SelectRoomScreen';
import RoomDetailsScreen from './RoomDetailsScreen';
import BookingSummaryScreen from './BookingSummaryScreen';
import CheckoutScreen from './CheckoutScreen';
import { initiateMpesaStkPush } from '../api/api';
import '../styles/modal.css';

// Helper to compute total price (expand as needed)
const computeTotalPrice = (room, dates) => {
  // Example: price per night * nights, add fees/taxes here if needed
  if (!room || !dates.start || !dates.end) return room?.base_price || 0;
  const nights =
    (new Date(dates.end).getTime() - new Date(dates.start).getTime()) /
      (1000 * 60 * 60 * 24) || 1;
  return Math.round((room.base_price || 0) * nights);
};

const BookingModal = ({
  isOpen = true,
  onClose,
  room,
  rooms = [],
  selectedRoomId,
  rental, // Pass rental object or at least rental.slug if possible
}) => {
  const [step, setStep] = useState('calendar');
  const [dates, setDates] = useState({ start: null, end: null });
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(room || null);
  const [phone, setPhone] = useState('');

  // Use dynamic rooms data from props, fallback to example data if none provided
  const availableRooms = rooms.length > 0 ? rooms : [
    { id: 1, name: 'Deluxe Room', description: 'Spacious room with king bed.', base_price: 186, rental_slug: rental?.slug },
    { id: 2, name: 'Standard Room', description: 'Cozy room with queen bed.', base_price: 156, rental_slug: rental?.slug },
  ];

  // Go to select room step
  const handleNext = () => {
    if (!dates.start || !dates.end) {
      setStatus('Please select start and end dates.');
      return;
    }
    setStatus('');
    setStep('select-room');
  };

  // Go back to calendar
  const handleBack = () => {
    setStep('calendar');
  };

  // Go to room details step, always attach rental_slug and total_price
  const handleSelectRoom = (room) => {
    // Try to get rental_slug from room, rental prop, or fallback
    const rental_slug =
      room.rental_slug ||
      room.rentalSlug ||
      (room.rental && room.rental.slug) ||
      rental?.slug ||
      '';
    const total_price = computeTotalPrice(room, dates);
    setSelectedRoom({ ...room, rental_slug, total_price });
    setStep('room-details');
  };

  // Go back to select room
  const handleBackToRooms = () => {
    setStep('select-room');
  };

  // Go to summary step
  const handleConfirmRoom = () => {
    setStatus('');
    setStep('summary');
  };

  // Go to checkout step
  const handleCheckout = () => {
    setStatus('');
    setStep('checkout');
  };

  // Handle payment (production M-Pesa STK Push)
  const handlePay = async () => {
    setLoading(true);
    setStatus('');
    try {
      const amount = selectedRoom.total_price || selectedRoom.base_price || 0;
      const rental_slug =
        selectedRoom.rental_slug ||
        (selectedRoom.rental && selectedRoom.rental.slug) ||
        rental?.slug ||
        '';
      const res = await initiateMpesaStkPush({
        phone,
        amount,
        rental_slug,
        room_id: selectedRoom.id,
        account_ref: 'Booking',
        transaction_desc: 'Hotel Booking',
      });
      if (res.ResponseCode === '0') {
        setStatus('STK Push sent! Please check your phone to complete payment.');
      } else {
        setStatus(res.CustomerMessage || 'Failed to initiate payment.');
      }
    } catch (err) {
      setStatus('Failed to initiate payment. Please try again.');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div
        className="modal-content"
        style={{
          overflow: 'visible',
          maxHeight: '96vh',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: 14,
          background: '#fff',
          position: 'relative',
          boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
          minWidth: 0,
          width: '100%',
          maxWidth: 440,
          margin: '4vh auto',
          transition: 'max-width 0.2s, border-radius 0.2s',
        }}
      >
        {step === 'calendar' && (
          <BookingCalendarScreen
            selectedDates={dates}
            onDateChange={setDates}
            selectedRoomId={selectedRoomId}
            onNext={handleNext}
            adults={adults}
            setAdults={setAdults}
            children={children}
            setChildren={setChildren}
            onClose={onClose}
            status={status}
            sidebarOpen={false}
            openSidebar={() => {}}
          />
        )}
        {step === 'select-room' && (
          <SelectRoomScreen
            rooms={availableRooms}
            onSelectRoom={handleSelectRoom}
            dates={dates}
            adults={adults}
            children={children}
            selectedRoomId={selectedRoomId}
            onBack={handleBack}
            onClose={onClose}
          />
        )}
        {step === 'room-details' && selectedRoom && (
          <RoomDetailsScreen
            room={selectedRoom}
            onConfirm={handleConfirmRoom}
            onClose={onClose}
            onBack={handleBackToRooms}
            dates={dates && dates.start && dates.end ? `${dates.start} - ${dates.end}` : ''}
            guests={adults + children}
          />
        )}
        {step === 'summary' && selectedRoom && (
          <BookingSummaryScreen
            selectedDates={dates}
            adults={adults}
            children={children}
            room={selectedRoom}
            onCheckout={handleCheckout}
            onBack={handleBackToRooms}
            onClose={onClose}
            onAddRoom={() => setStep('select-room')}
            price={selectedRoom.total_price || selectedRoom.base_price || selectedRoom.price || 0}
          />
        )}
        {step === 'checkout' && selectedRoom && (
          <CheckoutScreen
            selectedDates={dates}
            adults={adults}
            children={children}
            room={selectedRoom}
            phone={phone}
            setPhone={setPhone}
            loading={loading}
            status={status}
            onPay={handlePay}
            onBack={handleBackToRooms}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default BookingModal;