import React from 'react';
import { FaUserCircle, FaUser, FaCalendarAlt, FaBed } from 'react-icons/fa';

const sidebarStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: 260,
  height: '100vh',
  background: '#1976d2',
  color: '#fff',
  zIndex: 2000,
  padding: '32px 0 0 0',
  boxShadow: '2px 0 16px rgba(0,0,0,0.08)',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)',
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.18)',
  zIndex: 1999,
  transition: 'opacity 0.2s',
};

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '16px 32px',
  fontSize: 17,
  cursor: 'pointer',
  color: '#fff',
  border: 'none',
  background: 'none',
  outline: 'none',
};

const BookingSidebar = ({ open, onClose }) => (
  <>
    {open && <div style={overlayStyle} onClick={onClose} />}
    <div
      style={{
        ...sidebarStyle,
        transform: open ? 'translateX(0)' : 'translateX(-110%)',
      }}
      aria-hidden={!open}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 32px 24px 32px', borderBottom: '1px solid #ffffff33', marginBottom: 18 }}>
        <FaUserCircle size={32} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Guest Account</div>
        </div>
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 28,
            cursor: 'pointer',
            lineHeight: 1,
          }}
          title="Close"
          aria-label="Close sidebar"
        >
          &times;
        </button>
      </div>
      <button style={itemStyle}><FaUser /> Sign In / Sign Up</button>
      <button style={itemStyle}><FaCalendarAlt /> Find your booking</button>
      <button style={itemStyle}><FaBed /> Book a room</button>
    </div>
  </>
);

export default BookingSidebar;