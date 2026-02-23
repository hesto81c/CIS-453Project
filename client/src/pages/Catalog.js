import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Catalog.css';

const Catalog = () => {
    const [vehicles,     setVehicles]     = useState([]);
    const [activeIndex,  setActiveIndex]  = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5000/api/cars')
            .then(res => setVehicles(res.data))
            .catch(err => console.error("Error:", err));
    }, []);

    // Hovered takes priority over clicked
    const expandedIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

    return (
        <div className="slider-container">
            <div className="now-showing">Rental10 Showroom</div>
            <div className="accordion-slider">
                {vehicles.map((car, index) => {
                    const isExpanded = expandedIndex === index;
                    return (
                        <div
                            key={car.id || car._id}
                            className={`slide ${isExpanded ? 'active' : ''}`}
                            style={{
                                backgroundImage:    `url("${car.imageUrl}")`,
                                backgroundColor:    '#0e0e14',
                                backgroundSize:     'cover',
                                backgroundPosition: 'center',
                            }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => setActiveIndex(index)}
                        >
                            {/* Collapsed vertical label */}
                            <div className="slide-label-collapsed">
                                <span className="label-number">0{index + 1}</span>
                                <span className="label-name">{car.make} {car.model}</span>
                            </div>

                            {/* Expanded content */}
                            <div className="slide-content">
                                <div className="slide-number">0{index + 1}</div>
                                <div className="car-brand">{car.make || car.brand}</div>
                                <div className="car-name">{car.model}</div>

                                <div className="car-specs">
                                    <div className="spec-row">
                                        <span className="spec-label">Daily Rate</span>
                                        <span className="spec-value">${car.dailyRate || car.pricePerDay} USD</span>
                                    </div>
                                    <div className="spec-row">
                                        <span className="spec-label">Year</span>
                                        <span className="spec-value">{car.year}</span>
                                    </div>
                                    <div className="spec-row">
                                        <span className="spec-label">Category</span>
                                        <span className="spec-value" style={{ textTransform:'capitalize' }}>{car.category}</span>
                                    </div>
                                </div>

                                <div className="slide-buttons">
                                    <button
                                        className="details-btn"
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
                    );
                })}
            </div>
        </div>
    );
};

export default Catalog;