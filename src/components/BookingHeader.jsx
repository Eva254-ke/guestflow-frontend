import React from 'react';
import { FaBars, FaGlobe } from 'react-icons/fa';

const HEADER_HEIGHT = 56;

const BookingHeader = ({
  onOpenSidebar,
  onOpenGlobalSettings,
  onClose,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      minHeight: HEADER_HEIGHT,
      padding: '16px 20px 12px 20px',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      background: '#fff',
      position: 'sticky', // Keeps header at the top of scrollable modal
      top: 0,
      zIndex: 10,
      boxSizing: 'border-box',
      borderBottom: '1px solid #eee',
    }}
  >
    {/* Left: Hamburger and Title */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <FaBars
        style={{ fontSize: 26, color: '#222', cursor: 'pointer' }}
        onClick={onOpenSidebar}
        aria-label="Open sidebar"
        title="Open sidebar"
      />
      <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: 2, color: '#222', lineHeight: 1 }}>
        BOOKING
      </span>
    </div>
    {/* Right: Globe and Close */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <button
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          height: 40,
          width: 40,
          justifyContent: 'center',
        }}
        onClick={onOpenGlobalSettings}
        title="Global Settings"
        aria-label="Global Settings"
      >
        <FaGlobe style={{ fontSize: 24, color: '#1976d2' }} />
      </button>
      <button
        style={{
          background: 'none',
          border: 'none',
          fontSize: 28,
          color: '#222',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          height: 40,
          width: 40,
          justifyContent: 'center',
          marginRight: 8, // Prevents overlap with scrollbar
        }}
        onClick={onClose}
        title="Close"
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  </div>
);

export default BookingHeader;