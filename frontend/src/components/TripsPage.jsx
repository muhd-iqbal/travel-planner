// components/TripsPage.jsx
import React from 'react';
import { Plus, Plane, MapPin, Calendar } from 'lucide-react';

// Helper function to format date for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

export const TripsPage = ({ trips, setActiveTrip, setCurrentPage, setShowTripForm, darkMode }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h1 className="text-xl font-bold">My Trips</h1>
      <button
        onClick={() => setShowTripForm(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>

    {trips.length === 0 ? (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow text-center`}>
        <Plane className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <h2 className="text-lg font-semibold mb-2">No trips yet</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 text-sm`}>
          Create your first trip to start planning.
        </p>
        <button
          onClick={() => setShowTripForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Create Trip
        </button>
      </div>
    ) : (
      <div className="space-y-3">
        {trips.map(trip => (
          <div key={trip.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{trip.name}</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-1`}>
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {trip.destination}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {/* {trip.startDate} {trip.endDate && `- ${trip.endDate}`} */}
                  {formatDate(trip.startDate)} {trip.endDate ? `- ${formatDate(trip.endDate)}` : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTrip(trip);
                  setCurrentPage('itinerary');
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
              >
                View
              </button>
            </div>

            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Budget</span>
                <span className={`text-xs ${trip.totalSpent > trip.budget ? 'text-red-500' : 'text-green-500'}`}>
                  ${trip.totalSpent} / ${trip.budget}
                </span>
              </div>
              <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    trip.totalSpent > trip.budget ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((trip.totalSpent / trip.budget) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {trip.itineraries.length} items
              </span>
              <span className={`${
                trip.budget > 0 ? 
                  (trip.totalSpent > trip.budget ? 'text-red-500' : 'text-green-500') : 
                  'text-gray-500'
              }`}>
                {trip.budget > 0 ? `${((trip.totalSpent / trip.budget) * 100).toFixed(0)}%` : 'No budget'}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);