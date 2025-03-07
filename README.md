# Aqualite Engine Frontend

## 🌊 About The Project

This is the frontend interface for Aqualite Engine, a comprehensive water quality monitoring and forecasting platform. Built with React, this web application provides an intuitive interface to interact with the Aqualite Engine API.

The frontend provides interfaces for all three main modules of the Aqualite Engine platform:

1. **Forecasting**: Temperature prediction using hybrid physics-based/statistical models 
2. **Monitoring**: Water quality monitoring via Google Earth Engine satellite data 
3. **Machine Learning**: Data-driven water temperature prediction using state-of-the-art ML algorithms 

## 🚀 Key Features

- **Modern UI**: Clean, responsive interface built with React
- **Module-specific Interfaces**: Dedicated interfaces for forecasting, monitoring, and machine learning
- **Group Management**: Create and manage groups for collaborative research
- **Event Management**: Create and track simulation events within groups
- **Results Visualization**: Interactive visualization of model outputs
- **User Authentication**: Secure login and registration system
- **Comment System**: Discussion functionality within project groups

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- Aqualite Engine Backend API (Django) running locally or accessible via network

## 🔧 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/riddickkakati/aqualite-engine-frontend.git
   cd aqualite-engine-frontend
   ```

2. **Install dependencies**:
   ```bash
   # Using npm
   npm install

   # Or using yarn
   yarn install
   ```

3. **Configure environment**:
   Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```
   Adjust the URL as needed to point to your running Aqualite Engine backend.

4. **Start the development server**:
   ```bash
   # Using npm
   npm start

   # Or using yarn
   yarn start
   ```

5. **Access the application**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

```
aqualite-engine-frontend/
├── public/                  # Public assets
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── src/                     # Source code
│   ├── assets/              # Static assets
│   │   └── logo_frame.png
│   ├── components/          # React components
│   │   ├── forecasting-comments/     # Forecasting comments components
│   │   │   ├── comment.js
│   │   │   └── comments.js
│   │   ├── forecasting-events/       # Forecasting events components
│   │   │   ├── event-form.js
│   │   │   └── event-list.js
│   │   ├── forecasting-group/        # Forecasting group components
│   │   │   ├── group-details.js
│   │   │   ├── group-form.js
│   │   │   └── group-list.js
│   │   ├── layout/                   # Layout components
│   │   │   ├── elements.js
│   │   │   ├── header.js
│   │   │   ├── main.js
│   │   │   └── sidebar.js
│   │   ├── machinelearning-comments/ # ML comments components
│   │   │   ├── comment.js
│   │   │   └── comments.js
│   │   ├── machinelearning-events/   # ML events components
│   │   │   ├── event-form.js
│   │   │   └── event-list.js
│   │   ├── machinelearning-group/    # ML group components
│   │   │   ├── group-details.js
│   │   │   ├── group-form.js
│   │   │   └── group-list.js
│   │   ├── monitoring-comments/      # Monitoring comments components
│   │   │   ├── comment.js
│   │   │   └── comments.js
│   │   ├── monitoring-events/        # Monitoring events components
│   │   │   ├── event-form.js
│   │   │   └── event-list.js
│   │   ├── monitoring-group/         # Monitoring group components
│   │   │   ├── group-details.js
│   │   │   ├── group-form.js
│   │   │   └── group-list.js
│   │   └── user/                     # User components
│   │       ├── account.js
│   │       ├── register.js
│   │       └── user.js
│   ├── hooks/                # Custom React hooks
│   │   ├── fetch-event.js
│   │   ├── fetch-group.js
│   │   └── useAuth.js
│   ├── services/             # API service functions
│   │   ├── event-services.js
│   │   ├── group-services.js
│   │   └── user-services.js
│   ├── utils/                # Utility functions
│   │   └── config.js
│   ├── App.css               # Application styles
│   ├── App.js                # Main App component
│   ├── index.css             # Global styles
│   ├── index.js              # Application entry point
│   ├── theme.js              # Theme configuration
│   └── utils.js              # Utility functions
├── package.json              # Project dependencies and scripts
└── README.md                 # Project documentation
```

## 🌟 Module Interfaces Overview

### Forecasting Interface

The forecasting interface allows users to:

- Create and manage forecasting groups for collaborative research
- Upload time series data for temperature prediction
- Configure model parameters (air2water/air2stream, optimization methods, validation settings)
- Run simulations and visualize results
- Discuss results with group members via comments

### Monitoring Interface

The monitoring interface enables users to:

- Create monitoring groups for water quality assessment
- Configure monitoring parameters (date range, location, satellite source)
- Select water quality parameters (Chlorophyll-a, Turbidity, Dissolved Oxygen)
- View and download interactive satellite-derived water quality maps
- Share and discuss findings with group members

### Machine Learning Interface

The machine learning interface provides tools to:

- Create machine learning research groups
- Upload training data for water temperature prediction
- Configure ML model parameters and validation options
- Run analysis across multiple ML algorithms
- Compare model performance and select the best-performing model
- Collaborate with team members through group discussions

## 🚀 Getting Started

Once you have the application running, follow these steps to start using the Aqualite Engine Frontend:

### 1. User Registration and Login

1. Navigate to the Register page to create a new account
2. Login with your credentials
3. Update your profile information if needed

### 2. Using the Forecasting Module

1. Create a new forecasting group or join an existing one
2. Within your group, create a new forecasting event/simulation
3. Upload your time series data and configure model parameters
4. Run the simulation and wait for the backend to process it
5. View and analyze the results
6. Discuss findings with group members using the comment system

### 3. Using the Monitoring Module

1. Create a monitoring group or join an existing one
2. Set up a new monitoring event with your parameters of interest
3. Configure the Google Earth Engine settings
4. Run the monitoring analysis
5. View the generated interactive maps
6. Share insights with team members

### 4. Using the Machine Learning Module

1. Create a machine learning group or join an existing one
2. Set up a new ML analysis event
3. Upload training data and configure ML parameters
4. Run the analysis to evaluate multiple algorithms
5. Review the performance metrics and select the best model
6. Discuss results with collaborators

## 📖 Development Notes

### Adding New Features

1. Create components in the appropriate directory
2. Add any required API services in the `services` directory
3. Update routing in `App.js` if necessary
4. Add styling as needed

### Code Style

This project follows React best practices and conventional component structure:

- Functional components with hooks
- Service-based API communication
- Component-based architecture
- Custom hooks for repeated logic

## 📖 Working demonstration

For a working demonstration of the interface, please refer to the [YouTube link](#).


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

Project Lead - [riddick.kakati93@gmail.com](mailto:riddick.kakati93@gmail.com)

## 🔄 Related Repositories

- [Aqualite Engine Backend](https://github.com/riddickkakati/air2water3.0) - Django backend for the Aqualite Engine platform
