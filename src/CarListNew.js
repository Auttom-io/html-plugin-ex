import { useEffect, useState } from 'react'
import { useDataContext } from './Context';
import { useNavigate } from 'react-router-dom';
import { getCurrencySymbol, getFuelTypeIcon } from './Helper';
import BookingProgressNew from './BookingProgressNew';
import axios from 'axios';

const CarListNew = () => {

    const navigate = useNavigate();

    const {
        config,
        setConfig,
        locations,
        setLocations,
        searchData,
        setSearchData,
        selectedCar,
        setSelectedCar,
        stage,
        setStage
    } = useDataContext();

    const carsPerPage = 6;
    const [sortOrder, setSortOrder] = useState('1');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [allCars, setAllCars] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]);
    const [displayedCars, setDisplayedCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentImageIndexes, setCurrentImageIndexes] = useState({});

    const [filteredCarsCount, setFilteredCarsCount] = useState(0);
    const [displayedCarsCount, setDisplayedCarsCount] = useState(0);

    const currencySymbol = getCurrencySymbol(config?.currency);

    useEffect(() => {

        if (!searchData) {
            navigate("/");
            return;
        }

        setStage(2); // Set the stage to 2 (Car List)
        setSelectedCar(null); // Reset selected car
        setLoading(true); // Start loading

        // api fetch post request to get cars based on search data
        console.log("Search Data: ", searchData);

        axios.get(config.buildUri(`/reservations/public/get-availability/${searchData.bookingStart}/${searchData.bookingEnd}`))
        .then((response) => {

            console.log("Available Cars: ", response.data);
            const cars = response.data.map(car => ({
                id: car.id,
                name: `${car.make?.name || ''} ${car.make_model || ''} ${car.make_year || ''}`,
                category: car.vehicle_class?.name || car.make.name,
                dailyPrice: car.dailyPrice,
                totalPrice: car.totalPrice,
                totalKm: car.last_odometer,
                fuelType: car.vehicle_tanks && car.vehicle_tanks.length > 0 ? car.vehicle_tanks[0].fuel.name : null,
                isAutomatic: car.is_automatic,
                luggageCapacity: car.luggage_capacity,
                hasAC: car.has_ac,
                passangerCapacity: car.passenger_count,
                images: car.vehicle_images?.map(image => image.image) || [car.make.logo],
            }));

            const _displayedCars = cars.slice(0, carsPerPage);

            setAllCars(cars);
            setFilteredCars(cars);
            setFilteredCarsCount(cars.length);

            setDisplayedCars(_displayedCars);
            setDisplayedCarsCount(_displayedCars.length);

            const _categories = cars
                .map(x => x.category)
                .filter((value, index, self) => value && self.indexOf(value) === index);

            setCategories(_categories);
            setLoading(false); // Stop loading
        }).catch((error) => {
            console.error('Error fetching cars:', error);
            setLoading(false); // Stop loading on error
        });

    }, []);

    const loadNextCars = () => {
        const nextCars = filteredCars.slice(displayedCarsCount, displayedCarsCount + carsPerPage);
        setDisplayedCars([...displayedCars, ...nextCars]);
        setDisplayedCarsCount(displayedCarsCount + nextCars.length);
    };

    const filterCars = (e) => {
        const categoryIndex = parseInt(e.target.value);
        let _filteredCars = allCars;

        if (categoryIndex > 0) {
            const categoryName = categories[categoryIndex - 1];
            _filteredCars = allCars.filter(car => car.category === categoryName);
            setSelectedCategory(categoryName);
        } else {
            setSelectedCategory('All');
        }

        sortCarsArray(_filteredCars, sortOrder);
        setFilteredCars(_filteredCars);
        setFilteredCarsCount(_filteredCars.length);

        const _displayedCars = _filteredCars.slice(0, carsPerPage);
        setDisplayedCars(_displayedCars);
        setDisplayedCarsCount(_displayedCars.length);
    };

    const sortCars = (e) => {
        const order = e.target.value;
        setSortOrder(order);

        const _filteredCars = [...filteredCars];
        sortCarsArray(_filteredCars, order);
        setFilteredCars(_filteredCars);

        const _displayedCars = _filteredCars.slice(0, displayedCarsCount);
        setDisplayedCars(_displayedCars);
    };

    const sortCarsArray = (cars, order) => {
        switch (order) {
            case '2': // Price ascending
                cars.sort((a, b) => a.totalPrice - b.totalPrice);
                break;
            case '3': // Price descending
                cars.sort((a, b) => b.totalPrice - a.totalPrice);
                break;
            default: // Best value
                break;
        }
    };

    const selectCar = (car) => {
        setSelectedCar(car);
        navigate("/car-details");
    };

    const handleImageNavigation = (carId, direction) => {
        setCurrentImageIndexes(prev => {
            const car = displayedCars.find(c => c.id === carId);
            if (!car || !car.images || car.images.length <= 1) return prev;

            const currentIndex = prev[carId] || 0;
            let newIndex;

            if (direction === 'next') {
                newIndex = currentIndex >= car.images.length - 1 ? 0 : currentIndex + 1;
            } else {
                newIndex = currentIndex <= 0 ? car.images.length - 1 : currentIndex - 1;
            }

            return {
                ...prev,
                [carId]: newIndex
            };
        });
    };

    const setImageIndex = (carId, index) => {
        setCurrentImageIndexes(prev => ({
            ...prev,
            [carId]: index
        }));
    };

    return (
        <main className='mb-2'>
            <section>
                <BookingProgressNew />
            </section>
            <section className="mt-3">
                <div className="container pb-3">
                    <div className="car-list">
                        {/* Page Header */}
                        <div className="page-header">
                            <h2 className="page-title">Choose your vehicle</h2>
                            <p className="results-info">
                                {displayedCarsCount > 0 
                                    ? `Showing 1–${displayedCarsCount} of ${filteredCarsCount} results` 
                                    : "Showing 0 results"
                                }
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="filters-section">
                            <div className="filters-grid">
                                <div className="filter-group">
                                    <label className="filter-label">Category</label>
                                    <select className="filter-select" onChange={filterCars}>
                                        <option value="0">All Categories</option>
                                        {categories.map((category, index) => (
                                            <option value={index + 1} key={index}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label className="filter-label">Sort by</label>
                                    <select className="filter-select" onChange={sortCars}>
                                        <option value="1">Best value</option>
                                        <option value="2">Price ascending</option>
                                        <option value="3">Price descending</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
                                <div className="text-center">
                                    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <div className="mt-3">
                                        <h5 className="text-muted">Loading available vehicles...</h5>
                                        <p className="text-muted">Please wait while we find the best options for you.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Car Grid */}
                                <div className="car-grid">
                                    {displayedCars.map((car, index) => (
                                        <div key={car.id} className="car-card">
                                            {/* Car Image */}
                                            <div className="car-image-container">
                                                <div className="car-image-carousel">
                                                    {car.images && car.images.length > 0 ? (
                                                        car.images.map((image, imageIndex) => (
                                                            <img 
                                                                key={imageIndex}
                                                                src={image || '/placeholder-car.jpg'} 
                                                                alt={`${car.name} - Image ${imageIndex + 1}`}
                                                                className={`car-image ${(currentImageIndexes[car.id] || 0) === imageIndex ? 'active' : ''}`}
                                                            />
                                                        ))
                                                    ) : (
                                                        <img 
                                                            src="/placeholder-car.jpg" 
                                                            alt={car.name}
                                                            className="car-image active"
                                                        />
                                                    )}

                                                    {/* Navigation buttons - only show if multiple images */}
                                                    {car.images && car.images.length > 1 && (
                                                        <>
                                                            <button 
                                                                className="image-nav-button prev"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleImageNavigation(car.id, 'prev');
                                                                }}
                                                                aria-label="Previous image"
                                                            >
                                                                <i className="bi bi-chevron-left"></i>
                                                            </button>
                                                            <button 
                                                                className="image-nav-button next"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleImageNavigation(car.id, 'next');
                                                                }}
                                                                aria-label="Next image"
                                                            >
                                                                <i className="bi bi-chevron-right"></i>
                                                            </button>

                                                            {/* Image indicators */}
                                                            <div className="image-indicators">
                                                                {car.images.map((_, indicatorIndex) => (
                                                                    <div
                                                                        key={indicatorIndex}
                                                                        className={`image-indicator ${(currentImageIndexes[car.id] || 0) === indicatorIndex ? 'active' : ''}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setImageIndex(car.id, indicatorIndex);
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                
                                                <div className="car-category-badge">
                                                    {car.category}
                                                </div>
                                            </div>

                                            {/* Car Content */}
                                            <div className="car-content">
                                                <h3 className="car-name">{car.name}</h3>
                                                <p className="car-subtitle">or similar</p>

                                                {/* Features */}
                                                <div className="car-features">
                                                    <div className="feature-item">
                                                        <i className="bi bi-speedometer2 feature-icon" ></i>
                                                        <span>{car.totalKm ? `${car.totalKm.toLocaleString()} km` : '-'}</span>
                                                    </div>
                                                    <div className="feature-item">
                                                        <i className={`${getFuelTypeIcon(car.fuelType)} feature-icon`} ></i>
                                                        <span>{car.fuelType || '-'}</span>
                                                    </div>
                                                    <div className="feature-item">
                                                        <i className="bi bi-gear feature-icon" ></i>
                                                        <span>{car.isAutomatic ? 'Automatic' : 'Manual'}</span>
                                                    </div>
                                                    <div className="feature-item">
                                                        <i className="bi bi-people feature-icon" ></i>
                                                        <span>{car.passangerCapacity ? `${car.passangerCapacity} Passengers` : '-'}</span>
                                                    </div>
                                                    <div className="feature-item">
                                                        <i className="bi bi-luggage feature-icon" ></i>
                                                        <span>{car.luggageCapacity ? `${car.luggageCapacity} Luggage` : '-'}</span>
                                                    </div>
                                                    {car.hasAC && (
                                                        <div className="feature-item">
                                                            <i className="bi bi-fan feature-icon" ></i>
                                                            <span>AC</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Footer */}
                                                <div className="car-footer">
                                                    <div className="price-section">
                                                        <div className="daily-price">
                                                            {currencySymbol}{car.dailyPrice} / Day
                                                        </div>
                                                        <div className="total-price">
                                                            {currencySymbol}{car.totalPrice} Total
                                                        </div>
                                                    </div>
                                                    <button 
                                                        className="select-button"
                                                        onClick={() => selectCar(car)}
                                                    >
                                                        Select Vehicle
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Load More */}
                                {displayedCarsCount < filteredCarsCount && (
                                    <div className="load-more-section">
                                        <button className="load-more-button" onClick={loadNextCars}>
                                            <i className="bi bi-plus-circle"></i>
                                            Show more vehicles
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default CarListNew;
