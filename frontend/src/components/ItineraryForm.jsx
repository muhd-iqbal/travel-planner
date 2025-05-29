// components/ItineraryForm.jsx - Updated without time field
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, MapPin, Calendar, AlertCircle } from 'lucide-react';
import GooglePlacesService from '../services/googlePlaces.js';

export const ItineraryForm = ({ 
  itineraryForm, 
  setItineraryForm, 
  addItinerary, 
  updateItinerary, 
  editingItinerary, 
  setEditingItinerary, 
  setShowItineraryForm, 
  darkMode 
}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [apiStatus, setApiStatus] = useState({ isAvailable: false, hasApiKey: false });
  const [searchError, setSearchError] = useState(null);
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Check Google Places API status on mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const initialized = await GooglePlacesService.initialize();
        const status = GooglePlacesService.getStatus();
        setApiStatus(status);
        
        if (!status.hasApiKey) {
          console.info('Google Places API key not found - using mock data');
        } else if (!initialized) {
          console.warn('Google Places API failed to initialize - using mock data');
        }
      } catch (error) {
        console.error('Error checking API status:', error);
        setApiStatus({ isAvailable: false, hasApiKey: false });
      }
    };

    checkApiStatus();
  }, []);

  // Handle location search with improved error handling
  const handleLocationSearch = async (query) => {
    setItineraryForm({...itineraryForm, location: query});
    setSearchError(null);

    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      
      try {
        let results = [];
        
        // Use category-specific search if API is available
        if (apiStatus.isAvailable) {
          // switch (itineraryForm.category) {
          //   case 'food':
          //     results = await GooglePlacesService.searchRestaurants(query);
          //     break;
          //   case 'accommodation':
          //     results = await GooglePlacesService.searchHotels(query);
          //     break;
          //   case 'activity':
          //     results = await GooglePlacesService.searchAttractions(query);
          //     break;
          //   default:
              results = await GooglePlacesService.searchPlaces(query);
          // }
        } else {
          // Use fallback search
          results = GooglePlacesService.getFallbackResults(query);
        }
        
        setSearchResults(results);
        setShowResults(results.length > 0);
        
        // Clear any previous errors if search was successful
        if (results.length > 0) {
          setSearchError(null);
        }
        
      } catch (error) {
        console.error('Search error:', error);
        setSearchError('Search failed. Please try again.');
        
        // Use fallback results on error
        const fallbackResults = GooglePlacesService.getFallbackResults(query);
        setSearchResults(fallbackResults);
        setShowResults(fallbackResults.length > 0);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // Handle place selection with error handling
  const handlePlaceSelect = async (place) => {
    try {
      setItineraryForm({...itineraryForm, location: place.name});
      setSelectedPlace(place);
      setSearchResults([]);
      setShowResults(false);
      setSearchError(null);

      // Only try to get details for real places (not mock data)
      if (place.id && !place.id.startsWith('mock-') && apiStatus.isAvailable) {
        try {
          const details = await GooglePlacesService.getPlaceDetails(place.id);
          if (details) {
            setSelectedPlace(details);
          }
        } catch (error) {
          console.warn('Error fetching place details:', error);
          // Don't show error to user, just use the basic place info
        }
      }
    } catch (error) {
      console.error('Error selecting place:', error);
      setSearchError('Error selecting place. Please try again.');
    }
  };

  // Clear search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    if (setShowItineraryForm) {
      setShowItineraryForm(false);
    }
    if (setEditingItinerary) {
      setEditingItinerary(null);
    }
    // Remove time from form reset
    setItineraryForm({ title: '', location: '', date: '', description: '', price: '', category: 'activity' });
    setSearchResults([]);
    setShowResults(false);
    setSelectedPlace(null);
    setSearchError(null);
  };

  const handleSubmit = () => {
    if (!itineraryForm.title.trim() || !itineraryForm.location.trim()) {
      setSearchError('Please fill in both title and location.');
      return;
    }

    setSearchError(null);
    
    try {
      if (editingItinerary && updateItinerary && typeof updateItinerary === 'function') {
        updateItinerary();
      } else if (addItinerary && typeof addItinerary === 'function') {
        addItinerary();
      } else {
        console.error('No valid submit function available');
        setSearchError('Unable to save item. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSearchError('Error saving item. Please try again.');
    }
  };

  // Get category-specific placeholder text
  const getLocationPlaceholder = () => {
    const placeholders = {
      food: 'Search restaurants, cafes, bars...',
      accommodation: 'Search hotels, hostels, B&Bs...',
      activity: 'Search attractions, museums, parks...',
      transport: 'Search airports, stations, terminals...',
      shopping: 'Search malls, markets, stores...',
      other: 'Search places...'
    };
    return placeholders[itineraryForm.category] || 'Search places...';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-0 z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingItinerary ? 'Edit Item' : 'Add Item'}
            </h3>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* API Status Info */}
          {!apiStatus.hasApiKey && (
            <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-800'} text-sm`}>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Using sample places. Add Google Places API key for real search results.</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {searchError && (
            <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-800'} text-sm`}>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{searchError}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Title Input */}
            <input
              type="text"
              placeholder="Title *"
              value={itineraryForm.title}
              onChange={(e) => setItineraryForm({...itineraryForm, title: e.target.value})}
              className={`w-full p-3 rounded-lg border text-base ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            
            {/* Location Search Input */}
            <div className="relative" ref={inputRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder={getLocationPlaceholder() + ' *'}
                  value={itineraryForm.location}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  className={`w-full p-3 pl-10 pr-10 rounded-lg border text-base ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className={`absolute top-full left-0 right-0 ${darkMode ? 'bg-gray-700' : 'bg-white'} border rounded-lg mt-1 shadow-lg z-10 max-h-60 overflow-y-auto`}>
                  {searchResults.map((place, index) => (
                    <button
                      key={place.id || index}
                      onClick={() => handlePlaceSelect(place)}
                      className={`w-full text-left p-3 hover:${darkMode ? 'bg-gray-600' : 'bg-gray-100'} transition-colors border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} last:border-b-0`}
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {place.mainText || place.name}
                          </p>
                          {place.secondaryText && (
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                              {place.secondaryText}
                            </p>
                          )}
                          {place.id && place.id.startsWith('mock-') && (
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} italic`}>
                              Sample place
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Place Details */}
            {selectedPlace && (selectedPlace.rating || selectedPlace.types) && (
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-blue-200'}`}>
                <div className="flex items-center gap-2 text-sm">
                  {selectedPlace.rating && (
                    <>
                      <span className="text-yellow-500">★</span>
                      <span>{selectedPlace.rating}</span>
                    </>
                  )}
                  {selectedPlace.types && selectedPlace.types.length > 0 && (
                    <>
                      {selectedPlace.rating && <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>•</span>}
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
                        {selectedPlace.types[0]?.replace(/_/g, ' ')}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Date Input Only (removed time input) */}
            <div className="relative">
              <input
                type="date"
                value={itineraryForm.date}
                onChange={(e) => setItineraryForm({...itineraryForm, date: e.target.value})}
                className={`w-full p-3 pl-10 rounded-lg border text-base ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Category Select */}
            <select
              value={itineraryForm.category}
              onChange={(e) => {
                setItineraryForm({...itineraryForm, category: e.target.value});
                // Clear search results when category changes
                if (itineraryForm.location) {
                  handleLocationSearch(itineraryForm.location);
                }
              }}
              className={`w-full p-3 rounded-lg border text-base ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="activity">🎯 Activity</option>
              <option value="food">🍽️ Food & Dining</option>
              <option value="transport">🚗 Transport</option>
              <option value="accommodation">🏨 Accommodation</option>
              <option value="shopping">🛍️ Shopping</option>
              <option value="other">📝 Other</option>
            </select>

            {/* Price Input */}
            <div className="relative">
              <input
                type="number"
                step="0.01"
                placeholder="Price ($)"
                value={itineraryForm.price}
                onChange={(e) => setItineraryForm({...itineraryForm, price: e.target.value})}
                className={`w-full p-3 pl-8 rounded-lg border text-base ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
            </div>

            {/* Description Textarea */}
            <textarea
              placeholder="Description (optional)"
              value={itineraryForm.description}
              onChange={(e) => setItineraryForm({...itineraryForm, description: e.target.value})}
              rows={3}
              className={`w-full p-3 rounded-lg border text-base ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
            />

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingItinerary ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};