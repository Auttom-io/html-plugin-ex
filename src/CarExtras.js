import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrencySymbol } from './Helper';

const CarExtras = ({ 
    availableInsurance, 
    availableExtras, 
    selectedInsurance, 
    selectedExtras, 
    onSelectInsurance, 
    onSelectExtra,
    config 
}) => {
    const [activeTab, setActiveTab] = useState('insurance');
    const currencySymbol = getCurrencySymbol(config?.currency);
    const iconColorStyle = config?.iconColor ? { color: config.iconColor } : {};

    const InsuranceItem = ({ item, index, isSelected, onSelect }) => {
        const getStarRating = (index) => {
            const colors = ['#6c757d', '#0dcaf0', '#ffc107'];
            const counts = [1, 2, 3];
            return Array(counts[index] || 1).fill().map((_, i) => (
                <i key={i} className="bi bi-star-fill me-1" style={{ color: colors[index] || '#6c757d', fontSize: '0.8rem' }}></i>
            ));
        };

        return (
            <div 
                className={`insurance-item ${isSelected ? 'selected' : ''} ${item.isIncluded ? 'included' : ''}`}
                onClick={() => !item.isIncluded && onSelect(item)}
                style={{ cursor: item.isIncluded ? 'default' : 'pointer' }}
            >
                <div className="insurance-header">
                    <div className="insurance-title">
                        <h6 className="mb-1">{item.name}</h6>
                        <div className="stars">
                            {getStarRating(index)}
                        </div>
                    </div>
                    <div className="insurance-price">
                        <div className="daily-price">{currencySymbol}{item.dailyPrice}<span className="period">/day</span></div>
                        <div className="total-price">Total: {currencySymbol}{item.totalPrice}</div>
                    </div>
                </div>
                
                <div className="insurance-excess">
                    <small className="text-muted">Excess: {currencySymbol}{item.premium}</small>
                </div>

                <div className="protection-list">
                    {item.protection?.map((coverage, idx) => (
                        <div key={idx} className={`protection-item ${coverage.isCovered ? 'covered' : 'not-covered'}`}>
                            <i className={`bi ${coverage.isCovered ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                            <span>{coverage.type}</span>
                        </div>
                    ))}
                </div>

                <div className="selection-status">
                    {item.isIncluded ? (
                        <span className="status-badge included">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            {'Included'}
                        </span>
                    ) : isSelected ? (
                        <span className="status-badge selected">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            {'Selected'}
                        </span>
                    ) : (
                        <span className="status-badge selectable">
                            <i className="bi bi-plus-circle me-1"></i>
                            {'Select'}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const ExtraItem = ({ extra, isSelected, onSelect }) => {
        const [quantity, setQuantity] = useState(isSelected ? 1 : 0);

        const handleQuantityChange = (newQuantity) => {
            setQuantity(newQuantity);
            if (newQuantity > 0) {
                onSelect({ ...extra, quantity: newQuantity });
            } else {
                onSelect(extra); // This will remove it
            }
        };

        return (
            <div className={`extra-item ${isSelected ? 'selected' : ''} ${extra.isIncluded ? 'included' : ''}`}>
                <div className="extra-header">
                    <div className="extra-icon">
                        <i className="bi bi-bag-plus-fill" style={iconColorStyle}></i>
                    </div>
                    <div className="extra-info">
                        <h6 className="mb-1">{extra.name}</h6>
                        <p className="extra-description">{extra.description}</p>
                    </div>
                    <div className="extra-price">
                        {extra.dailyPrice > 0 && (
                            <div className="daily-price">{currencySymbol}{extra.dailyPrice}<span className="period">/day</span></div>
                        )}
                        <div className="total-price">Total: {currencySymbol}{extra.totalPrice}</div>
                    </div>
                </div>

                <div className="extra-actions">
                    {extra.isIncluded ? (
                        <span className="status-badge included">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            {'Included'}
                        </span>
                    ) : extra.maxItems === 1 ? (
                        <button 
                            className={`btn btn-sm ${isSelected ? 'btn-success' : 'btn-outline-primary'}`}
                            onClick={() => onSelect(extra)}
                        >
                            {isSelected ? (
                                <>
                                    <i className="bi bi-check-circle-fill me-1"></i>
                                    {'Selected'}
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-plus-circle me-1"></i>
                                    {'Add'}
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="quantity-control">
                            <label className="form-label small">{'Quantity'}</label>
                            <div className="input-group input-group-sm">
                                <button 
                                    className="btn btn-outline-secondary" 
                                    type="button"
                                    onClick={() => handleQuantityChange(Math.max(0, quantity - 1))}
                                    disabled={quantity <= 0}
                                >
                                    <i className="bi bi-dash"></i>
                                </button>
                                <input 
                                    type="number" 
                                    className="form-control text-center" 
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(Math.max(0, Math.min(extra.maxItems, parseInt(e.target.value) || 0)))}
                                    min="0" 
                                    max={extra.maxItems}
                                />
                                <button 
                                    className="btn btn-outline-secondary" 
                                    type="button"
                                    onClick={() => handleQuantityChange(Math.min(extra.maxItems, quantity + 1))}
                                    disabled={quantity >= extra.maxItems}
                                >
                                    <i className="bi bi-plus"></i>
                                </button>
                            </div>
                            <small className="text-muted">Max: {extra.maxItems}</small>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="car-extras">
            {/* Tab Navigation */}
            <div className="section-tabs">
                <button 
                    className={`tab-button ${activeTab === 'insurance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('insurance')}
                >
                    <i className="bi bi-shield-check me-2"></i>
                    {'Protection Plans'}
                    {availableInsurance.length > 0 && <span className="ms-2 badge bg-secondary">{availableInsurance.length}</span>}
                </button>
                <button 
                    className={`tab-button ${activeTab === 'extras' ? 'active' : ''}`}
                    onClick={() => setActiveTab('extras')}
                >
                    <i className="bi bi-bag-plus me-2"></i>
                    {'Add-ons & Extras'}
                    {availableExtras.length > 0 && <span className="ms-2 badge bg-secondary">{availableExtras.length}</span>}
                </button>
            </div>

            {/* Insurance Section */}
            {activeTab === 'insurance' && (
                <div className="insurance-section">
                    <div className="insurance-grid">
                        {availableInsurance.map((item, index) => (
                            <InsuranceItem
                                key={item.id}
                                item={item}
                                index={index}
                                isSelected={selectedInsurance?.id === item.id}
                                onSelect={onSelectInsurance}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Extras Section */}
            {activeTab === 'extras' && (
                <div className="extras-section">
                    <div className="extras-grid">
                        {availableExtras.map((extra) => (
                            <ExtraItem
                                key={extra.id}
                                extra={extra}
                                isSelected={selectedExtras.some(e => e.id === extra.id)}
                                onSelect={onSelectExtra}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {((activeTab === 'insurance' && availableInsurance.length === 0) || 
              (activeTab === 'extras' && availableExtras.length === 0)) && (
                <div className="text-center py-5">
                    <i className={`bi ${activeTab === 'insurance' ? 'bi-shield-x' : 'bi-bag-x'} text-muted`} style={{ fontSize: '3rem' }}></i>
                    <h5 className="text-muted mt-3">
                        {activeTab === 'insurance' 
                            ? 'No protection plans available'
                            : 'No extras available'
                        }
                    </h5>
                    <p className="text-muted">
                        {activeTab === 'insurance' 
                            ? 'All protection is included with your rental'
                            : 'All extras are included with your rental'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default CarExtras;
