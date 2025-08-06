import { useDataContext } from './Context';
import { useState } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import { getCurrencySymbol, getFuelTypeIcon } from './Helper';

const BookingProgress = () => {

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

    return (
        <div class="container-fluid">
            <div class="justify-content-md-center mt-3 p-3 row">
            <div class="col-sm-3">
                <div class="card shadow">
                <div class="card-body">
                    <div class="d-flex" style={{alignItems: "baseline", justifyContent: "space-between"}}>
                        <span class="badge bg-secondary" style= {{borderRadius: "30% 10%;"}}>1</span><h5 class="card-title h6 small"> RENTAL LOCATION </h5>
                        <i type="button" class="bi bi-pencil-square" style={{...iconColorStyle}} onClick={(e) => navigate("/")}></i>
                    </div>
                    <div class="row">
                        <div class={searchData?.sameDropOffLocation ? "col-12" : "col-6"}>
                            <span class="h6 small">{searchData?.sameDropOffLocation ? "Pick up & Return" : "Pick up"}</span>
                        </div>

                        { searchData?.sameDropOffLocation === false && 
                        <div class="col-6">
                            <span class="h6 small">Return</span>
                        </div>
                        }
                    </div>
                    <div class="row">
                        <div class={searchData?.sameDropOffLocation ? "col-12" : "col-6"}>
                            <small>
                                <strong>{pickUpLocation?.address}</strong>
                            </small>
                        </div>
                        { searchData?.sameDropOffLocation === false && 
                        <div class="col-6">
                            <small>
                                <strong>{dropOffLocation?.address}</strong>
                                </small>
                            </div>
                        }   
                    </div>
                    <div class="row">
                        <div class="col-6"><small class="text-muted">{searchData?.bookingStart?.replace('T', ' | ')}</small></div>
                        <div class="col-6"><small class="text-muted">{searchData?.bookingEnd?.replace('T', ' | ')}</small></div>
                    </div>
                </div>
                </div>
            </div>
            <div class="col-sm-3">
                <div class="card shadow">
                <div class="card-body">
                    {stage > 1 &&
                        <div class="d-flex" style={{alignItems: "baseline", justifyContent: "space-between"}}>
                            <span class="badge bg-secondary" style= {{borderRadius: "30% 10%;"}}>2</span><h5 class="card-title h6 small"> VEHICLE </h5>
                            <i type="button" class="bi bi-pencil-square" style={{...iconColorStyle}} onClick={(e) => navigate("/cars")}></i>
                        </div>
                    }

                    {
                        stage <= 1 && 
                        <p class="card-title h6 small"><span class={stage == 1 ? "badge bg-dark" : "badge bg-secondary"} style= {{borderRadius: "30% 10%;"}} >2</span> VEHICLE</p>
                    }

                    <div class="row">
                        <div class="col-12"><span>&nbsp;</span></div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <small>
                                <strong>{selectedCar?.name}</strong>
                            </small>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            {stage > 1 &&
                                <small>Total price: {currencySymbol}{selectedCar?.totalPrice} </small>
                            }
                            {stage <= 1 &&
                                <small>You have not selected a vehicle yet</small>
                            }
                        </div>
                    </div>
                </div>
                </div>
            </div>
            <div class="col-sm-3">
                <div class="card shadow">
                <div class="card-body">
                    {stage > 2 &&
                        <div class="d-flex" style={{alignItems: "baseline", justifyContent: "space-between"}}>
                            <span class="badge bg-secondary" style= {{borderRadius: "30% 10%;"}}>3</span><h5 class="card-title h6 small"> PROTECTION, EXTRAS </h5>
                            <i type="button" class="bi bi-pencil-square" style={{...iconColorStyle}} onClick={(e) => navigate("/car-details")}></i>
                        </div>
                    }

                    {
                        stage <= 2 && 
                        <p class="card-title h6 small"><span class={stage == 2 ? "badge bg-dark" : "badge bg-secondary"} style= {{borderRadius: "30% 10%;"}} >3</span> PROTECTION, EXTRAS</p>
                    }
                    {/* <h5 class="card-title h6 small"><span class="badge bg-secondary" style= {{borderRadius: "30% 10%;"}}>3</span> PROTECTION, EXTRAS</h5> */}
                    <div class="row">
                        <div class="col-12"><span>&nbsp;</span></div>
                    </div>

                    {
                        stage < 2 &&
                        <>
                            <div class="row">
                                <div class="col-12"><small>No protection or extras selected</small></div>
                            </div>
                        </>
                    }
                    {
                        stage >=2 &&
                        <>
                            <div class="row">
                                <div class="col-12">
                                    <small>
                                        <strong>{extrasDescription}</strong>
                                    </small>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12"><small>Total price: {currencySymbol}{totalExtrasPrice}</small></div>
                            </div>
                        </>
                    }

                </div>
                </div>
            </div>
            <div class="col-sm-3">
                <div class="card shadow">
                    <div class="card-body">
                            <h5 class="card-title h6 small"><span class={stage >= 3 ? "badge bg-dark" : "badge bg-secondary"} style= {{borderRadius: "30% 10%;"}}>4</span> REVIEW</h5>
                            <div class="row">
                            <div class="col-12"><span>&nbsp;</span></div>
                        </div>
                        <div class="row">
                            <div class="col-12"><small>{ stage === 3 ? "Total price: " + currencySymbol + totalPrice : "Nothing to review yet" }</small></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default BookingProgress;