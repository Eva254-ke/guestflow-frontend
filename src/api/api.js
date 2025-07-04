import axios from 'axios';

// Set production API base URL
const PRODUCTION_API_BASE_URL = 'https://web-production-e29be.up.railway.app/api/';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || PRODUCTION_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token authorization interceptor
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// --- API CALLS ---

// Fetch available rooms for a rental with pricing
export const fetchAvailableRooms = async (rentalSlug, checkin, checkout) => {
    try {
        // Add cache-busting param to always get fresh data
        const cacheBuster = Date.now();
        const response = await api.get(`rentals/${rentalSlug}/rooms/`, {
            params: {
                checkin: checkin,
                checkout: checkout,
                cb: cacheBuster,
            }
        });
        return response.data; // Array of room objects with total_price and nights
    } catch (error) {
        console.error('Error fetching rooms:', error);
        throw error;
    }
};

// Fetch daily prices for a room and date range
export const fetchDailyPrices = async (roomId, startDate, endDate) => {
    // Add cache-busting param to always get fresh data
    const cacheBuster = Date.now();
    const response = await api.get('daily-prices/', {
        params: {
            room_id: roomId,
            start_date: startDate,
            end_date: endDate,
            cb: cacheBuster,
        }
    });
    return response.data; // [{id, room, date, price, rate_used}, ...]
};

// Fetch rental details
export const fetchRental = async (slug) => {
    try {
        const response = await api.get(`rentals/${slug}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching rental:', error);
        throw error;
    }
};

// Initiate M-Pesa STK Push
export const initiateMpesaStkPush = async ({ phone, amount, rental_slug, room_id, account_ref, transaction_desc }) => {
    const response = await api.post('mpesa/stkpush/', {
        phone,
        amount,
        rental_slug,
        room_id,
        account_ref,
        transaction_desc,
    });
    return response.data;
};

export const fetchPayments = async (userId) => {
    const response = await api.get('payments/', {
        params: { user_id: userId }
    });
    return response.data;
};

export default api;