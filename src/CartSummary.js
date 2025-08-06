import { useDataContext } from './Context';
import { getCurrencySymbol } from './Helper';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CartSummary = ({ showPromoCode = false, showCheckoutButton = false }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const {
        config,
        selectedCar,
        selectedInsurance,
        selectedExtras,
    } = useDataContext();

    const currencySymbol = getCurrencySymbol(config?.currency);
    
    const totalItems = selectedExtras.length + (selectedCar ? 1 : 0) + (selectedInsurance ? 1 : 0);
    const totalPrice = (selectedCar ? selectedCar.totalPrice : 0) 
                     + (selectedInsurance ? selectedInsurance.totalPrice : 0) 
                     + selectedExtras.reduce((total, extra) => total + extra.totalPrice, 0);

    return (
        <div className="col-12 col-lg-4 order-md-last mt-4 mt-lg-0">
            <div className="sticky-lg-top" style={{ top: '1rem' }}>
                <div className="cart-summary">
                    {/* Header */}
                    <div className="summary-header">
                        <h5 className="summary-title">
                            <span>{'Booking Summary'}</span>
                            <span className="items-badge">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                        </h5>
                    </div>

                    {/* Content */}
                    {totalItems > 0 ? (
                        <div className="summary-content">
                            {/* Car */}
                            {selectedCar && (
                                <div className="summary-item">
                                    <div className="item-info">
                                        <h6 className="item-name">{selectedCar.name}</h6>
                                        <p className="item-details">{currencySymbol}{selectedCar.dailyPrice} / {'day'}</p>
                                    </div>
                                    <div className="item-price">{currencySymbol}{selectedCar.totalPrice}</div>
                                </div>
                            )}

                            {/* Insurance */}
                            {selectedInsurance && (
                                <div className="summary-item">
                                    <div className="item-info">
                                        <h6 className="item-name">
                                            <i className="bi bi-shield-check me-2" style={{ color: '#6c757d' }}></i>
                                            {selectedInsurance.name}
                                        </h6>
                                        <p className="item-details">{currencySymbol}{selectedInsurance.dailyPrice} / {'day'}</p>
                                    </div>
                                    <div className="item-price">{currencySymbol}{selectedInsurance.totalPrice}</div>
                                </div>
                            )}

                            {/* Extras */}
                            {selectedExtras.map((extra) => (
                                <div key={extra.id} className="summary-item">
                                    <div className="item-info">
                                        <h6 className="item-name">
                                            <i className="bi bi-bag-plus me-2" style={{ color: '#6c757d' }}></i>
                                            {extra.name}
                                        </h6>
                                        <p className="item-details">{currencySymbol}{extra.dailyPrice} / {'day'}</p>
                                    </div>
                                    <div className="item-price">{currencySymbol}{extra.totalPrice}</div>
                                </div>
                            ))}

                            {/* Total */}
                            <div className="total-section">
                                <div className="total-row">
                                    <span className="total-label">{'Total Amount'}</span>
                                    <span className="total-amount">{currencySymbol}{totalPrice}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <i className="bi bi-cart3"></i>
                            </div>
                            <h6 className="empty-title">{'No items selected'}</h6>
                            <p className="empty-text">{'Start by selecting a vehicle and add protection or extras as needed.'}</p>
                        </div>
                    )}

                    {/* Promo Code */}
                    {showPromoCode && totalItems > 0 && (
                        <div className="promo-section">
                            <div className="promo-input-group">
                                <input 
                                    type="text" 
                                    className="promo-input" 
                                    placeholder={'Enter promo code'} 
                                />
                                <button type="button" className="promo-button">
                                    {'Apply'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Checkout Button */}
                    {showCheckoutButton && totalItems > 0 && (
                        <div className="checkout-section">
                            <button 
                                type="button" 
                                className="checkout-button" 
                                onClick={() => navigate('/checkout')}
                            >
                                <i className="bi bi-credit-card"></i>
                                {'Proceed to Checkout'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartSummary;
