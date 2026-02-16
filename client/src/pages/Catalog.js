import React, { useEffect, useState } from 'react';
import { getVehicles } from '../services/api';

const Catalog = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // API call on page load (FR2)
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
            <h1>Explora nuestra flota</h1>
            <div className="car-grid">
                {cars.map(car => (
                    <div key={car.id} className="car-card">
                        <h3>{car.make} {car.model}</h3>
                        <p>Categoría: {car.category}</p>
                        <p>Precio por día: ${car.dailyRate}</p>
                        <button disabled={car.status !== 'available'}>
                            {car.status === 'available' ? 'Reservar ahora' : 'No disponible'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Catalog;