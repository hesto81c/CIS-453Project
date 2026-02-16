import React, { useEffect, useState } from 'react';
import { getVehicles } from '../services/api';

const Catalog = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await getVehicles();
                setCars(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching cars:", error);
                setLoading(false);
            }
        };
        fetchCars();
    }, []);

    if (loading) return <p>Loading catalog...</p>;

    return (
        <div className="catalog-container">
            <h1>Explore Our Fleet</h1>
            <div className="car-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {cars.map(car => (
                    <div key={car.id} className="car-card" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                        <h3>{car.make} {car.model}</h3>
                        <p>Category: {car.category}</p>
                        <p>Daily Rate: ${car.dailyRate}</p>
                        <button disabled={car.status !== 'available'}>
                            {car.status === 'available' ? 'Book Now' : 'Not Available'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Catalog;