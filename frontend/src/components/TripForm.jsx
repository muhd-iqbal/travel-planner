import React from 'react';
import { X } from 'lucide-react';

export const TripForm = ({ tripForm, setTripForm, createTrip, setShowTripForm, darkMode }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-0 z-50">
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-xl w-full max-h-[90vh] overflow-y-auto`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Trip</h3>
          <button
            onClick={() => setShowTripForm(false)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Trip Name"
            value={tripForm.name}
            onChange={(e) => setTripForm({...tripForm, name: e.target.value})}
            className={`w-full p-3 rounded-lg border text-base ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <input
            type="text"
            placeholder="Destination"
            value={tripForm.destination}
            onChange={(e) => setTripForm({...tripForm, destination: e.target.value})}
            className={`w-full p-3 rounded-lg border text-base ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              placeholder="Start Date"
              value={tripForm.startDate}
              onChange={(e) => setTripForm({...tripForm, startDate: e.target.value})}
              className={`w-full p-3 rounded-lg border text-base ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            <input
              type="date"
              placeholder="End Date"
              value={tripForm.endDate}
              onChange={(e) => setTripForm({...tripForm, endDate: e.target.value})}
              className={`w-full p-3 rounded-lg border text-base ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <input
            type="number"
            placeholder="Budget ($)"
            value={tripForm.budget}
            onChange={(e) => setTripForm({...tripForm, budget: e.target.value})}
            className={`w-full p-3 rounded-lg border text-base ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <button
            onClick={createTrip}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
          >
            Create Trip
          </button>
        </div>
      </div>
    </div>
  </div>
);