const formatDateTime = (date) => {
    const dateRef = new Date(date);

    const year = dateRef.getFullYear();
    const month = (dateRef.getMonth() + 1).toString().padStart(2, '0');
    const days = dateRef.getDate().toString().padStart(2, '0');
    const hours = dateRef.getHours().toString().padStart(2, '0');
    const minutes = dateRef.getMinutes().toString().padStart(2, '0');

    const result = `${year}-${month}-${days}T${hours}:${minutes}`;
    return result;
};

const addDays = (date, daysToAdd) => {

    let dateRef = new Date(date);

    const result = new Date(dateRef.setDate(dateRef.getDate() + daysToAdd));
    return result;
}

const addHours = (date) => {

    let dateRef = new Date(date);
    
    const result = new Date(dateRef.setHours(dateRef.getHours() + 1));
    return result;
}

const getCurrencySymbol = (currency) => {
    switch (currency) {
        case 'EUR':
            return '€';
        case 'USD':
            return '$';
        case 'ALL':
            return 'L';
        default:
            // default to Euro
            return '€';
    }
}

const getFuelTypeIcon = (fuelType) => {
    switch (fuelType) {
        case 'Petrol':
            return 'bi bi-fuel-pump-diesel';
        case 'Diesel':
            return 'bi bi-fuel-pump-diesel';
        case 'Electric':
            return 'bi bi-ev-station';
        default:
            return 'bi bi-fuel-pump';
    }
}

const dayDiff = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export {
    formatDateTime,
    addDays,
    addHours,
    getCurrencySymbol,
    getFuelTypeIcon,
    dayDiff
}