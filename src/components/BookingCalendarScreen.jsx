import React, { useState, useEffect } from 'react';
import BookingHeader from './BookingHeader';
import BookingSidebar from './BookingSidebar';
import Calendar from 'react-calendar';
import { FaInfoCircle } from 'react-icons/fa';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar-custom.css';
import { fetchDailyPrices } from '../api/api';

const HEADER_HEIGHT = 56;

const BookingCalendarScreen = ({
  selectedDates,
  onDateChange,
  adults,
  setAdults,
  children,
  setChildren,
  onNext,
  status,
  sidebarOpen,
  openSidebar,
  onClose,
  selectedRoomId,
  loading: externalLoading,
}) => {
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [pricesByDate, setPricesByDate] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  // Convert to [start, end] for react-calendar
  const range =
    selectedDates.start && selectedDates.end
      ? [selectedDates.start, selectedDates.end]
      : selectedDates.start
      ? [selectedDates.start, selectedDates.start]
      : null;

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Merge new prices into pricesByDate
  const mergePrices = (newData) => {
    setPricesByDate(prev => {
      const merged = { ...prev };
      newData.forEach(item => {
        if (item.price !== null && item.price !== undefined && item.price !== "") {
          merged[item.date] = Math.round(Number(item.price));
        }
      });
      return merged;
    });
  };

  // Fetch prices for a given month
  const fetchMonthPrices = async (roomId, monthDate) => {
    const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    const data = await fetchDailyPrices(roomId, formatDate(start), formatDate(end));
    return data;
  };

  // On mount, fetch current and next month prices
  useEffect(() => {
    if (!selectedRoomId) return;
    setLoading(true);
    setError(null);
    const thisMonth = activeStartDate;
    const nextMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 1);
    Promise.all([
      fetchMonthPrices(selectedRoomId, thisMonth),
      fetchMonthPrices(selectedRoomId, nextMonth)
    ])
      .then(([data1, data2]) => {
        mergePrices(data1);
        mergePrices(data2);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load daily prices. Please try again.');
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [selectedRoomId]);

  // When user changes month, fetch that month's prices
  useEffect(() => {
    if (!selectedRoomId || !activeStartDate) return;
    setLoading(true);
    setError(null);
    fetchMonthPrices(selectedRoomId, activeStartDate)
      .then((data) => {
        mergePrices(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load daily prices. Please try again.');
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [selectedRoomId, activeStartDate]);

  // Handle date selection
  const handleSelect = (value) => {
    if (!value) {
      onDateChange({ start: null, end: null });
    } else if (Array.isArray(value)) {
      onDateChange({
        start: value[0],
        end: value[1],
      });
    } else {
      onDateChange({
        start: value,
        end: value,
      });
    }
  };

  // Disable days with no price
  const tileDisabled = ({ date }) => {
    const dateStr = formatDate(date);
    return pricesByDate[dateStr] === undefined || pricesByDate[dateStr] === null || isNaN(pricesByDate[dateStr]);
  };

  // Show price only for days with price, nothing for others
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dateStr = formatDate(date);
    const price = pricesByDate[dateStr];
    if (price === undefined || price === null || isNaN(price)) return null;
    return (
      <div style={{ fontSize: 12, marginTop: 2, color: '#1976d2', fontWeight: 500 }}>
        ${price}
      </div>
    );
  };

  // Use external loading if provided (e.g. booking in progress)
  const isLoading = typeof externalLoading === 'boolean' ? externalLoading : loading;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 10 }}>
      <BookingHeader
        onOpenSidebar={openSidebar}
        onOpenGlobalSettings={() => setShowGlobalSettings(true)}
        onClose={onClose}
      />

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          paddingBottom: 24,
        }}
      >
        {sidebarOpen && (
          <BookingSidebar onClose={onClose} />
        )}

        {showGlobalSettings && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.18)',
              zIndex: 1001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 10,
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                width: 400,
                maxWidth: '95vw',
                padding: '24px 24px 32px 24px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 18
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <span style={{ fontWeight: 600, fontSize: 20 }}>Global Settings</span>
                <span
                  style={{ fontSize: 24, color: '#888', cursor: 'pointer' }}
                  onClick={() => setShowGlobalSettings(false)}
                  title="Close"
                  aria-label="Close"
                >
                  &times;
                </span>
              </div>
              <div style={{ borderTop: '1px solid #eee', marginBottom: 18 }}></div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, marginBottom: 4 }}>LANGUAGE</div>
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#fafbfc',
                  fontSize: 15,
                  cursor: 'pointer'
                }}>
                  English
                  <span style={{ fontSize: 18, color: '#888' }}>▼</span>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, marginBottom: 4 }}>CURRENCY</div>
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#fafbfc',
                  fontSize: 15,
                  cursor: 'pointer'
                }}>
                  US Dollar $
                  <span style={{ fontSize: 18, color: '#888' }}>▼</span>
                </div>
              </div>
              <button
                style={{
                  width: '100%',
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '14px 0',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer',
                  marginTop: 8
                }}
                onClick={() => setShowGlobalSettings(false)}
              >
                SAVE
              </button>
            </div>
          </div>
        )}

        {/* Calendar without extra frame */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <Calendar
            selectRange
            value={range}
            onChange={handleSelect}
            tileDisabled={tileDisabled}
            tileContent={tileContent}
            minDate={new Date()}
            prev2Label={null}
            next2Label={null}
            className="no-calendar-frame"
            onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
          />
        </div>

        {isLoading && (
          <div style={{
            textAlign: 'center',
            padding: '10px',
            color: '#1976d2'
          }}>
            Loading...
          </div>
        )}

        {error && (
          <div style={{
            textAlign: 'center',
            padding: '10px',
            color: 'red'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: '1rem' }}>
          <FaInfoCircle style={{ color: '#888', fontSize: 16 }} />
          <span style={{ fontSize: '0.95rem', color: '#888' }}>
            Calendar prices shown for 1 night stay excluding taxes and fees.
          </span>
        </div>

        <div style={{ margin: '24px 0 16px 0', borderTop: '1px solid #eee', width: '100%' }}></div>

        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, width: '100%' }}>GUESTS</div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f5f7fa',
            borderRadius: 10,
            padding: '16px 20px',
            marginBottom: 12,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Adults</div>
            <div style={{ fontSize: 13, color: '#888' }}>13 years or older</div>
          </div>
          <button
            onClick={() => setAdults(Math.max(1, adults - 1))}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              fontSize: 22,
              marginRight: 12,
              cursor: 'pointer',
            }}
          >
            -
          </button>
          <span style={{ fontWeight: 600, fontSize: 18, width: 24, textAlign: 'center' }}>{adults}</span>
          <button
            onClick={() => setAdults(adults + 1)}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              fontSize: 22,
              marginLeft: 12,
              cursor: 'pointer',
            }}
          >
            +
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f5f7fa',
            borderRadius: 10,
            padding: '16px 20px',
            marginBottom: 24,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Children</div>
            <div style={{ fontSize: 13, color: '#888' }}>Ages 0 – 12</div>
          </div>
          <button
            onClick={() => setChildren(Math.max(0, children - 1))}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              fontSize: 22,
              marginRight: 12,
              cursor: 'pointer',
            }}
          >
            -
          </button>
          <span style={{ fontWeight: 600, fontSize: 18, width: 24, textAlign: 'center' }}>{children}</span>
          <button
            onClick={() => setChildren(children + 1)}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              fontSize: 22,
              marginLeft: 12,
              cursor: 'pointer',
            }}
          >
            +
          </button>
        </div>

        <button
          style={{
            marginTop: '2rem',
            width: '100%',
            background: !selectedDates.start || !selectedDates.end ? '#1976d2' : 'linear-gradient(90deg, #1976d2 0%, #21a1ff 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '16px 0',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: 1,
            boxShadow: '0 2px 12px rgba(25, 118, 210, 0.08)',
            cursor: !selectedDates.start || !selectedDates.end ? 'not-allowed' : 'pointer',
            opacity: !selectedDates.start || !selectedDates.end ? 0.7 : 1,
            transition: 'background 0.2s, opacity 0.2s',
          }}
          onClick={onNext}
          disabled={!selectedDates.start || !selectedDates.end}
        >
          {isLoading ? 'Searching...' : 'SEARCH'}
        </button>

        {status && <p style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{status}</p>}
      </div>
    </div>
  );
};

export default BookingCalendarScreen;