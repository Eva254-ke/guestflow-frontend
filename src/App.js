import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RentalPage from './pages/RentalPage';
import SelectRoomScreen from './components/SelectRoomScreen';

function App() {
  // Dummy handler for direct route testing
  const handleSelectRoom = () => {};
  return (
    <Router>
      <Routes>
        <Route path="/rental/:slug" element={<RentalPage />} />
        <Route path="/select-room" element={<SelectRoomScreen onSelectRoom={handleSelectRoom} />} />
        <Route path="*" element={
          <div style={{textAlign:'center',marginTop:'2rem'}}>
            <h2>Welcome to GuestFlow</h2>
            <p>To book, use a link like <code>/rental/cozy-nairobi-airbnb</code></p>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;