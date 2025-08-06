import { createHashRouter } from 'react-router-dom';
import Search from './Search';
import CarListNew from './CarListNew';
import CarDetails from './CarDetails';
import CustomerInfo from './CustomerInfo';

export const router = createHashRouter([
    { path: '/cars', element: <CarListNew /> },
    { path: '/car-details', element: <CarDetails /> },
    { path: '/checkout', element: <CustomerInfo /> },
    { path: '/', element: <Search /> },
]);