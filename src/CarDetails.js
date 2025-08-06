import { useEffect, useState } from 'react'
import { useDataContext } from './Context';
import { useNavigate } from 'react-router-dom';
import { dayDiff, getCurrencySymbol, getFuelTypeIcon } from './Helper';
import axios from 'axios';
import BookingProgressNew from './BookingProgressNew';
import CartSummary from './CartSummary';
import CarExtras from './CarExtras';

const CarDetails = () => {

    const navigate = useNavigate();

    const {
        config,
        searchData,
        selectedCar,
        selectedInsurance,
        setSelectedInsurance,
        selectedExtras,
        setSelectedExtras,
        stage,
        setStage,
    } = useDataContext();

    console.log("CarDetails: selectedInsurance", selectedInsurance);

    const [availableInsurance, setAvailableInsurance] = useState([]);
    const [availableExtras, setAvailableExtras] = useState([]);
    const [loading, setLoading] = useState(false);

    const backgroundColorStyle = config?.backgroundColor ? { backgroundColor: config.backgroundColor } : {};
    const iconColorStyle = config?.iconColor ? { color: config.iconColor } : {};
    const currencySymbol = getCurrencySymbol(config?.currency);

    useEffect(() => {

        if (!selectedCar) {
            navigate("/cars");
            return;
        }

        console.log("CarDetails: selectedCar", selectedCar);
        setStage(3); // Set stage to booking
        setLoading(true); // Start loading

        axios.get(config.buildUri('/rental-extras/public'))
        .then((response) => {

            // calculate the total duration of the booking in days
            const bookingDays = dayDiff(searchData.bookingStart, searchData.bookingEnd);

            const _insurance = response.data
                .filter(x => x.type === "Insurance")
                .map((item, index) => ({
                    id: item.id,
                    name: item.name,
                    isIncluded: !item.price || item.price === 0,
                    dailyPrice: item.charged_daily ? item.price : 0,
                    totalPrice: item.charged_daily ? item.price * bookingDays : item.price,
                    premium: item.insurance_premium,
                    protection: item.texts?.map((text, index) => ({
                        type: text.text,
                        isCovered: text.included
                    }))
                }));

            const _extras = response.data
                .filter(x => x.type === "Extras")
                .map((item, index) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    billedDaily: item.charged_daily,
                    isIncluded: !item.price || item.price === 0,
                    dailyPrice: item.charged_daily ? item.price : 0,
                    totalPrice: item.charged_daily ? item.price * bookingDays : item.price,
                    maxItems: item.max_items_allowed,
                }));

            console.log("CarDetails: availableExtras", _extras);
            setAvailableInsurance(_insurance || []);
            setAvailableExtras(_extras || []);

            if (_insurance) {
                setSelectedInsurance(_insurance.find(item => item.isIncluded === true) || null);
            }

            if (_extras) {
                const _selectedExtras = _extras.filter(item => item.isIncluded === true);
                setSelectedExtras(_selectedExtras || []);
            }

            setLoading(false); // Stop loading
        }).catch((error) => {
            console.error('Error fetching car extras:', error);
            setLoading(false); // Stop loading on error
        });
        
    }, []);

    const selectInsurance = (insuranceItem) => {
        debugger;
        if (!insuranceItem) return;
        if (insuranceItem.id === selectedInsurance?.id) {
            // If the same insurance is clicked again, deselect it
            let _selectedInsurance = availableInsurance.find(item => item.isIncluded === true);

            setSelectedInsurance(_selectedInsurance || null); // Reset to the included insurance if available, otherwise null
        } else {
            // Otherwise, select the new insurance
            setSelectedInsurance(insuranceItem);
        }
    }

    const selectExtra = (extra) => {
        setSelectedExtras(prevExtras => {
            const existingIndex = prevExtras.findIndex(e => e.id === extra.id);
            if (existingIndex > -1) {
                // If already selected, remove it
                return prevExtras.filter(e => e.id !== extra.id);
            } else {
                // Otherwise, add it
                return [...prevExtras, extra];
            }
        });
    }

    return (
        <main className='mb-2' style={{ ...backgroundColorStyle }}>
            <section>
                <BookingProgressNew />
            </section>
            <section class="mt-3">
                <div class="container pb-3">
                    <div class="row">
                        <div class="col-12 col-lg-8">
                            <div class="row">
                                <p class="h5">Protection & Extras</p>
                            </div>

                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
                                    <div className="text-center">
                                        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <div className="mt-3">
                                            <h5 className="text-muted">Loading protection & extras...</h5>
                                            <p className="text-muted">Please wait while we prepare your options.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <CarExtras
                                    availableInsurance={availableInsurance}
                                    availableExtras={availableExtras}
                                    selectedInsurance={selectedInsurance}
                                    selectedExtras={selectedExtras}
                                    onSelectInsurance={selectInsurance}
                                    onSelectExtra={selectExtra}
                                    config={config}
                                />
                            )}
                        </div>

                        <CartSummary showPromoCode={true} showCheckoutButton={true} />
                    </div>
                </div>
            </section>
        </main>
    );
};

export default CarDetails;