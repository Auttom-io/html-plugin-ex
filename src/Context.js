import { createContext, useContext, useState } from 'react';

const DataContext = createContext({
    config: {
        apiBaseUrl: 'http://localhost:3001',
        apiKey: '041b6dc7-5903-4be9-b34c-abe10187e51e',
        currency: 'EUR',
        buildUri: (path) => {
            return `${this.apiBaseUrl}${path}?api_key=${this.apiKey}`;
        }
    },
    setConfig: () => {},

    locations: [
        {
            // default
            id: 0,
            address: 'Tirana International Airport',
            city: 'Rinas, Tirana',
            state: 'Tirana'
        }
    ],
    setLocations: () => [],

    searchData: {
        pickUpId: 0,
        dropOffId: 0,
        sameDropOffLocation: false,
        bookingStart: '', // yyyy-mm-ddTHH:mm
        bookingEnd: '',  // yyyy-mm-ddTHH:mm
        ageGroup: 0, //18, 19, 20, 21, 22, 23, 24(24+)
    },
    setSearchData: () => {},

    selectedCar: {
        "name": "Blue Bmw Sedan",
        "category": "Sedan",
        "dailyPrice": 125.00,
        "totalPrice": 500.00,
        "totalKm": 1000,
        "fuelType": "Diesel",
        "isAutomatic": true,
        "hasAC": true,
        "passangerCapacity": 5,
        "luggageCapacity": 2,
        "images": [],
        "imageUrl": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },

    setSelectedCar: () => {},

    selectedInsurance: {
        "id": 2,
        "name": "Medium",
        "isIncluded": false,
        "dailyPrice": 24,
        "totalPrice": 400,
        "premium": 150,
        "protection": [
            {
                "type": "Collision Damage Protection",
                "isCovered": true
            },
            {
                "type": "Theft Protection",
                "isCovered": true
            },
            {
                "type": "Windscreen, Glass, Lights & Tires",
                "isCovered": true
            },
            {
                "type": "Personal Accident Protection",
                "isCovered": true
            },
            {
                "type": " Personal belongings protection",
                "isCovered": false
            }
        ]
    },
    setSelectedInsurance: () => {},

    selectedExtras: [
        {
            id: 1,
            name: 'GPS Navigation System',
            description: 'A GPS navigation system to help you find your way around easily.',
            dailyPrice: 10.00,
            totalPrice: 40.00,
            fixedPrice: false,
            quantity: 1,
        }
    ],

    setSelectedExtras: () => [],

    stage: 1, // 1: search, 2: details, 3: booking, 4: confirmation, 5: completed
    setStage: () => {}
});

const DataContextProvider = ({children}) => {

    const [config, setConfig] = useState({
        apiBaseUrl: 'http://localhost:3001',
        apiKey: '041b6dc7-5903-4be9-b34c-abe10187e51e',
        currency: 'EUR',
        buildUri: (path) => {
            return `http://localhost:3001${path}?api_key=041b6dc7-5903-4be9-b34c-abe10187e51e`;
        }
    });
    const [locations, setLocations] = useState([]);
    const [searchData, setSearchData] = useState(null);
    const [selectedCar, setSelectedCar] = useState(null);
    const [stage, setStage] = useState(1); // 1: search, 2: details, 3: booking, 4: confirmation, 5: completed
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [selectedInsurance, setSelectedInsurance] = useState(null);
    const value = {
        config,
        setConfig,
        locations,
        setLocations,
        searchData,
        setSearchData,
        selectedCar,
        setSelectedCar,
        selectedInsurance,
        setSelectedInsurance,
        selectedExtras,
        setSelectedExtras,
        stage, 
        setStage
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    )
}

const useDataContext = () => useContext(DataContext);

export {
    DataContext,
    DataContextProvider,
    useDataContext
};

