import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { __ } from '@wordpress/i18n';
import { useDataContext } from './Context';
import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import { Typeahead } from 'react-bootstrap-typeahead';
import { formatDateTime, addDays, addHours } from './Helper';
import BookingProgressNew from './BookingProgressNew';
import { useEffect } from 'react';

const useData = () => {
    const {
        config,
        locations,
        searchData,
        setSearchData,
        stage,
        setStage,
    } = useDataContext();

    const todayDate = new Date();
    const todayDateLocal = formatDateTime(todayDate);
    const tomorrowDateLocal = formatDateTime(addDays(todayDate, 1));

    // set default values
    const _ageGroup = searchData?.ageGroup || 24;
    const _pickUpLocation = locations.filter(x => x.id === searchData?.pickUpId);
    const _dropOffLocation = locations.filter(x => x.id === searchData?.dropOffId);
    const _sameDropOffLocation = searchData?.sameDropOffLocation || false;
    const _bookingStartTime = searchData?.bookingStart || todayDateLocal;
    const _bookingEndTime = searchData?.bookingEnd || tomorrowDateLocal;
    const _earliestBookingEndTime = formatDateTime(addHours(_bookingStartTime, 1));

    // set state values
    const [ageGroup, setAgeGroup] = useState(_ageGroup);

    const [pickUpLocation, setPickUpLocation] = useState(_pickUpLocation);
    const [pickUpLocationChanged, setPickUpLocationChanged] = useState(false);

    const [dropOffLocation, setDropOffLocation] = useState(_dropOffLocation);
    const [dropOffLocationChanged, setDropOffLocationChanged] = useState(false);
    const [sameDropOffLocation, setSameDropOffLocation] = useState(_sameDropOffLocation);

    const [bookingStartTime, setBookingStartTime] = useState(_bookingStartTime);
    const [bookingEndTime, setBookingEndTime] = useState(_bookingEndTime);
    const [earliestBookingEndTime, setEarliestBookingEndTime] = useState(_earliestBookingEndTime);

    const nonce = 'auttom_rental_nonce';
    apiFetch.use(apiFetch.createNonceMiddleware(nonce));

    return {
        config,
        locations,
        searchData,
        setSearchData,
        pickUpLocation,
        setPickUpLocation,
        pickUpLocationChanged,
        setPickUpLocationChanged,
        dropOffLocation,
        setDropOffLocation,
        dropOffLocationChanged,
        setDropOffLocationChanged,
        ageGroup,
        setAgeGroup,
        bookingStartTime,
        setBookingStartTime,
        bookingEndTime,
        setBookingEndTime,
        earliestBookingEndTime,
        setEarliestBookingEndTime,
        sameDropOffLocation,
        setSameDropOffLocation,
        stage,
        setStage,
    };
}

const PickUpControl = ({ locations, value, touched, iconColor, onChange, label = 'PICK UP LOCATION' }) => {
    return (
        <div className="input-group-container">
            <label className="input-label">{__(label, 'auttom-rental-config')}</label>
            <div className="input-with-icon">
                <div className="input-icon">
                    <i className="bi bi-geo-alt" style={{...iconColor}}></i>
                </div>
                <div className={`custom-typeahead ${touched && (!Array.isArray(value) || !value.length) ? 'is-invalid' : ''}`}>
                    <Typeahead
                        id="auttom_pickUpLocation"
                        labelKey="fullAddress"
                        onChange={onChange}
                        options={locations}
                        placeholder={__('Pick up location', 'auttom-rental-config')}
                        inputProps={{
                            required: true
                        }}
                        isInvalid={touched && (!Array.isArray(value) || !value.length)}
                        selected={value}
                    />
                </div>
            </div>
        </div>
    );
};

const DropOffControl = ({ locations, value, touched, iconColor, onChange }) => {
    return (
        <div className="input-group-container">
            <label className="input-label">{__('RETURN LOCATION', 'auttom-rental-config')}</label>
            <div className="input-with-icon">
                <div className="input-icon">
                    <i className="bi bi-geo-alt" style={{...iconColor}}></i>
                </div>
                <div className={`custom-typeahead ${touched && (!Array.isArray(value) || !value.length) ? 'is-invalid' : ''}`}>
                    <Typeahead
                        id="auttom_dropOffLocation"
                        labelKey="fullAddress"
                        onChange={onChange}
                        options={locations}
                        placeholder={__('Return location', 'auttom-rental-config')}
                        inputProps={{
                            required: true
                        }}
                        isInvalid={touched === true && (!Array.isArray(value) || !value.length)}
                        selected={value}
                    />
                </div>
            </div>
        </div>
    );
};

