# Travel Planner

A travel planning application.

## Setup

1. Setup backend
   Create a `.env` file in the backend directory:
    ```
   MONGODB_URI=
   PORT=5001
   NODE_ENV=development
    ```
2. Install dependencies:
   ```bash
   npm install
   npm run start
   ```
3. Setup frontend
   Create a `.env` file in the frontend directory:
   ```
   VITE_API_URL=http://localhost:5001/api
   VITE_GOOGLE_PLACES_API_KEY=
   ```
4. Install dependencies:
   ```bash
   npm install
   npm run build
   ```

## Features

- Plan trips based on user input.
- Save and manage planned trips.

## Technologies

- React
- Node.js
- Google Places API

## Contributing

No contributions are accepted! This is personal project for personal usage.

## License

This project is licensed under the MIT License.
