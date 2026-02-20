// client/src/pages/Catalog.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Catalog.css'; // Here goes your style.css

const Catalog = () => {
    const [vehicles, setVehicles] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0); // Controls which slide is expanded

    useEffect(() => {
        // Fetch real data from the backend
        axios.get('http://localhost:5000/api/cars')
            .then(res => setVehicles(res.data))
            .catch(err => console.error("API Error:", err));
    }, []);

    return (
        <div className="slider-container">
            <div className="now-showing">Rental10 Showroom</div>
            <div className="accordion-slider">
                {vehicles.map((car, index) => (
                    <div 
                        key={car.id}
                        className={`slide ${activeIndex === index ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${car.imageUrl})` }}
                        onClick={() => setActiveIndex(index)}
                    >
                        <div className="slide-content">
                            <div className="slide-number">0{index + 1}</div>
                            <div className="car-brand">{car.make}</div>
                            <div className="car-name">{car.model}</div>
                            
                            <div className="car-specs">
                                <div className="spec-row">
                                    <span className="spec-label">Daily Price:</span>
                                    <span className="spec-value">${car.dailyRate} USD</span>
                                </div>
                                <div className="spec-row">
                                    <span className="spec-label">Transmission:</span>
                                    <span className="spec-value">{car.transmission}</span>
                                </div>
                            </div>

                            <button className="rent-btn" onClick={() => window.location.href=`/booking/${car.id}`}>
                                RENT NOW
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Catalog;