import { useEffect } from 'react'
import { useDataContext } from './Context';
import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import { getCurrencySymbol, getFuelTypeIcon } from './Helper';
import BookingProgress from './BookingProgress';
import BookingProgressNew from './BookingProgressNew';

const CarList = () => {

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

    const [filteredCarsCount, setFilteredCarsCount] = useState(0);
    const [displayedCarsCount, setDisplayedCarsCount] = useState(0);

    const backgroundColorStyle = config?.backgroundColor ? { backgroundColor: config.backgroundColor } : {};
    const iconColorStyle = config?.iconColor ? { color: config.iconColor } : {};
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

        apiFetch({
            path: '/auttom-rental/v2/availability',
            method: 'POST',
            data: searchData
        }).then((response) => {
            const cars = response.map(car => ({
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
    }

    const filterCars = (event) => {
        const _category = event.target.options[event.target.selectedIndex].text;
        setSelectedCategory(_category);
        filterAndSortCars(_category, sortOrder)
    }

    const sortCars = (event) => {
        const _sortOrder = event.target.value;
        setSortOrder(_sortOrder);
        filterAndSortCars(selectedCategory, _sortOrder)
    }

    const filterAndSortCars = (category, sort) => {
        let _filteredCars = allCars;
        if (category !== 'All') {
            _filteredCars = allCars.filter(car => car.category === category);
        }

        if (sort === '1') {
            _filteredCars = _filteredCars.sort((a, b) => a.totalPrice - b.totalPrice);
        }
        else if (sort === '2') {
            _filteredCars = _filteredCars.sort((a, b) => a.dailyPrice - b.dailyPrice);
        }
        else if (sort === '3') {
            _filteredCars = _filteredCars.sort((a, b) => b.dailyPrice - a.dailyPrice);
        }

        setFilteredCars(_filteredCars);
        setFilteredCarsCount(_filteredCars.length);

        const _displayedCars = _filteredCars.slice(0, carsPerPage);
        setDisplayedCars(_displayedCars);
        setDisplayedCarsCount(_displayedCars.length);
    }

    const selectCar = (car) => {
        setSelectedCar(car);
        navigate("/car-details");
    }

    return (
        <main className='mb-2' style={{ ...backgroundColorStyle }}>
            <section>
                <BookingProgressNew />
            </section>
            <section class="mt-3">
                <div class="container pb-3">

                    <div class="mt-3 row">
                        <p class="h5">Choose your vehicle</p>
                    </div>

                    <div class="mt-3 row" style={{ alignItems: "baseline" }}>
                        <div class="col-8">
                            <p> {displayedCarsCount > 0 ? `Showing 1–${displayedCarsCount} of ${filteredCarsCount} results` : "Showing 0 results"} </p>
                        </div>
                        <div class="col">
                            <div class="form-floating">
                                <select class="form-select" id="floatingSelect" aria-label="Floating label select example" onChange={filterCars}>
                                    <option value="0" selected>All</option>
                                    {categories.map((category, index) => {
                                        return (
                                            <option value={index + 1} key={index}>{category}</option>
                                        )
                                    })}
                                </select>
                                <label for="floatingSelect">Choose category</label>
                            </div>
                        </div>
                        <div class="col">
                            <div class="form-floating">
                                <select class="form-select" id="floatingSelect" aria-label="Floating label select example" onChange={sortCars}>
                                    <option value="1" selected>Best value</option>
                                    <option value="2">Price ascending</option>
                                    <option value="3">Price descending</option>
                                </select>
                                <label for="floatingSelect">Sort by</label>
                            </div>
                        </div>
                    </div>

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
                            {displayedCars.map((car, index) =>
                            (<div class="card mb-3 shadow">
                                <div class="row g-0">
                                    <div class="col-md-4">
                                        <div id={`auttom_carousel_${index}`} class="carousel slide carousel-fade">
                                            <div class="carousel-indicators">
                                                <button type="button" data-bs-target={`#auttom_carousel_${index}`} data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
                                                <button type="button" data-bs-target={`#auttom_carousel_${index}`} data-bs-slide-to="1" aria-label="Slide 2"></button>
                                                <button type="button" data-bs-target={`#auttom_carousel_${index}`} data-bs-slide-to="2" aria-label="Slide 3"></button>
                                            </div>
                                            <div class="carousel-inner">

                                                {car.images.map((image, imgIndex) => (
                                                    <div class={`carousel-item ${imgIndex === 0 ? 'active' : ''}`} key={imgIndex}>
                                                        <img src={image} class="d-block w-100" alt={`Car image ${imgIndex + 1}`} style={{ maxHeight: "300px", objectFit: "cover", padding: "5px" }}/>
                                                    </div>
                                                ))}                                   
                                            </div>
                                            <button class="carousel-control-prev" type="button" data-bs-target={`#auttom_carousel_${index}`} data-bs-slide="prev">
                                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                                <span class="visually-hidden">Previous</span>
                                            </button>
                                            <button class="carousel-control-next" type="button" data-bs-target={`#auttom_carousel_${index}`} data-bs-slide="next">
                                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                                <span class="visually-hidden">Next</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="col-md-8">
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-7 border-end">
                                                    <p class="fs-6">{car.category}</p>
                                                    <p>
                                                        <span class="fw-medium fs-5">{car.name}</span> <br />
                                                        <span class="text-muted fs-6">or similar</span>
                                                    </p>
                                                    <div class="row">
                                                        <div class="col">
                                                            <i class="bi bi-speedometer2" style={{ fontSize: "1.5rem", ...iconColorStyle }}></i>
                                                            <small class="text-muted"> {car.totalKm ? `${car.totalKm.toLocaleString()} km` : '-'}</small>
                                                        </div>
                                                        <div class="col">
                                                            <i class={getFuelTypeIcon(car.fuelType)} style={{ fontSize: "1.5rem", ...iconColorStyle }}></i>
                                                            <small class="text-muted"> {car.fuelType || '-'}</small>
                                                        </div>
                                                        <div class="col">
                                                            <i class="bi bi-gear" style={{ fontSize: "1.5rem", ...iconColorStyle }}></i>
                                                            <small class="text-muted"> {car.isAutomatic ? 'Automatic' : 'Manual'}</small>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col">
                                                            <i class="bi bi-people" style={{ fontSize: "1.5rem", ...iconColorStyle }}></i>
                                                            <small class="text-muted"> {car.passangerCapacity ? `${car.passangerCapacity} Passangers` : '-'}</small>
                                                        </div>
                                                        <div class="col">
                                                            <i class="bi bi-luggage" style={{ fontSize: "1.5rem", ...iconColorStyle }}></i>
                                                            <small class="text-muted"> {car.luggageCapacity ? `${car.luggageCapacity} Luggage` : '-'} </small>
                                                        </div>
                                                        <div class="col">
                                                            {car.hasAC &&
                                                                <>
                                                                    <i class="bi bi-fan" style={{ fontSize: "1.5rem", ...iconColorStyle }}></i>
                                                                    <small class="text-muted"> AC</small>
                                                                </>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-5 align-content-center text-center">
                                                    <p>
                                                        <span class="fw-medium fs-5">{currencySymbol} {car.dailyPrice} / Day  </span> <br />
                                                        <span class="text-muted fs-6">{currencySymbol} {car.totalPrice} Total</span>
                                                    </p>
                                                    <p>
                                                        <button type="button" class="btn btn-outline-dark rounded" onClick={(e) => selectCar(car)}> Select </button>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ))}

                            {displayedCarsCount < filteredCarsCount &&
                                <div class="row mt-3">
                                    <div class="col-auto">
                                        <button type="button" class="btn btn-secondary rounded" onClick={loadNextCars}> + Show more </button>
                                    </div>
                                </div>
                            }
                        </>
                    )}
                </div>
            </section>
        </main>
    );
};

export default CarList;