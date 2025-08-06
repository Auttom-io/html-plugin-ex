import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

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

    return (
        <>
            <label for="auttom_pickUpLocation" class="fw-medium">
                <small>PICK UP LOCATION</small>
            </label>
            <div class="d-flex">
                <div class="input-group-text" style={{borderTopRightRadius: 0, borderBottomRightRadius: 0}}>
                    <i class="bi bi-geo-alt" ></i>
                </div>

                <Typeahead
                    id="auttom_pickUpLocation"
                    labelKey="fullAddress"
                    onChange={onChange}
                    options={locations}
                    placeholder={'Pick up'}
                    inputProps={{required: true, style: {borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}}
                    isInvalid={touched && (!Array.isArray(value) || !value.length)}
                    style={{width: '100%'}}
                    selected={value}
                />
            </div>
        </>
    );
};

const DropOffControl = ( { locations, value, touched, onChange } ) => {

    return (
        <>
            <label for="auttom_returnLocation" class="fw-medium">
                <small>{'RETURN LOCATION'}</small>
            </label>
            <div class="d-flex">
                <div class="input-group-text" style={{borderTopRightRadius: 0, borderBottomRightRadius: 0}}>
                    <i class="bi bi-geo-alt"></i>
                </div>

                <Typeahead
                        id="auttom_dropOffLocation"
                        labelKey="fullAddress"
                        onChange={onChange}
                        options={locations}
                        placeholder={'Return'}
                        inputProps={{required: true, style: {borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}}
                        isInvalid={touched === true && (!Array.isArray(value) || !value.length)}
                        style={{width: '100%'}}
                        selected={value}
                    />
            </div>
        </>
    );
};

const BookingStartControl = ({value, isInvalid, onChange}) => {
    return (
        <>
            <label for="auttom_bookingStart" class="fw-medium"><small>{'FROM'}</small></label>
            <div class="input-group">
                <input type="datetime-local" value={value} min={formatDateTime(new Date())} onChange={onChange} required className={"form-control" + isInvalid} id="auttom_bookingStart" placeholder="From"/>
            </div>
        </>
    );
};

const BookingEndControl = ({value, earliestBookingEndTime, isInvalid, onChange}) => {
    return (
        <>
            <label for="auttom_bookingEnd" class="fw-medium"><small>{'UNTIL'}</small></label>
            <div class="input-group">
                <input type="datetime-local" value={value} min={earliestBookingEndTime} onChange={onChange} required className={"form-control" + isInvalid} id="auttom_bookingEnd" placeholder="From"/>
            </div>
        </>
    );
};

const AgeGroupControl = ({value, onChange}) => {
    return (
        <div class="form-floating mt-2">
            <select required defaultValue={value} onChange={onChange} class="form-select small" id="auttom_AgeGroup" aria-label="Floating label select example" style={ {maxWidth: 'fit-content', fontSize: 'smaller'} }>
                <option value="18">18</option>
                <option value="19">19</option>
                <option value="20">20</option>
                <option value="21">21</option>
                <option value="22">22</option>
                <option value="23">23</option>
                <option value="24">24+</option>
            </select>
            <label for="auttom_AgeGroup" style={ {maxWidth: 'fit-content', fontSize: 'smaller'} }><small>{'AGE'}</small></label>
        </div>
    );
};

const SameDropOffLocationControl = ({value, onChange}) => {
    return (
        <div class="form-check mt-2">
            <input required checked={value === true} onChange={onChange} class="form-check-input" type="checkbox" id="auttom_sameReturnLocation"/>
            <label class="form-check-label fw-medium" for="auttom_sameReturnLocation">
                <small style={ {fontSize: 'smaller'} }>{'SAME RETURN LOCATION'}</small>
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

    useEffect(() => {
        setStage(1); // Set the stage to 1 (Search)
    }, []);

    const searchCars = (e) => {
        e.preventDefault();
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
        <>
            {/* <BookingProgressNew /> */}
            <div class="container py-3">
                <form>
                    {/* Main form row */}
                    <div class="row g-3">
                        {sameDropOffLocation === false &&
                            <>
                                {/* Pick Up Location - Full width on mobile, 4 columns on larger screens */}
                                <div class="col-12 col-md-4">
                                    <PickUpControl locations={locations} value={pickUpLocation} touched={pickUpLocationChanged} onChange={(data) => {
                                        setPickUpLocation(data);
                                        setPickUpLocationChanged(true);
                                        }}  />
                                </div>

                                {/* Drop Off Location - Full width on mobile, 4 columns on larger screens */}
                                <div class="col-12 col-md-4">
                                    <DropOffControl locations={locations} value={dropOffLocation} touched={dropOffLocationChanged} onChange={(data) => {
                                        setDropOffLocation(data);
                                        setDropOffLocationChanged(true);
                                    }} />
                                </div>
                            </>
                        }

                        {sameDropOffLocation === true &&
                            <>
                                {/* Single location when same pickup/dropoff - Full width on mobile, 8 columns on larger screens */}
                                <div class="col-12 col-md-8">
                                    <PickUpControl locations={locations} value={pickUpLocation} touched={pickUpLocationChanged} onChange={(data) => setPickUpLocation(data)} />
                                </div>
                            </>
                        }

                        {/* Start Date Control - Full width on mobile, 2 columns on larger screens */}
                        <div class="col-12 col-md-2">
                            <BookingStartControl value={bookingStartTime} isInvalid={!bookingStartTime ? ' is-invalid' : ''} onChange={(e) => {
                                const startDate = e.target.value;
                                const firstPossibleEndTime = formatDateTime(addHours(startDate, 1));

                                setBookingStartTime(startDate);
                                setEarliestBookingEndTime(firstPossibleEndTime);

                                if(new Date(startDate).getTime() >= new Date(bookingEndTime).getTime()) {
                                    setBookingEndTime(firstPossibleEndTime);
                                }

                            }} />
                        </div>

                        {/* End Date Control - Full width on mobile, 2 columns on larger screens */}
                        <div class="col-12 col-md-2">
                            <BookingEndControl value={bookingEndTime} earliestBookingEndTime={earliestBookingEndTime} isInvalid={!bookingEndTime ? ' is-invalid' : ''} onChange={(e) => setBookingEndTime(e.target.value)} />
                        </div>
                    </div>

                    {/* Secondary controls row */}
                    <div class="row g-3">
                        {/* Same Return Location Control */}
                        <div class="col-12 col-md-4">
                            <SameDropOffLocationControl value={sameDropOffLocation} onChange={(e) => setSameDropOffLocation(!sameDropOffLocation)} />
                        </div>

                        {/* Age Group Control */}
                        <div class="col-12 col-md-4">
                            <AgeGroupControl value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} />
                        </div>

                        {/* Submit Button - Full width on mobile, auto on larger screens */}
                        <div class="col-12 col-md-auto ms-md-auto d-flex align-items-end">
                            <button type="submit" class="btn btn-outline-dark rounded w-100" style={{ minHeight: '48px' }} onClick={searchCars}> 
                                <small class="fw-medium">BOOK NOW</small>
                            </button>
                        </div>
                    </div>
                </form>
                <footer className="d-flex justify-content-end">
                    <small className="text-muted" style={{fontWeight: 'lighter'}}>
                        Powered by <a href="https://auttom.io" class="link-secondary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">@Auttom </a>
                    </small>
                </footer>
            </div>
        </>
    );
};

export default Search;