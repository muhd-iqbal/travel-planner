// components/ItineraryPage.jsx - Updated to display date only
import React from 'react';
import { List, ChevronLeft, Plus, MapPin, Calendar, DollarSign, Edit2, Trash2 } from 'lucide-react';

const getCategoryColor = (category) => {
  const colors = {
    activity: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    food: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    transport: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    accommodation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    shopping: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };
  return colors[category] || colors.other;
};

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

export const ItineraryPage = ({ activeTrip, setCurrentPage, setShowItineraryForm, startEditItinerary, deleteItinerary, darkMode }) => {
  if (!activeTrip) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow text-center`}>
        <List className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <h2 className="text-lg font-semibold mb-2">No Trip Selected</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 text-sm`}>
          Select a trip to view its itinerary.
        </p>
        <button
          onClick={() => setCurrentPage('trips')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Go to Trips
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Trip Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCurrentPage('trips')}
            className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={() => setShowItineraryForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <h1 className="text-lg font-bold mb-2">{activeTrip.name}</h1>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>{activeTrip.destination}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-500" />
            <span>{formatDate(activeTrip.startDate)} {activeTrip.endDate && `- ${formatDate(activeTrip.endDate)}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-yellow-500" />
            <span>${activeTrip.totalSpent} / ${activeTrip.budget}</span>
          </div>
        </div>
      </div>

      {/* Itinerary Items */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
        <h2 className="text-lg font-semibold mb-4">Itinerary</h2>

        {activeTrip.itineraries.length === 0 ? (
          <div className="text-center py-8">
            <List className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No items yet
            </p>
            <button
              onClick={() => setShowItineraryForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTrip.itineraries
              .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by date only
              .map(item => (
              <div key={item.id} className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {item.location}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {formatDate(item.date)}
                    </p>
                    {item.description && (
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="font-medium text-green-600 dark:text-green-400 text-sm">
                      ${item.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => startEditItinerary(item)}
                      className={`p-1 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteItinerary(item.id)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};