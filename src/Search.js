import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './frontend.css';

import { useDataContext } from './Context';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Typeahead } from 'react-bootstrap-typeahead';
import { formatDateTime, addDays, addHours } from './Helper';
import { useEffect, useState } from 'react';

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
    const [ sameDropOffLocation, setSameDropOffLocation ] = useState(_sameDropOffLocation);

    const [bookingStartTime, setBookingStartTime] = useState(_bookingStartTime);
    const [bookingEndTime, setBookingEndTime] = useState(_bookingEndTime);
    const [earliestBookingEndTime, setEarliestBookingEndTime] = useState(_earliestBookingEndTime);

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

const PickUpControl = ( { locations, value, touched, onChange } ) => {

    const { t } = useTranslation();
    const { __ } = t;
    const isInvalid = touched && (!Array.isArray(value) || !value.length);

    return (
        <div className="search-field">
            <label className="search-label">Pickup Location</label>
            <div className={`search-input-container ${isInvalid ? 'is-invalid' : ''}`}>
                <div className="search-icon">
                    <i className="bi bi-geo-alt"></i>
                </div>
                <Typeahead
                    id="auttom_pickUpLocation"
                    labelKey="fullAddress"
                    onChange={onChange}
                    options={locations}
                    placeholder="Select pickup location"
                    inputProps={{ 
                        required: true,
                        autoComplete: "on"
                    }}
                    className="search-typeahead"
                    isInvalid={isInvalid}
                    selected={value}
                />
                {isInvalid && (
                    <div className="search-error-icon">
                        <i className="bi bi-exclamation-circle"></i>
                    </div>
                )}
            </div>
        </div>
    );
};

const DropOffControl = ( { locations, value, touched, onChange } ) => {

    const isInvalid = touched === true && (!Array.isArray(value) || !value.length);

    return (
        <div className="search-field">
            <label className="search-label">Return Location</label>
            <div className={`search-input-container ${isInvalid ? 'is-invalid' : ''}`}>
                <div className="search-icon">
                    <i className="bi bi-geo-alt"></i>
                </div>
                <Typeahead
                    id="auttom_dropOffLocation"
                    labelKey="fullAddress"
                    onChange={onChange}
                    options={locations}
                    placeholder="Select return location"
                    inputProps={{ 
                        required: true,
                        autoComplete: "off"
                    }}
                    className="search-typeahead"
                    isInvalid={isInvalid}
                    selected={value}
                />
                {isInvalid && (
                    <div className="search-error-icon">
                        <i className="bi bi-exclamation-circle"></i>
                    </div>
                )}
            </div>
        </div>
    );
};

const BookingStartControl = ({value, isInvalid, onChange}) => {
    const hasError = !value;
    
    return (
        <div className="search-field">
            <label className="search-label">From</label>
            <div className={`search-input-container ${hasError && isInvalid ? 'is-invalid' : ''}`}>
                <input 
                    type="datetime-local" 
                    value={value} 
                    min={formatDateTime(new Date())} 
                    onChange={onChange} 
                    required 
                    className="search-input"
                    id="auttom_bookingStart"
                />
                {hasError && isInvalid && (
                    <div className="search-error-icon">
                        <i className="bi bi-exclamation-circle"></i>
                    </div>
                )}
            </div>
        </div>
    );
};

const BookingEndControl = ({value, earliestBookingEndTime, isInvalid, onChange}) => {
    const hasError = !value;
    
    return (
        <div className="search-field">
            <label className="search-label">Until</label>
            <div className={`search-input-container ${hasError && isInvalid ? 'is-invalid' : ''}`}>
                <input 
                    type="datetime-local" 
                    value={value} 
                    min={earliestBookingEndTime} 
                    onChange={onChange} 
                    required 
                    className="search-input"
                    id="auttom_bookingEnd"
                />
                {hasError && isInvalid && (
                    <div className="search-error-icon">
                        <i className="bi bi-exclamation-circle"></i>
                    </div>
                )}
            </div>
        </div>
    );
};

