import React from 'react';
import { BarChart3, ChevronLeft, MapPin, Calendar } from 'lucide-react';

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

export const BudgetPage = ({ activeTrip, setCurrentPage, darkMode }) => {
  if (!activeTrip) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow text-center`}>
        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <h2 className="text-lg font-semibold mb-2">No Trip Selected</h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 text-sm`}>
          Select a trip to view budget details.
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

  const categoryTotals = activeTrip.itineraries.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.price;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Budget Overview */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold">Budget</h1>
          <button
            onClick={() => setCurrentPage('trips')}
            className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="text-center mb-4">
          <h2 className="font-semibold mb-1">{activeTrip.name}</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{activeTrip.destination}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Budget</p>
            <p className="text-lg font-bold text-blue-500">${activeTrip.budget.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Spent</p>
            <p className="text-lg font-bold text-purple-500">${activeTrip.totalSpent.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remaining</p>
            <p className={`text-lg font-bold ${activeTrip.budget - activeTrip.totalSpent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${(activeTrip.budget - activeTrip.totalSpent).toFixed(0)}
            </p>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progress</span>
            <span className={`text-sm ${activeTrip.totalSpent > activeTrip.budget ? 'text-red-500' : 'text-green-500'}`}>
              {activeTrip.budget > 0 ? ((activeTrip.totalSpent / activeTrip.budget) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3`}>
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                activeTrip.totalSpent > activeTrip.budget ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((activeTrip.totalSpent / activeTrip.budget) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
        <h2 className="text-lg font-semibold mb-4">By Category</h2>

        {Object.keys(categoryTotals).length === 0 ? (
          <p className={`text-center py-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No expenses yet
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(categoryTotals)
              .sort(([,a], [,b]) => b - a)
              .map(([category, total]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(category)}`}>
                    {category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">${total.toFixed(2)}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {activeTrip.budget > 0 ? ((total / activeTrip.budget) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Expenses */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
        <h2 className="text-lg font-semibold mb-4">Recent Expenses</h2>
        
        {activeTrip.itineraries.length === 0 ? (
          <p className={`text-center py-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No expenses yet
          </p>
        ) : (
          <div className="space-y-3">
            {activeTrip.itineraries
              .sort((a, b) => new Date(b.date + ' ' + (b.time || '00:00')) - new Date(a.date + ' ' + (a.time || '00:00')))
              .slice(0, 5)
              .map(item => (
              <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 flex-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      {item.location} • {item.date}
                    </p>
                  </div>
                </div>
                <p className="font-medium text-sm ml-2">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};