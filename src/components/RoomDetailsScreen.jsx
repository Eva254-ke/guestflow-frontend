import React, { useState } from 'react';
import { FaArrowLeft, FaGlobe, FaTimes, FaBed, FaUserFriends, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Helper function for currency formatting
const KES = (amount) => `KES ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

const RoomDetailsScreen = ({ room, onConfirm, onClose, onBack, dates, guests }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    amenities: false,
    pricing: false,
    policies: false
  });

  // Always extract image URLs from room.images (array of {image: url})
  const images = Array.isArray(room.images)
    ? room.images.map(imgObj => typeof imgObj === 'string' ? imgObj : imgObj.image)
    : [];
  
  // Calculate total amount from backend if available, else compute manually
  let totalAmount = 0;
  if (typeof room.total_price !== 'undefined' && room.total_price !== null) {
    totalAmount = Number(room.total_price);
  } else if (Array.isArray(room.price_breakdown) && room.price_breakdown.length > 0) {
    totalAmount = room.price_breakdown.reduce((sum, item) => sum + Number(item.price), 0);
    if (Array.isArray(room.fees)) {
      totalAmount += room.fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
    }
    if (Array.isArray(room.taxes)) {
      totalAmount += room.taxes.reduce((sum, tax) => sum + Number(tax.amount || tax.rate), 0);
    }
  } else if (room.price) {
    totalAmount = Number(room.price);
    if (Array.isArray(room.fees)) {
      totalAmount += room.fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
    }
    if (Array.isArray(room.taxes)) {
      totalAmount += room.taxes.reduce((sum, tax) => sum + Number(tax.amount || tax.rate), 0);
    }
  }

  // Parse features as array, amenities as array (already from backend)
  const features = room.features ? (typeof room.features === 'string' ? room.features.split(',').map(f => f.trim()).filter(Boolean) : room.features) : [];
  const amenities = Array.isArray(room.amenities) ? room.amenities : (typeof room.amenities === 'string' ? room.amenities.split(',').map(a => a.trim()).filter(Boolean) : []);

  // Show amenities section if amenities exist
  const showAmenities = amenities.length > 0;

  const handlePrev = () => setImgIdx((idx) => (idx === 0 ? images.length - 1 : idx - 1));
  const handleNext = () => setImgIdx((idx) => (idx === images.length - 1 ? 0 : idx + 1));

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Pricing breakdown
  const priceBreakdown = room.price_breakdown || [];
  const fees = room.fees || [];
  const taxes = room.taxes || [];

  // Helper to format date as e.g. Mon, 1 Jul 2025
  const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* App Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#1a73e8',
          color: '#fff',
          padding: '12px 16px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <button 
            onClick={onBack} 
            aria-label="Back"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.2s',
              marginRight: '8px'
            }}
          >
            <FaArrowLeft />
          </button>
          <span style={{ fontWeight: 600, fontSize: '18px', flex: 1 }}>Room Details</span>
          <button 
            aria-label="Language"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.2s',
              marginRight: '8px'
            }}
          >
            <FaGlobe />
          </button>
          <button 
            onClick={onClose} 
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Content Container */}
        <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '80px' }}>
          {/* Date & Guest Info */}
          <div style={{ padding: '0 16px', margin: '18px 0 10px 0' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {/* Date Range Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f1f6fb',
                borderRadius: '22px',
                padding: '7px 18px',
                fontSize: '15px',
                color: '#1976d2',
                fontWeight: 500,
                boxShadow: '0 1px 3px rgba(21,101,167,0.04)',
                gap: '10px',
                minWidth: 0,
                flex: 1
              }}>
                <span style={{ color: '#5f6368', fontWeight: 400, fontSize: '14px' }}>Check-in</span>
                <span style={{ fontWeight: 700, color: '#1976d2', marginRight: 2 }}>
                  {dates && dates.start ? formatDate(dates.start) : '—'}
                </span>
                <span style={{ color: '#b0c4d6', fontSize: 18, margin: '0 2px' }}>{'\u203A'}</span>
                <span style={{ color: '#5f6368', fontWeight: 400, fontSize: '14px' }}>Check-out</span>
                <span style={{ fontWeight: 700, color: '#1976d2' }}>
                  {dates && dates.end ? formatDate(dates.end) : '—'}
                </span>
              </div>
              {/* Guests Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#eafbe7',
                borderRadius: '22px',
                padding: '7px 16px',
                fontSize: '15px',
                color: '#228b22',
                fontWeight: 500,
                gap: '7px',
                minWidth: 0
              }}>
                <span role="img" aria-label="guests">👥</span>
                <span>{guests || 2} guest{(guests || 2) > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Image Carousel */}
          <div style={{ padding: '0 16px', margin: '16px 0' }}>
            <div style={{
              position: 'relative',
              height: '220px',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {images.length > 0 ? (
                <img 
                  src={images[imgIdx]} 
                  alt="Room" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ color: '#999', fontSize: '14px' }}>No images available</div>
              )}
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrev} 
                    aria-label="Previous image"
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.92)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      fontSize: '22px',
                      color: '#1976d2',
                      fontWeight: 700,
                      transition: 'background 0.18s',
                      outline: 'none',
                      borderWidth: 0
                    }}
                  >
                    <FaChevronLeft />
                  </button>
                  <button 
                    onClick={handleNext} 
                    aria-label="Next image"
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.92)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      fontSize: '22px',
                      color: '#1976d2',
                      fontWeight: 700,
                      transition: 'background 0.18s',
                      outline: 'none',
                      borderWidth: 0
                    }}
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>
            
            {images.length > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '8px', 
                margin: '8px 0' 
              }}>
                {images.map((_, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: i === imgIdx ? '#1a73e8' : '#e0e0e0',
                      transition: 'all 0.2s'
                    }}
                  ></span>
                ))}
              </div>
            )}
          </div>

          {/* Room Info */}
          <div style={{ padding: '0 16px', margin: '16px 0' }}>
            <h2 style={{ 
              fontWeight: 600, 
              fontSize: '22px', 
              margin: '0 0 8px 0', 
              color: '#202124' 
            }}>
              {room.name}
            </h2>
            <p style={{ 
              fontSize: '15px', 
              color: '#5f6368', 
              margin: '0 0 12px 0', 
              lineHeight: '1.5' 
            }}>
              {showFullDesc ? room.description : (room.description?.slice(0, 120) || 'No description available')}
              {room.description && room.description.length > 120 && !showFullDesc && (
                <button 
                  onClick={() => setShowFullDesc(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1a73e8',
                    fontSize: '15px',
                    cursor: 'pointer',
                    padding: 0,
                    marginLeft: '4px',
                    fontWeight: 500
                  }}
                >
                  Read more
                </button>
              )}
            </p>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '12px',
              margin: '16px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#202124' }}>
                <FaBed style={{ color: '#5f6368' }} />
                <span>{room.bedType || 'King Bed'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#202124' }}>
                <FaUserFriends style={{ color: '#5f6368' }} />
                <span>Sleeps {room.sleeps || 2}</span>
              </div>
              {room.area && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#202124' }}>
                  <span role="img" aria-label="area">📏</span>
                  <span>{room.area} m²</span>
                </div>
              )}
            </div>
          </div>

          {/* Expandable Amenities Section */}
          {(features.length > 0 || showAmenities) && (
            <div style={{ margin: '16px 0' }}>
              <div 
                onClick={() => toggleSection('amenities')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f1f1f1'
                }}
              >
                <h4 style={{ margin: 0, fontSize: '16px', color: '#202124' }}>Features & Amenities</h4>
                {expandedSections.amenities ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSections.amenities && (
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '12px',
                    margin: '16px 0'
                  }}>
                    {features.map((feature, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#202124' }}>
                        <span>•</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                    {amenities.map((amenity, index) => (
                      <div key={`a-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#202124' }}>
                        <span>•</span>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pricing Section */}
          <div style={{ padding: '0 16px', margin: '16px 0' }}>
            <h3 style={{ 
              fontSize: '15px', 
              color: '#5f6368', 
              margin: '0 0 12px 0', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px', 
              fontWeight: 500 
            }}>
              Pricing Breakdown
            </h3>
            
            {priceBreakdown.length > 0 ? (
              <>
                {priceBreakdown.map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '8px 0', 
                    borderBottom: '1px solid #f1f1f1', 
                    fontSize: '15px' 
                  }}>
                    <span>{item.date}</span>
                    <span>{KES(item.price)}</span>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px 0', 
                borderBottom: '1px solid #f1f1f1', 
                fontSize: '15px' 
              }}>
                <span>Nightly rate</span>
                <span>{KES(room.price || 10000)}</span>
              </div>
            )}
            
            {fees.length > 0 && fees.map((fee, idx) => (
              <div key={`fee-${idx}`} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px 0', 
                borderBottom: '1px solid #f1f1f1', 
                fontSize: '15px' 
              }}>
                <span>{fee.name}</span>
                <span>{KES(fee.amount)}</span>
              </div>
            ))}
            
            {taxes.length > 0 && taxes.map((tax, idx) => (
              <div key={`tax-${idx}`} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px 0', 
                borderBottom: '1px solid #f1f1f1', 
                fontSize: '15px' 
              }}>
                <span>{tax.name}</span>
                <span>{KES(tax.amount || tax.rate)}</span>
              </div>
            ))}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0', 
              fontWeight: 600, 
              fontSize: '17px', 
              color: '#202124' 
            }}>
              <span>Total</span>
              <span>{KES(totalAmount)}</span>
            </div>
          </div>

          {/* Policies Section */}
          {room.policies && (
            <div style={{ margin: '16px 0' }}>
              <div 
                onClick={() => toggleSection('policies')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f1f1f1'
                }}
              >
                <h4 style={{ margin: 0, fontSize: '16px', color: '#202124' }}>Policies</h4>
                {expandedSections.policies ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSections.policies && (
                <div style={{ padding: '12px 16px' }}>
                  <p style={{ 
                    fontSize: '15px', 
                    color: '#5f6368', 
                    margin: 0, 
                    lineHeight: '1.5' 
                  }}>
                    {room.policies}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div style={{ 
          position: 'sticky',
          bottom: 0,
          width: '100%',
          background: '#fff',
          borderTop: '1px solid #e0e0e0',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          zIndex: 20
        }}>
          <button 
            onClick={onConfirm}
            style={{
              background: '#1a73e8',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '14px',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              width: '100%',
              transition: 'background 0.2s'
            }}
          >
            Book Now - {KES(totalAmount)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsScreen;