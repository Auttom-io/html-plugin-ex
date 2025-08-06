import { useTranslation } from 'react-i18next';
import { useDataContext } from './Context';
import { useNavigate } from 'react-router-dom';
import { getCurrencySymbol } from './Helper';

const BookingProgressNew = () => {
    const navigate = useNavigate();

    const {
        config,
        locations,
        searchData,
        selectedCar,
        selectedInsurance,
        selectedExtras,
        stage,
    } = useDataContext();

    const pickUpLocation = locations.find(location => location.id === searchData?.pickUpId);
    const dropOffLocation = searchData?.sameDropOffLocation === true
        ? pickUpLocation 
        : locations.find(location => location.id === searchData?.dropOffId);

    const backgroundColorStyle = config?.backgroundColor ? { backgroundColor: config.backgroundColor } : {};
    const iconColorStyle = config?.iconColor ? { color: config.iconColor } : {};
    const currencySymbol = getCurrencySymbol(config?.currency);

    const insurancePrice = selectedInsurance?.totalPrice || 0;
    const extrasPrice = selectedExtras.reduce((total, extra) => total + extra.totalPrice, 0);
    const totalExtrasPrice = insurancePrice + extrasPrice;
    const totalPrice = (selectedCar?.totalPrice + totalExtrasPrice) || 0;

    let extrasDescription = selectedInsurance?.name || '';
    if (selectedExtras.length > 0) {
        const selectedExtrasNames = selectedExtras.map(extra => extra.name).join(' | ');
        extrasDescription += selectedExtrasNames.length > 0 ? ` | ${selectedExtrasNames}` : '';
    }

    const steps = [
        {
            id: 1,
            title: "Location & Dates",
            shortTitle: "Location",
            icon: "bi-geo-alt",
            isCompleted: stage > 1,
            isCurrent: stage === 1,
            onClick: () => navigate("/"),
            content: {
                location: searchData?.sameDropOffLocation ? 
                    (pickUpLocation?.address || 'Please select a location') : 
                    `${pickUpLocation?.address || 'Pick up location'} → ${dropOffLocation?.address ||'Drop off location'}`,
                dates: searchData?.bookingStart && searchData?.bookingEnd ? 
                    `${searchData.bookingStart.replace('T', ' ')} - ${searchData.bookingEnd.replace('T', ' ')}` :
                   'Please select dates'
            }
        },
        {
            id: 2,
            title: "Vehicle Selection",
            shortTitle: "Vehicle",
            icon: "bi-car-front",
            isCompleted: stage > 2,
            isCurrent: stage === 2,
            onClick: () => navigate("/cars"),
            content: {
                vehicle: selectedCar?.name || "No vehicle selected",
                price: stage > 2 ? `${currencySymbol}${selectedCar?.totalPrice}` : null
            }
        },
        {
            id: 3,
            title: "Protection & Extras",
            shortTitle: "Extras",
            icon: "bi-shield-check",
            isCompleted: stage > 3,
            isCurrent: stage === 3,
            onClick: () => navigate("/car-details"),
            content: {
                extras: stage >= 3 ? (extrasDescription || "No extras selected") : "Not available yet",
                price: stage >= 3 ? `${currencySymbol}${totalExtrasPrice}` : null
            }
        },
        {
            id: 4,
            title: "Review & Book",
            shortTitle: "Review",
            icon: "bi-check-circle",
            isCompleted: stage > 4,
            isCurrent: stage === 4,
            onClick: null,
            content: {
                total: stage >= 3 ? `Total: ${currencySymbol}${totalPrice}` : "Complete previous steps",
                price: null
            }
        }
    ];

    const progressPercentage = ((stage - 1) / (steps.length - 1)) * 100;

    return (
        <div className="container-fluid py-3" style={{...backgroundColorStyle}}>
            {/* Progress Bar - Desktop */}
            <div className="d-none d-lg-block mb-4">
                <div className="position-relative">
                    {/* Progress Line */}
                    <div className="progress position-absolute w-100" style={{ height: '4px', top: '24px', zIndex: 1 }}>
                        <div 
                            className="progress-bar bg-success" 
                            role="progressbar" 
                            style={{ width: `${progressPercentage}%` }}
                            aria-valuenow={progressPercentage} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                        ></div>
                    </div>
                    
                    {/* Steps */}
                    <div className="d-flex justify-content-between position-relative" style={{ zIndex: 2 }}>
                        {steps.map((step, index) => (
                            <div key={step.id} className="text-center" style={{ flex: 1 }}>
                                {/* Step Circle */}
                                <div 
                                    className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${
                                        step.isCompleted ? 'bg-success text-white' : 
                                        step.isCurrent ? 'bg-primary text-white' : 
                                        'bg-light border text-muted'
                                    }`}
                                    style={{ 
                                        width: '48px', 
                                        height: '48px', 
                                        cursor: step.onClick && step.isCompleted ? 'pointer' : 'default',
                                        border: step.isCurrent ? '3px solid #0d6efd' : '2px solid #dee2e6'
                                    }}
                                    onClick={step.onClick && step.isCompleted ? step.onClick : undefined}
                                >
                                    {step.isCompleted ? (
                                        <i className="bi bi-check-lg fs-5"></i>
                                    ) : (
                                        <i className={`${step.icon} fs-5`}></i>
                                    )}
                                </div>
                                
                                {/* Step Title */}
                                <div className="small fw-bold text-dark">{step.title}</div>
                                
                                {/* Step Content */}
                                <div className="mt-2">
                                    {step.id === 1 && (
                                        <>
                                            <div className="small text-muted">{step.content.location}</div>
                                            <div className="small text-muted">{step.content.dates}</div>
                                        </>
                                    )}
                                    {step.id === 2 && (
                                        <>
                                            <div className="small text-dark">{step.content.vehicle}</div>
                                            {step.content.price && <div className="small text-success fw-bold">{step.content.price}</div>}
                                        </>
                                    )}
                                    {step.id === 3 && (
                                        <>
                                            <div className="small text-dark">{step.content.extras}</div>
                                            {step.content.price && <div className="small text-success fw-bold">{step.content.price}</div>}
                                        </>
                                    )}
                                    {step.id === 4 && (
                                        <div className="small text-primary fw-bold">{step.content.total}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Progress Steps - Mobile */}
            <div className="d-lg-none">
                {/* Mobile Progress Bar */}
                <div className="progress mb-3" style={{ height: '6px' }}>
                    <div 
                        className="progress-bar bg-success" 
                        role="progressbar" 
                        style={{ width: `${progressPercentage}%` }}
                        aria-valuenow={progressPercentage} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                    ></div>
                </div>

                {/* Current Step Info */}
                <div className="row align-items-center mb-3">
                    <div className="col-auto">
                        <div 
                            className={`rounded-circle d-flex align-items-center justify-content-center ${
                                steps[stage - 1]?.isCompleted ? 'bg-success text-white' : 
                                steps[stage - 1]?.isCurrent ? 'bg-primary text-white' : 
                                'bg-light border text-muted'
                            }`}
                            style={{ width: '40px', height: '40px' }}
                        >
                            {steps[stage - 1]?.isCompleted ? (
                                <i className="bi bi-check-lg"></i>
                            ) : (
                                <i className={steps[stage - 1]?.icon}></i>
                            )}
                        </div>
                    </div>
                    <div className="col">
                        <div className="fw-bold">{steps[stage - 1]?.title}</div>
                        <div className="small text-muted">Step {stage} of {steps.length}</div>
                    </div>
                </div>

                {/* Mobile Steps Summary */}
                <div className="accordion" id="progressAccordion">
                    {steps.map((step, index) => (
                        <div key={step.id} className="accordion-item border-0">
                            <h2 className="accordion-header">
                                <button 
                                    className={`accordion-button ${step.isCurrent ? '' : 'collapsed'} py-2 ${
                                        step.isCompleted ? 'bg-light' : ''
                                    }`}
                                    type="button" 
                                    data-bs-toggle="collapse" 
                                    data-bs-target={`#collapse${step.id}`}
                                    aria-expanded={step.isCurrent}
                                    aria-controls={`collapse${step.id}`}
                                >
                                    <div className="d-flex align-items-center w-100">
                                        <div 
                                            className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                                                step.isCompleted ? 'bg-success text-white' : 
                                                step.isCurrent ? 'bg-primary text-white' : 
                                                'bg-light border text-muted'
                                            }`}
                                            style={{ width: '32px', height: '32px', minWidth: '32px' }}
                                        >
                                            {step.isCompleted ? (
                                                <i className="bi bi-check-lg"></i>
                                            ) : (
                                                <span className="small fw-bold">{step.id}</span>
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">{step.shortTitle}</div>
                                        </div>
                                        {step.isCompleted && step.onClick && (
                                            <button 
                                                className="btn btn-sm btn-outline-secondary me-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    step.onClick();
                                                }}
                                            >
                                                <i className="bi bi-pencil" style={iconColorStyle}></i>
                                            </button>
                                        )}
                                    </div>
                                </button>
                            </h2>
                            <div 
                                id={`collapse${step.id}`} 
                                className={`accordion-collapse collapse ${step.isCurrent ? 'show' : ''}`}
                                data-bs-parent="#progressAccordion"
                            >
                                <div className="accordion-body py-2 ps-5">
                                    {step.id === 1 && (
                                        <>
                                            <div className="small text-muted mb-1">{step.content.location}</div>
                                            <div className="small text-muted">{step.content.dates}</div>
                                        </>
                                    )}
                                    {step.id === 2 && (
                                        <>
                                            <div className="small">{step.content.vehicle}</div>
                                            {step.content.price && <div className="small text-success fw-bold">{step.content.price}</div>}
                                        </>
                                    )}
                                    {step.id === 3 && (
                                        <>
                                            <div className="small">{step.content.extras}</div>
                                            {step.content.price && <div className="small text-success fw-bold">{step.content.price}</div>}
                                        </>
                                    )}
                                    {step.id === 4 && (
                                        <div className="small text-primary fw-bold">{step.content.total}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BookingProgressNew;
