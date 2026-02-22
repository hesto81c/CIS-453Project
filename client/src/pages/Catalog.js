import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Catalog.css';

const Catalog = () => {
    const [vehicles, setVehicles] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        axios.get('http://localhost:5000/api/cars')
            .then(res => {
                setVehicles(res.data);
            })
            .catch(err => console.error("Error:", err));
    }, []);

    return (
        <div className="slider-container">
            <div className="now-showing">Rental10 Showroom</div>
            <div className="accordion-slider">
                {vehicles.map((car, index) => (
                    <div 
                        key={car.id || car._id}
                        className={`slide ${activeIndex === index ? 'active' : ''}`}
                        style={{ 
                            backgroundImage: `url("${car.imageUrl}")`,
                            backgroundColor: '#1a1a1a', 
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                        onClick={() => setActiveIndex(index)}
                    >
                        <div className="slide-content">
                            <div className="slide-number">0{index + 1}</div>
                            <div className="car-brand">{(car.make || car.brand)}</div>
                            <div className="car-name">{car.model}</div>
                            
                            <div className="car-specs">
                                <div className="spec-row">
                                    <span className="spec-label">Daily Price</span>
                                    <span className="spec-value">${car.dailyRate || car.pricePerDay} USD</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                                <button 
                                    className="details-btn"
                                    style={{
                                        padding: '12px',
                                        background: 'transparent',
                                        border: '1px solid #e46033',
                                        color: '#e46033',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        borderRadius: '4px'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`/details/${car.id || car._id}`, '_blank');
                                    }}
                                >
                                    DETAILS
                                </button>
                                <button 
                                    className="rent-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/booking/${car.id || car._id}?from=catalog`;
                                    }}
                                >
                                    RENT NOW
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Catalog;