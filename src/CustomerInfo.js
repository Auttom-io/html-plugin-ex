import { useEffect, useState } from 'react'
import { useDataContext } from './Context';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCurrencySymbol, getFuelTypeIcon } from './Helper';
import BookingProgressNew from './BookingProgressNew';
import CartSummary from './CartSummary';
import PhoneNumber from './components/PhoneNumber';
import axios from 'axios';

const CustomerInfo = () => {

    const navigate = useNavigate();
    const { t } = useTranslation();

    const {
        config,
        selectedCar,
        selectedInsurance,
        setSelectedInsurance,
        selectedExtras,
        setSelectedExtras,
        searchData,
        stage,
        setStage,
    } = useDataContext();

    console.log("CarDetails: selectedInsurance", selectedInsurance);

    const [availableInsurance, setAvailableInsurance] = useState([]);
    const [availableExtras, setAvailableExtras] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        phoneCountry: '+1',
        phoneNumber: '',
        address: '',
        address2: '',
        acceptPrivacyPolicy: false,
        acceptTermsConditions: false
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const currencySymbol = getCurrencySymbol(config?.currency);

    useEffect(() => {

        if(!selectedCar) {
            navigate("/car-details");
            return;
        }

        console.log("CarDetails: selectedCar", selectedCar);
        setStage(4); // Set stage to 4 for Customer Info

    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear validation error for this field when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prevErrors => ({
                ...prevErrors,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Reset validation errors and submission state
        setValidationErrors({});
        setSubmitError('');
        
        const errors = {};
        
        // Validate required fields
        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
        }
        
        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else {
            // Email validation regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.email = 'Please enter a valid email address';
            }
        }
        
        if (!formData.dateOfBirth.trim()) {
            errors.dateOfBirth = 'Date of birth is required';
        }
        
        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required';
        } else {
            // Basic phone number validation (digits, spaces, dashes, parentheses)
            const phoneRegex = /^[\d\s\-\(\)\+]+$/;
            if (!phoneRegex.test(formData.phoneNumber)) {
                errors.phoneNumber = 'Please enter a valid phone number';
            }
        }
        
        if (!formData.acceptPrivacyPolicy) {
            errors.acceptPrivacyPolicy = 'You must accept the Privacy Policy to continue';
        }
        
        if (!formData.acceptTermsConditions) {
            errors.acceptTermsConditions = 'You must accept the Terms and Conditions to continue';
        }
        
        // If there are errors, set them and stop submission
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
        
        console.log('Form Data:', formData);

        // Start submission process
        setIsSubmitting(true);

        try {
            // Calculate total price
            const totalPrice = (selectedCar ? selectedCar.totalPrice : 0) + 
                             (selectedInsurance ? selectedInsurance.totalPrice : 0) + 
                             selectedExtras.reduce((total, extra) => total + extra.totalPrice, 0);

            // Prepare booking data for API
            const bookingData = {
                vehicle_id: selectedCar?.id,
                vehicle: selectedCar?.name,
                pickUpId: searchData?.pickUpId,
                dropOffId: searchData?.dropOffId,
                bookingStart: searchData?.bookingStart,
                bookingEnd: searchData?.bookingEnd,
                customerInfo: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    dateOfBirth: formData.dateOfBirth,
                    phone: formData.phoneCountry + formData.phoneNumber,
                    address: formData.address,
                    address2: formData.address2
                },
                extras: selectedExtras.map(extra => ({
                    id: extra.id,
                    quantity: extra.quantity || 1,
                    price: extra.totalPrice
                })),
                insurance: selectedInsurance ? {
                    id: selectedInsurance.id,
                    price: selectedInsurance.totalPrice
                } : null,
                totalPrice: totalPrice
            };

            console.log('Submitting booking data:', bookingData);

            // Call the booking confirmation endpoint
            
            const response = await axios.post(config.buildUri('/reservations/public/create_booking_v2'), bookingData);

            console.log('Booking confirmed:', response);

            // Success - update UI
            setStage(5); // Set stage to 5 for completed booking
            setBookingConfirmed(true); // Show confirmation screen

        } catch (error) {
            console.error('Booking submission error:', error);
            
            // Handle different types of errors
            let errorMessage = 'An unexpected error occurred. Please try again.';
            
            if (error.message) {
                if (error.message.includes('api_error')) {
                    errorMessage = 'Unable to connect to booking service. Please check your connection and try again.';
                } else if (error.message.includes('booking_failed')) {
                    errorMessage = 'Booking confirmation failed. Please verify your information and try again.';
                } else if (error.message.includes('invalid_data')) {
                    errorMessage = 'Some booking information is missing or invalid. Please review your details.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const BookingConfirmation = () => {
        return (
            <main className='mb-2'>
                <section>
                    <BookingProgressNew />
                </section>
                <section className="mt-3">
                    <div className="container pb-3">
                        <div className="row justify-content-center">
                            <div className="col-12 col-lg-8">
                                <div className="confirmation-container">
                                    <div className="success-icon">
                                        <i className="bi bi-check-circle-fill"></i>
                                    </div>
                                    
                                    <h1 className="confirmation-title">
                                        {'Booking Confirmed!'}
                                    </h1>
                                    
                                    <p className="confirmation-subtitle">
                                        {'Thank you for your reservation. Your booking has been successfully submitted and you will receive a confirmation email shortly.'}
                                    </p>

                                    <div className="booking-details">
                                        <div className="detail-row">
                                            <span className="detail-label">{'Vehicle'}</span>
                                            <span className="detail-value">{selectedCar?.name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">{'Customer'}</span>
                                            <span className="detail-value">{formData.firstName} {formData.lastName}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">{'Email'}</span>
                                            <span className="detail-value">{formData.email}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">{'Total Amount'}</span>
                                            <span className="detail-value">
                                                {currencySymbol}{(selectedCar ? selectedCar.totalPrice : 0) + (selectedInsurance ? selectedInsurance.totalPrice : 0) + selectedExtras.reduce((total, extra) => total + extra.totalPrice, 0)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="next-steps">
                                        <div className="next-steps-title">
                                            <i className="bi bi-info-circle-fill"></i>
                                            {'What happens next?'}
                                        </div>
                                        <ul className="next-steps-list">
                                            <li>{'You will receive a confirmation email with your booking details within the next few minutes'}</li>
                                            <li>{'Our team will contact you within 24 hours to confirm your pickup details'}</li>
                                            <li>{'Payment will be collected at the rental desk when you pick up your vehicle'}</li>
                                            <li>{'Please bring a valid driver\'s license and credit card for the security deposit'}</li>
                                        </ul>
                                    </div>

                                    <div className="action-buttons">
                                        <button 
                                            className="btn-primary-custom"
                                            onClick={() => navigate('/')}
                                        >
                                            <i className="bi bi-house"></i>
                                            {'Back to Home'}
                                        </button>
                                        <button 
                                            className="btn-outline-custom"
                                            onClick={() => navigate('/cars')}
                                        >
                                            <i className="bi bi-car-front"></i>
                                            {'Browse More Cars'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        );
    };

    if (bookingConfirmed) {
        return <BookingConfirmation />;
    }

    return (
        <main className='mb-2'>
            <section>
                <BookingProgressNew />
            </section>
            <section class="mt-3">
                <div class="container pb-3">
                    <div class="row">
                        <div class="col-12 col-lg-8">
                            <div class="row">
                                <p class="h5">Billing address</p>
                            </div>
                            <div class="card">
                                <form class="card-body needs-validation" onSubmit={handleSubmit}>
                                    <div class="row g-3">
                                        <div class="col-sm-6">
                                        <label for="firstName" class="form-label">First name <span class="text-muted">*</span></label>
                                        <input 
                                            type="text" 
                                            class={`form-control ${validationErrors.firstName ? 'is-invalid' : ''}`}
                                            id="firstName" 
                                            name="firstName"
                                            placeholder="" 
                                            value={formData.firstName} 
                                            onChange={handleInputChange}
                                            required 
                                        />
                                        {validationErrors.firstName && (
                                            <div class="invalid-feedback d-block">
                                                {validationErrors.firstName}
                                            </div>
                                        )}
                                        </div>

                                        <div class="col-sm-6">
                                        <label for="lastName" class="form-label">Last name <span class="text-muted">*</span></label>
                                        <input 
                                            type="text" 
                                            class={`form-control ${validationErrors.lastName ? 'is-invalid' : ''}`}
                                            id="lastName" 
                                            name="lastName"
                                            placeholder="" 
                                            value={formData.lastName} 
                                            onChange={handleInputChange}
                                            required 
                                        />
                                        {validationErrors.lastName && (
                                            <div class="invalid-feedback d-block">
                                                {validationErrors.lastName}
                                            </div>
                                        )}
                                        </div>

                                        <div class="col-12">
                                        <label for="email" class="form-label">Email <span class="text-muted">*</span></label>
                                        <input 
                                            type="email" 
                                            class={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                                            id="email" 
                                            name="email"
                                            placeholder="you@example.com" 
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {validationErrors.email && (
                                            <div class="invalid-feedback d-block">
                                                {validationErrors.email}
                                            </div>
                                        )}
                                        </div>

                                        <div class="col-12">
                                        <label for="dateOfBirth" class="form-label">Date of Birth <span class="text-muted">*</span></label>
                                        <input 
                                            type="date" 
                                            class={`form-control ${validationErrors.dateOfBirth ? 'is-invalid' : ''}`}
                                            id="dateOfBirth" 
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {validationErrors.dateOfBirth && (
                                            <div class="invalid-feedback d-block">
                                                {validationErrors.dateOfBirth}
                                            </div>
                                        )}
                                        </div>

                                        <PhoneNumber
                                            phoneCountry={formData.phoneCountry}
                                            phoneNumber={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            validationError={validationErrors.phoneNumber}
                                            required={true}
                                        />

                                        <div class="col-12">
                                        <label for="address" class="form-label">Address</label>
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            id="address" 
                                            name="address"
                                            placeholder="1234 Main St" 
                                            value={formData.address}
                                            onChange={handleInputChange}
                                        />
                                        <div class="invalid-feedback">
                                            Please enter your booking address.
                                        </div>
                                        </div>

                                        <div class="col-12">
                                        <label for="address2" class="form-label">Address 2 <span class="text-muted">(Optional)</span></label>
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            id="address2" 
                                            name="address2"
                                            placeholder="Apartment or suite" 
                                            value={formData.address2}
                                            onChange={handleInputChange}
                                        />
                                        </div>
                                    </div>

                                    <hr class="my-4" />

                                    {submitError && (
                                        <div class="alert alert-danger" role="alert">
                                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                                            {submitError}
                                        </div>
                                    )}

                                    <div class="form-check mb-3">
                                        <input 
                                            class={`form-check-input ${validationErrors.acceptPrivacyPolicy ? 'is-invalid' : ''}`}
                                            type="checkbox" 
                                            id="acceptPrivacyPolicy"
                                            name="acceptPrivacyPolicy"
                                            checked={formData.acceptPrivacyPolicy}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <label class="form-check-label" for="acceptPrivacyPolicy">
                                            {'I have read, understood and I accept the'} <a href="https://www.auttom.io/terms-and-conditions" target="_blank" rel="noopener noreferrer" class="text-decoration-none">{'Privacy Policy'}</a>
                                        </label>
                                        {validationErrors.acceptPrivacyPolicy && (
                                            <div class="invalid-feedback d-block">
                                                {validationErrors.acceptPrivacyPolicy}
                                            </div>
                                        )}
                                    </div>

                                    <div class="form-check mb-3">
                                        <input 
                                            class={`form-check-input ${validationErrors.acceptTermsConditions ? 'is-invalid' : ''}`}
                                            type="checkbox" 
                                            id="acceptTermsConditions"
                                            name="acceptTermsConditions"
                                            checked={formData.acceptTermsConditions}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <label class="form-check-label" for="acceptTermsConditions">
                                            {'I acknowledge that I have read, understood and agree to the'} <a href="https://www.auttom.io/terms-and-conditions" target="_blank" rel="noopener noreferrer" class="text-decoration-none">{'Terms and Conditions'}</a>
                                        </label>
                                        {validationErrors.acceptTermsConditions && (
                                            <div class="invalid-feedback d-block">
                                                {validationErrors.acceptTermsConditions}
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        class="w-100 btn btn-primary" 
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                {'Processing booking...'}
                                            </>
                                        ) : (
                                            'Book now & pay at desk'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <CartSummary />
                    </div>
                </div>
            </section>
      </main>
    );
};

export default CustomerInfo;