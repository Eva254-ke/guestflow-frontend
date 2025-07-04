import React from 'react';
import PropTypes from 'prop-types';

function SelectRoomScreen({
  rooms = [],
  onSelectRoom,
  dates,
  adults = 1,
  children = 0,
  selectedRoomId,
  onBack = () => {},
  onClose = () => {},
  onFilterClick = () => {},
}) {
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatPrice = (price) => {
    return `KES ${Number(price).toLocaleString()}`;
  };

  const getOriginalPrice = (basePrice) => {
    return Math.round(Number(basePrice) * 1.15);
  };

  // Use the image URL as-is if it starts with http/https, otherwise prepend the backend domain
  const getRoomImage = (room) => {
    if (room.images && room.images.length > 0) {
      const imageUrl = room.images[0].image || room.images[0];
      if (imageUrl) {
        // Use as-is if absolute URL
        if (/^https?:\/\//.test(imageUrl)) {
          return imageUrl;
        }
        // Otherwise, prepend backend domain (from env)
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';
        const imgPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
        return `${apiBaseUrl.replace(/\/api\/?$/, '')}${imgPath}`;
      }
    }
    return null;
  };

  const calculateNights = () => {
    if (!dates?.start || !dates?.end) return 1;
    const start = new Date(dates.start);
    const end = new Date(dates.end);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const nights = calculateNights();

  return (
    <div className="select-room-container">
      {/* Header */}
      <header className="select-room-header">
        <button
          className="back-button"
          onClick={onBack}
          aria-label="Go back"
        >
          ←
        </button>
        <h1 className="select-room-title">SELECT ROOM</h1>
        <div className="header-actions">
          <button className="language-button" aria-label="Change language">
            🌐
          </button>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Date and Guest Info */}
      <div className="booking-info-bar">
        <div className="info-item">
          <span className="info-icon">📅</span>
          <span className="info-text">
            {formatDate(dates?.start)} - {formatDate(dates?.end)}
          </span>
        </div>
        <div className="info-item">
          <span className="info-icon">👥</span>
          <span className="info-text">
            {adults} Adult{adults !== 1 ? 's' : ''}{children ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}
          </span>
        </div>
        <button
          className="filter-button"
          onClick={onFilterClick}
        >
          ⚙️ Filters
        </button>
      </div>

      {/* Room List */}
      <main className="room-list-container">
        {rooms && rooms.length > 0 ? (
          <div className="room-list">
            {rooms.map((room) => {
              // Ensure base_price is a number
              const basePrice = Number(room.base_price) || 0;
              const isSelected = selectedRoomId === room.id;

              return (
                <article
                  key={room.id}
                  className={`room-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectRoom(room)}
                >
                  {/* Room Image */}
                  <div
                    className="room-image"
                    style={{
                      backgroundImage: getRoomImage(room)
                        ? `url(${getRoomImage(room)})`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    {/* Price badge */}
                    <div className="price-badge">
                      <div className="original-price">
                        {formatPrice(getOriginalPrice(basePrice))}
                      </div>
                      <div className="current-price">
                        {`KES ${Number(basePrice).toLocaleString()}`}{' '}
                        <span className="price-unit">/ night</span>
                      </div>
                    </div>
                    {isSelected && <div className="selected-badge">✓ Selected</div>}
                  </div>

                  {/* Room Details */}
                  <div className="room-details">
                    <div className="room-info">
                      <h3 className="room-name">{room.name || 'Classic Queen'}</h3>
                      <p className="room-description">
                        {room.description ||
                          'Classic Queen Rooms feature one Queen sized bed, and have SoHo views from the floor to ceiling windows.'}
                      </p>
                      <div className="price-disclaimer">Excl. taxes & fees</div>
                      {room.nights && (
                        <div className="nights-info">
                          {room.nights} {room.nights === 1 ? 'night' : 'nights'} • Total: {formatPrice(room.total_price || basePrice * nights)}
                        </div>
                      )}
                    </div>

                    {/* Room Features & View Details Button */}
                    <div className="room-footer">
                      <div className="room-features">
                        <div className="feature">
                          <span className="feature-icon">👥</span>
                          <span className="feature-text">
                            {room.capacity || room.max_guests || 2}
                          </span>
                        </div>
                        <div className="feature">
                          <span className="feature-icon">🛏️</span>
                          <span className="feature-text">{room.bed_count || 1}</span>
                        </div>
                      </div>

                      <button
                        className="view-details-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRoom(room);
                        }}
                      >
                        {isSelected ? 'Selected ✓' : 'View Details'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="no-rooms-message">
            No rooms available for selected dates.
            <button className="try-again-button" onClick={onBack}>
              Try different dates
            </button>
          </div>
        )}
      </main>

      {/* Styles */}
      <style jsx>{`
        .select-room-container {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background-color: #fff;
        }

        /* Header Styles */
        .select-room-header {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e0e0e0;
          background-color: #fff;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .back-button, .close-button, .language-button {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
          padding: 4px;
          transition: opacity 0.2s;
        }

        .back-button:hover, .close-button:hover, .language-button:hover {
          opacity: 0.8;
        }

        .back-button {
          margin-right: 12px;
        }

        .select-room-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #333;
        }

        .header-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Booking Info Bar */
        .booking-info-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 20px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
          flex-wrap: wrap;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .info-icon {
          font-size: 14px;
        }

        .info-text {
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .filter-button {
          margin-left: auto;
          background: none;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 6px 12px;
          cursor: pointer;
          font-weight: 500;
          color: #666;
          font-size: 12px;
          transition: all 0.2s;
        }

        .filter-button:hover {
          background-color: #f0f0f0;
        }

        /* Room List Container */
        .room-list-container {
          flex: 1;
          overflow-y: auto;
          padding: 12px 16px;
        }

        .room-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Room Card */
        .room-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          background-color: #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .room-card:hover {
          box-shadow: 0 2px 12px rgba(0,0,0,0.12);
          transform: translateY(-2px);
        }

        .room-card.selected {
          border: 2px solid #2196F3;
        }

        /* Room Image */
        .room-image {
          height: 160px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        /* Price Badge */
        .price-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 11px;
          text-align: right;
        }

        .original-price {
          text-decoration: line-through;
          font-size: 10px;
          opacity: 0.8;
        }

        .current-price {
          font-weight: 600;
          font-size: 12px;
        }

        .price-unit {
          font-weight: 400;
          font-size: 10px;
        }

        .selected-badge {
          position: absolute;
          bottom: 8px;
          left: 8px;
          background: #2196F3;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        /* Room Details */
        .room-details {
          padding: 16px;
        }

        .room-info {
          margin-bottom: 12px;
        }

        .room-name {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 6px 0;
          color: #333;
        }

        .room-description {
          font-size: 13px;
          color: #666;
          margin: 0 0 8px 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .price-disclaimer {
          font-size: 11px;
          color: #e67e22;
          margin-top: 4px;
          font-weight: 500;
        }

        .nights-info {
          font-size: 11px;
          color: #666;
          margin-top: 4px;
        }

        /* Room Footer */
        .room-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid #f0f0f0;
        }

        .room-features {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .feature-icon {
          font-size: 12px;
        }

        .feature-text {
          font-size: 11px;
          color: #666;
        }

        /* View Details Button */
        .view-details-button {
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 100px;
        }

        .view-details-button:hover {
          background: #1976D2;
          transform: translateY(-1px);
        }

        .room-card.selected .view-details-button {
          background: #4CAF50;
        }

        /* No Rooms Message */
        .no-rooms-message {
          text-align: center;
          padding: 60px 20px;
          color: #666;
          font-size: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .try-again-button {
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .try-again-button:hover {
          background: #1976D2;
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .booking-info-bar {
            gap: 12px 8px;
          }
          
          .info-text {
            font-size: 13px;
          }
          
          .room-image {
            height: 140px;
          }
          
          .room-name {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}

SelectRoomScreen.propTypes = {
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string,
      description: PropTypes.string,
      base_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      images: PropTypes.array,
      capacity: PropTypes.number,
      max_guests: PropTypes.number,
      bed_count: PropTypes.number,
      nights: PropTypes.number,
      total_price: PropTypes.number,
    })
  ),
  onSelectRoom: PropTypes.func.isRequired,
  dates: PropTypes.shape({
    start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }),
  adults: PropTypes.number,
  children: PropTypes.number,
  selectedRoomId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onBack: PropTypes.func,
  onClose: PropTypes.func,
  onFilterClick: PropTypes.func,
};

export default SelectRoomScreen;