const BookingStartControl = ({ value, isInvalid, onChange }) => {
    return (
        <div className="input-group-container">
            <label className="input-label">{__('PICK UP DATE & TIME', 'auttom-rental-config')}</label>
            <div className="input-with-icon">
                <div className="input-icon">
                    <i className="bi bi-calendar3"></i>
                </div>
                <input 
                    type="datetime-local" 
                    value={value} 
                    min={formatDateTime(new Date())} 
                    onChange={onChange} 
                    required 
                    className={`custom-input ${isInvalid ? 'is-invalid' : ''}`}
                    id="auttom_bookingStart" 
                    placeholder="Pick up date"
                />
            </div>
        </div>
    );
};

const BookingEndControl = ({ value, earliestBookingEndTime, isInvalid, onChange }) => {
    return (
        <div className="input-group-container">
            <label className="input-label">{__('RETURN DATE & TIME', 'auttom-rental-config')}</label>
            <div className="input-with-icon">
                <div className="input-icon">
                    <i className="bi bi-calendar3"></i>
                </div>
                <input 
                    type="datetime-local" 
                    value={value} 
                    min={earliestBookingEndTime} 
                    onChange={onChange} 
                    required 
                    className={`custom-input ${isInvalid ? 'is-invalid' : ''}`}
                    id="auttom_bookingEnd" 
                    placeholder="Return date"
                />
            </div>
        </div>
    );
};

const AgeGroupControl = ({ value, onChange }) => {
    return (
        <div className="input-group-container">
            <label className="input-label">{__('DRIVER AGE', 'auttom-rental-config')}</label>
            <div className="input-with-icon">
                <div className="input-icon">
                    <i className="bi bi-person"></i>
                </div>
                <select 
                    required 
                    defaultValue={value} 
                    onChange={onChange} 
                    className="custom-select" 
                    id="auttom_AgeGroup"
                >
                    <option value="18">18</option>
                    <option value="19">19</option>
                    <option value="20">20</option>
                    <option value="21">21</option>
                    <option value="22">22</option>
                    <option value="23">23</option>
                    <option value="24">24+</option>
                </select>
            </div>
        </div>
    );
};

const SameDropOffLocationControl = ({ value, onChange }) => {
    return (
        <div className="checkbox-container">
            <label className="custom-checkbox">
                <input 
                    checked={value === true} 
                    onChange={onChange} 
                    type="checkbox" 
                    id="auttom_sameReturnLocation"
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">{__('SAME RETURN LOCATION', 'auttom-rental-config')}</span>
            </label>
        </div>
    );
};

