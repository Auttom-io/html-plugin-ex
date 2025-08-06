import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useEffect } from 'react'
import { RouterProvider} from 'react-router-dom'
import { router } from './routes';
import { useDataContext } from './Context';
import axios from 'axios';
const AppRouter = (props) => {

    const {
        config,
        setConfig,
        locations,
        setLocations,
        searchData,
        setSearchData
    } = useDataContext();

    useEffect(() => {
        console.log("AppRouter: config", config);

        axios.get(config.buildUri('/location/public')).then((response) => {
            const locations = response.data;
            const _locations = locations.map(location => ({
                id: location.id,
                address: location.address,
                city: location.city,
                state: location.state,
                fullAddress: `${location.address}, ${location.city}, ${location.state}`,
            }));
            
            setLocations(_locations);
        });
    }, [config]);

    return (
        <RouterProvider router={router} />
    );
};

export default AppRouter;