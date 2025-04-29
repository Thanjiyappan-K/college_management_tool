import React from 'react'

const SlotBooking = () => (
    <div>
        <h2>Slot Booking</h2>
        <p>Book your slots for classes, labs, and other activities.</p>
        <div className="slot-booking-form">
            <label htmlFor="date">Select Date:</label>
            <input type="date" id="date" name="date" required />
            
            <label htmlFor="time">Select Time:</label>
            <input type="time" id="time" name="time" required />
            
            <button type="submit">Book Slot</button>
        </div>
      
    </div>
  );
  
  export default SlotBooking;
  