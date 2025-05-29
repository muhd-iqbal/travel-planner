// components/DashboardPage.jsx
import React from 'react';
import { Plane, DollarSign, BarChart3, MapPin } from 'lucide-react';

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

export const DashboardPage = ({ trips, setActiveTrip, setCurrentPage, setShowTripForm, darkMode }) => (
  <div className="space-y-4">
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold mb-2">Travel Planner</h1>
      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Plan your perfect trip
      </p>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-3 shadow text-center`}>
        <Plane className="w-6 h-6 text-blue-500 mx-auto mb-1" />
        <p className="text-lg font-bold text-blue-500">{trips.length}</p>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Trips</p>
      </div>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-3 shadow text-center`}>
        <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-1" />
        <p className="text-lg font-bold text-green-500">
          ${trips.reduce((sum, trip) => sum + trip.budget, 0).toFixed(0)}
        </p>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Budget</p>
      </div>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-3 shadow text-center`}>
        <BarChart3 className="w-6 h-6 text-purple-500 mx-auto mb-1" />
        <p className="text-lg font-bold text-purple-500">
          ${trips.reduce((sum, trip) => sum + trip.totalSpent, 0).toFixed(0)}
        </p>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Spent</p>
      </div>
    </div>

    {/* Recent Trips */}
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Trips</h2>
        <button
          onClick={() => setCurrentPage('trips')}
          className="text-blue-500 text-sm font-medium"
        >
          View All
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-8">
          <Plane className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            No trips yet
          </p>
          <button
            onClick={() => setShowTripForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Create First Trip
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.slice(0, 3).map(trip => (
            <div
              key={trip.id}
              onClick={() => {
                setActiveTrip(trip);
                setCurrentPage('itinerary');
              }}
              className={`p-3 rounded-lg ${
                darkMode ? 'bg-gray-700 active:bg-gray-600' : 'bg-gray-100 active:bg-gray-200'
              } transition-colors touch-manipulation`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm">{trip.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  trip.totalSpent > trip.budget 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                }`}>
                  ${trip.totalSpent}/${trip.budget}
                </span>
              </div>
              <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                <MapPin className="w-3 h-3 inline mr-1" />
                {trip.destination}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatDate(trip.startDate)} • {trip.itineraries.length} items
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);