const AgeGroupControl = ({value, onChange}) => {
    return (
        <div className="search-field compact">
            <label className="search-label">Age</label>
            <div className="search-input-container">
                <select 
                    required 
                    defaultValue={value} 
                    onChange={onChange} 
                    className="search-select" 
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

const SameDropOffLocationControl = ({value, onChange}) => {
    return (
        <div className="search-checkbox-group">
            <input 
                checked={value === true} 
                onChange={onChange} 
                className="search-checkbox" 
                type="checkbox" 
                id="auttom_sameReturnLocation"
            />
            <label className="search-checkbox-label" htmlFor="auttom_sameReturnLocation">
                Same return location
            </label>
        </div>
    );
};

const Search = (props) => {

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

    const [formSubmitted, setFormSubmitted] = useState(false);

    useEffect(() => {
        setStage(1); // Set the stage to 1 (Search)
    }, []);

    const searchCars = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setPickUpLocationChanged(true);
        setDropOffLocationChanged(true);

        if(bookingStartTime && bookingEndTime && pickUpLocation && pickUpLocation.length > 0 && dropOffLocation && dropOffLocation.length > 0)
        {
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
        }
        else {
            console.log('Check your data and try again.');
        }
    }

    return (
        <div className="search-widget">
            <form>
                {/* Main inline search form */}
                <div className="search-form-inline">
                    {sameDropOffLocation === false ? (
                        <>
                            <PickUpControl 
                                locations={locations} 
                                value={pickUpLocation} 
                                touched={pickUpLocationChanged} 
                                onChange={(data) => {
                                    setPickUpLocation(data);
                                    setPickUpLocationChanged(true);
                                }}  
                            />
                            <DropOffControl 
                                locations={locations} 
                                value={dropOffLocation} 
                                touched={dropOffLocationChanged} 
                                onChange={(data) => {
                                    setDropOffLocation(data);
                                    setDropOffLocationChanged(true);
                                }} 
                            />
                        </>
                    ) : (
                        <PickUpControl 
                            locations={locations} 
                            value={pickUpLocation} 
                            touched={pickUpLocationChanged} 
                            onChange={(data) => setPickUpLocation(data)} 
                        />
                    )}
                    
                    <BookingStartControl 
                        value={bookingStartTime} 
                        isInvalid={formSubmitted} 
                        onChange={(e) => {
                            const startDate = e.target.value;
                            const firstPossibleEndTime = formatDateTime(addHours(startDate, 1));

                            setBookingStartTime(startDate);
                            setEarliestBookingEndTime(firstPossibleEndTime);

                            if(new Date(startDate).getTime() >= new Date(bookingEndTime).getTime()) {
                                setBookingEndTime(firstPossibleEndTime);
                            }
                        }} 
                    />
                    
                    <BookingEndControl 
                        value={bookingEndTime} 
                        earliestBookingEndTime={earliestBookingEndTime} 
                        isInvalid={formSubmitted} 
                        onChange={(e) => setBookingEndTime(e.target.value)} 
                    />

                    <AgeGroupControl 
                        value={ageGroup} 
                        onChange={(e) => setAgeGroup(e.target.value)} 
                    />

                    <div className="search-field submit-field">
                        <label className="search-label" style={{opacity: 0}}>Search</label>
                        <button 
                            type="submit" 
                            className="search-submit-btn" 
                            onClick={searchCars}
                        > 
                            <i className="bi bi-search"></i>
                            Search
                        </button>
                    </div>
                </div>

                {/* Options row */}
                <div className="search-options">
                    <SameDropOffLocationControl 
                        value={sameDropOffLocation} 
                        onChange={(e) => setSameDropOffLocation(!sameDropOffLocation)} 
                    />
                </div>
            </form>
            
            <footer className="search-footer">
                <small>
                    Powered by <a href="https://auttom.io">Auttom</a>
                </small>
            </footer>
        </div>
    );
};

export default Search;