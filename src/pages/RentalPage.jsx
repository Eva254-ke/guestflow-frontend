import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAvailableRooms } from '../api/api';
import BookingModal from '../components/BookingModal';

const RentalPage = () => {
    const { slug } = useParams();
    const [rooms, setRooms] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                // For demo purposes, using current date + 1 day as checkin and +2 days as checkout
                const today = new Date();
                const checkin = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const checkout = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                
                const roomsData = await fetchAvailableRooms(slug, checkin, checkout);
                setRooms(roomsData);
                if (roomsData.length > 0) {
                    setSelectedRoom(roomsData[0]); // Default to first room
                }
            } catch (error) {
                console.error('Error fetching rooms:', error);
                setError('Failed to load rooms');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [slug]);

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {loading && (
                <div style={{ fontSize: '18px', color: '#666' }}>Loading GuestFlow...</div>
            )}
            
            {error && (
                <div style={{ fontSize: '18px', color: '#d32f2f' }}>{error}</div>
            )}
            
            {!loading && !error && !isModalOpen && rooms.length > 0 && (
                <button
                    style={{
                        fontSize: 22,
                        padding: '1.2rem 2.5rem',
                        borderRadius: '12px',
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        boxShadow: '0 4px 16px rgba(25,118,210,0.08)',
                        zIndex: 1001,
                        transition: 'all 0.2s ease'
                    }}
                    onClick={openModal}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#1565C0';
                        e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = '#1976d2';
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                    Book Now
                </button>
            )}
            
            {!loading && !error && rooms.length === 0 && (
                <div style={{ 
                    textAlign: 'center',
                    fontSize: '18px', 
                    color: '#666',
                    padding: '40px'
                }}>
                    No rooms available for the selected dates.
                </div>
            )}
            
            {isModalOpen && selectedRoom && (
                <BookingModal 
                    room={selectedRoom} 
                    rooms={rooms}
                    selectedRoomId={selectedRoom.id} 
                    onClose={closeModal} 
                />
            )}
        </div>
    );
};

export default RentalPage;