const SearchNew = (props) => {
    const navigate = useNavigate();

    const {
        config,
        locations,
        searchData,
        setSearchData,
        ageGroup,
        setAgeGroup,
        bookingStartTime,
        setBookingStartTime,
        bookingEndTime,
        setBookingEndTime,
        earliestBookingEndTime,
        setEarliestBookingEndTime,
        sameDropOffLocation,
        setSameDropOffLocation,
        pickUpLocation,
        setPickUpLocation,
        pickUpLocationChanged,
        setPickUpLocationChanged,
        dropOffLocation,
        setDropOffLocation,
        dropOffLocationChanged,
        setDropOffLocationChanged,
        stage,
        setStage,
    } = useData();

    useEffect(() => {
        setStage(1); // Set the stage to 1 (Search)
    }, []);

    const backgroundColorStyle = config?.backgroundColor ? { backgroundColor: config.backgroundColor } : {};
    const iconColor = config?.iconColor ? { color: config.iconColor } : {};

    const searchCars = (e) => {
        e.preventDefault();
        setPickUpLocationChanged(true);
        setDropOffLocationChanged(true);

        if (bookingStartTime && bookingEndTime && pickUpLocation && pickUpLocation.length > 0 && dropOffLocation && dropOffLocation.length > 0) {
            const _searchData = {
                pickUpId: pickUpLocation[0].id,
                dropOffId: dropOffLocation[0].id,
                bookingStart: bookingStartTime,
                bookingEnd: bookingEndTime,
                sameDropOffLocation: sameDropOffLocation,
                ageGroup: ageGroup
            };

            setSearchData(_searchData);
            navigate("/cars");
        } else {
            console.log('Check your data and try again.');
        }
    }

    return (
        <main className="search-main" style={{...backgroundColorStyle}}>
            <style jsx>{`
                .search-main {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    min-height: 100vh;
                    padding: 1rem 0;
                }

                .search-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                .search-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .search-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #212529;
                    margin-bottom: 0.5rem;
                    text-transform: none;
                }

                .search-subtitle {
                    color: #6c757d;
                    font-size: 1.1rem;
                    margin: 0;
                }

                .search-form {
                    background: white;
                    padding: 2rem;
                    border-radius: 20px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e9ecef;
                    margin-bottom: 2rem;
                }

                .form-grid {
                    display: grid;
                    gap: 1.5rem;
                    grid-template-columns: 1fr;
                }

                .location-section {
                    display: grid;
                    gap: 1rem;
                    grid-template-columns: 1fr;
                }

                .datetime-section {
                    display: grid;
                    gap: 1rem;
                    grid-template-columns: 1fr;
                }

                .options-section {
                    display: grid;
                    gap: 1rem;
                    grid-template-columns: 1fr;
                }

                .input-group-container {
                    position: relative;
                }

                .input-label {
                    display: block;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #6c757d;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 0.5rem;
                }

                .input-with-icon {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    z-index: 10;
                    color: #6c757d;
                    font-size: 1.1rem;
                    pointer-events: none;
                }

                .custom-input,
                .custom-select {
                    width: 100%;
                    padding: 1rem 1rem 1rem 3rem;
                    border: 2px solid #e9ecef;
                    border-radius: 12px;
                    font-size: 1rem;
                    background: white;
                    transition: all 0.2s ease;
                    appearance: none;
                }

                .custom-select {
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 1rem center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                    padding-right: 3rem;
                }

                .custom-input:focus,
                .custom-select:focus {
                    outline: none;
                    border-color: #495057;
                    box-shadow: 0 0 0 3px rgba(73, 80, 87, 0.1);
                }

                .custom-input.is-invalid,
                .custom-select.is-invalid {
                    border-color: #dc3545;
                }

                .custom-typeahead {
                    width: 100%;
                    position: relative;
                }

                .custom-typeahead .rbt-input-main {
                    width: 100%;
                    padding: 1rem 1rem 1rem 3rem !important;
                    border: 2px solid #e9ecef !important;
                    border-radius: 12px !important;
                    font-size: 1rem !important;
                    background: white !important;
                    transition: all 0.2s ease !important;
                    box-shadow: none !important;
                }

                .custom-typeahead .rbt-input-main:focus {
                    outline: none !important;
                    border-color: #495057 !important;
                    box-shadow: 0 0 0 3px rgba(73, 80, 87, 0.1) !important;
                }

                .custom-typeahead.is-invalid .rbt-input-main {
                    border-color: #dc3545 !important;
                }

                .custom-typeahead .rbt-menu {
                    border-radius: 12px !important;
                    border: 2px solid #e9ecef !important;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
                    margin-top: 0.5rem !important;
                }

                .custom-typeahead .rbt-menu-item {
                    padding: 0.75rem 1rem !important;
                    border-bottom: 1px solid #f8f9fa !important;
                }

                .custom-typeahead .rbt-menu-item:hover,
                .custom-typeahead .rbt-menu-item.active {
                    background: #f8f9fa !important;
                    color: #495057 !important;
                }

                .checkbox-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem 0;
                }

                .custom-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    user-select: none;
                }

                .custom-checkbox input[type="checkbox"] {
                    display: none;
                }

                .checkmark {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #e9ecef;
                    border-radius: 4px;
                    background: white;
                    position: relative;
                    transition: all 0.2s ease;
                }

                .custom-checkbox input[type="checkbox"]:checked + .checkmark {
                    background: #495057;
                    border-color: #495057;
                }

                .custom-checkbox input[type="checkbox"]:checked + .checkmark::after {
                    content: '';
                    position: absolute;
                    left: 6px;
                    top: 2px;
                    width: 6px;
                    height: 10px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }

                .checkbox-label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #495057;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .search-button-container {
                    text-align: center;
                    margin-top: 1.5rem;
                }

                .search-button {
                    background: linear-gradient(135deg, #495057 0%, #343a40 100%);
                    color: white;
                    border: none;
                    padding: 1rem 3rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 200px;
                    box-shadow: 0 4px 16px rgba(73, 80, 87, 0.2);
                }

                .search-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(73, 80, 87, 0.3);
                }

                .search-button:active {
                    transform: translateY(0);
                }

                .footer {
                    text-align: center;
                    margin-top: 2rem;
                }

                .footer-text {
                    color: #6c757d;
                    font-size: 0.9rem;
                    font-weight: 300;
                    margin: 0;
                }

                .footer-link {
                    color: #6c757d;
                    text-decoration: none;
                    border-bottom: 1px solid transparent;
                    transition: border-color 0.2s ease;
                }

                .footer-link:hover {
                    color: #495057;
                    border-bottom-color: #495057;
                }

                @media (max-width: 767px) {
                    .search-title {
                        font-size: 1.75rem;
                    }

                    .search-subtitle {
                        font-size: 1rem;
                    }

                    .search-form {
                        padding: 1.5rem;
                        border-radius: 16px;
                    }

                    .search-button {
                        width: 100%;
                        padding: 1.25rem;
                        font-size: 0.95rem;
                    }
                }

                @media (min-width: 768px) {
                    .location-section {
                        grid-template-columns: 1fr 1fr;
                    }

                    .datetime-section {
                        grid-template-columns: 1fr 1fr;
                    }

                    .options-section {
                        grid-template-columns: 1fr 1fr;
                        align-items: center;
                    }
                }

                @media (min-width: 1024px) {
                    .form-grid {
                        gap: 2rem;
                    }

                    .search-form {
                        padding: 3rem;
                    }
                }
            `}</style>

            <BookingProgressNew />
            
            <div className="search-container">
                <div className="search-header">
                    <h1 className="search-title">Find your perfect rental car</h1>
                    <p className="search-subtitle">Compare prices and book your ideal vehicle in minutes</p>
                </div>

                <form className="search-form" onSubmit={searchCars}>
                    <div className="form-grid">
                        {/* Location Section */}
                        <div className="location-section">
                            <PickUpControl 
                                locations={locations} 
                                value={pickUpLocation} 
                                touched={pickUpLocationChanged} 
                                iconColor={iconColor} 
                                onChange={(data) => {
                                    setPickUpLocation(data);
                                    setPickUpLocationChanged(true);
                                    if (sameDropOffLocation) {
                                        setDropOffLocation(data);
                                        setDropOffLocationChanged(true);
                                    }
                                }}
                                label={sameDropOffLocation ? 'PICK UP & RETURN LOCATION' : 'PICK UP LOCATION'}
                            />
                            
                            {!sameDropOffLocation && (
                                <DropOffControl 
                                    locations={locations} 
                                    value={dropOffLocation} 
                                    touched={dropOffLocationChanged} 
                                    iconColor={iconColor} 
                                    onChange={(data) => {
                                        setDropOffLocation(data);
                                        setDropOffLocationChanged(true);
                                    }} 
                                />
                            )}
                        </div>

                        {/* Date & Time Section */}
                        <div className="datetime-section">
                            <BookingStartControl 
                                value={bookingStartTime} 
                                isInvalid={!bookingStartTime} 
                                onChange={(e) => {
                                    const startDate = e.target.value;
                                    const firstPossibleEndTime = formatDateTime(addHours(startDate, 1));

                                    setBookingStartTime(startDate);
                                    setEarliestBookingEndTime(firstPossibleEndTime);

                                    if (new Date(startDate).getTime() >= new Date(bookingEndTime).getTime()) {
                                        setBookingEndTime(firstPossibleEndTime);
                                    }
                                }} 
                            />

                            <BookingEndControl 
                                value={bookingEndTime} 
                                earliestBookingEndTime={earliestBookingEndTime} 
                                isInvalid={!bookingEndTime} 
                                onChange={(e) => setBookingEndTime(e.target.value)} 
                            />
                        </div>

                        {/* Options Section */}
                        <div className="options-section">
                            <AgeGroupControl 
                                value={ageGroup} 
                                onChange={(e) => setAgeGroup(e.target.value)} 
                            />

                            <SameDropOffLocationControl 
                                value={sameDropOffLocation} 
                                onChange={(e) => {
                                    const newValue = !sameDropOffLocation;
                                    setSameDropOffLocation(newValue);
                                    if (newValue && pickUpLocation.length > 0) {
                                        setDropOffLocation(pickUpLocation);
                                        setDropOffLocationChanged(true);
                                    }
                                }} 
                            />
                        </div>
                    </div>

                    <div className="search-button-container">
                        <button type="submit" className="search-button">
                            Search Available Cars
                        </button>
                    </div>
                </form>

                <footer className="footer">
                    <p className="footer-text">
                        Powered by <a href="https://auttom.io" className="footer-link">@Auttom</a>
                    </p>
                </footer>
            </div>
        </main>
    );
};

export default SearchNew;
