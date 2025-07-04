# 🌍 GuestFlow Frontend – Modal-Based Booking UI

This is the React frontend for **GuestFlow**, a mobile-first hotel and Airbnb booking engine. Guests book rooms via a seamless modal overlay—no redirects, no apps, no websites required.

---

## 🔧 Tech Stack

- **React** (JavaScript)
- **React Router DOM** – client-side routing
- **Axios** – API calls to the Django backend
- **React Datepicker** – calendar selector
- **CSS Modules or global styles** – styling system
- **Firebase (optional)** – for user authentication
- **Environment variables** – for API base URL configuration

---

## 📦 Folder Structure
- `src/` - React source code
- `public/` - Static files and HTML
- `src/api/` - API calls to the backend
- `src/components/` - Reusable UI components
- `src/pages/` - Page-level components
- `src/styles/` - CSS files

## Features
- Browse available rentals and rooms
- View room details, amenities, taxes, and total price
- Select dates and guests
- Book rooms and complete checkout
- Mpesa STK Push for mobile payments at checkout
- Responsive and modern UI

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Eva254-ke/guestflow-frontend.git
   ```
2. Navigate to the frontend directory:
   ```bash
   cd guestflow-frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the App
```bash
npm start
# or
yarn start
```
The app will run at [http://localhost:3000](http://localhost:3000).

## Environment Variables
Create a `.env` file in the root of the frontend directory if you need to override API endpoints or add secrets.

## Deployment
You can deploy this app to Vercel, Netlify, or any static hosting provider.

---

For backend setup and API documentation, see the main GuestFlow repository.
