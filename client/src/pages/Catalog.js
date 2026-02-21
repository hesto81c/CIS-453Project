import React, { useState, useEffect } from 'react';

import axios from 'axios';

import '../styles/Catalog.css';



/**

 * RENTAL10 SHOWROOM COMPONENT

 * Final Version: English Comments & Image Fixes

 */

const Catalog = () => {

    const [vehicles, setVehicles] = useState([]);

    const [activeIndex, setActiveIndex] = useState(0);



    useEffect(() => {

        // Fetching fleet data from our Express API (Port 5000)

        axios.get('http://localhost:5000/api/cars')

            .then(res => {

                console.log("Fleet loaded:", res.data);

                setVehicles(res.data);

            })

            .catch(err => {

                console.error("Connection Error: Make sure your backend is running!", err);

            });

    }, []);



    return (

        <div className="slider-container">

            {/* Showroom Header Badge */}

            <div className="now-showing">Rental10 Showroom</div>

            

            <div className="accordion-slider">

                {vehicles.map((car, index) => (

                    <div 

                        key={car.id}

                        // Applies 'active' class to expand the selected slide

                        className={`slide ${activeIndex === index ? 'active' : ''}`}

                        style={{ 

                            /* FIX: Adding double quotes to the URL and 

                               setting a solid background color as a fallback 

                               if the Unsplash link is broken.

                            */

                            backgroundImage: `url("${car.imageUrl}")`,

                            backgroundColor: '#1a1a1a', 

                            backgroundSize: 'cover',

                            backgroundPosition: 'center'

                        }}

                        onClick={() => setActiveIndex(index)}

                    >

                        {/* Information Layer: Only visible when the slide is active */}

                        <div className="slide-content">

                            <div className="slide-number">0{index + 1}</div>

                            <div className="car-brand">{car.make}</div>

                            <div className="car-name">{car.model}</div>

                            

                            <div className="car-specs">

                                <div className="spec-row">

                                    <span className="spec-label">Daily Price</span>

                                    <span className="spec-value">${car.dailyRate} USD</span>

                                </div>

                                <div className="spec-row">

                                    <span className="spec-label">Transmission</span>

                                    <span className="spec-value">{car.transmission || 'Automatic'}</span>

                                </div>

                            </div>



                            {/* Action Button: Linked to the unique car ID */}

                            <button 

                                className="rent-btn"

                                onClick={(e) => {

                                    e.stopPropagation(); // Prevents the slide from closing when clicking the button

                                    window.location.href = `/booking/${car.id}`;

                                }}

                            >

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