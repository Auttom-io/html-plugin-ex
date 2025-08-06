import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import React from 'react'
import AppRouter from './AppRouter';
import { DataContextProvider } from './Context';

const App = (props) => {
    return (
        <React.StrictMode>
            <DataContextProvider>
                <AppRouter />
            </DataContextProvider>
        </React.StrictMode>
    );
};

export default App;