// TravelPlanner.jsx - Updated to handle date only (no time)
import React, { useState, useEffect } from 'react';
import { MapPin, Moon, Sun } from 'lucide-react';
import ApiService from './services/api.js';
import { DashboardPage } from './components/DashboardPage';
import { TripsPage } from './components/TripsPage';
import { ItineraryPage } from './components/ItineraryPage';
import { BudgetPage } from './components/BudgetPage';
import { TripForm } from './components/TripForm';
import { ItineraryForm } from './components/ItineraryForm';
import { BottomNavigation } from './components/BottomNavigation';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { usePWA } from './hooks/usePWA';


const TravelPlanner = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [showTripForm, setShowTripForm] = useState(false);
  const [showItineraryForm, setShowItineraryForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [editingItinerary, setEditingItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();

  const [tripForm, setTripForm] = useState({
    name: '', destination: '', startDate: '', endDate: '', budget: ''
  });

  // Updated itinerary form without time field
  const [itineraryForm, setItineraryForm] = useState({
    title: '', location: '', date: '', description: '', price: '', category: 'activity'
  });

  // Load trips on component mount
  useEffect(() => {
    loadTrips();
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle PWA shortcuts
  useEffect(() => {
    const pwaAction = sessionStorage.getItem('pwa-action');
    const pwaPage = sessionStorage.getItem('pwa-page');

    if (pwaAction === 'new-trip') {
      setShowTripForm(true);
      sessionStorage.removeItem('pwa-action');
    }

    if (pwaPage) {
      setCurrentPage(pwaPage);
      sessionStorage.removeItem('pwa-page');
    }
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const tripsData = await ApiService.getTrips();
      setTrips(tripsData);
    } catch (error) {
      setError(`Failed to load trips: ${error.message}`);
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async () => {
    if (!tripForm.name || !tripForm.destination || !tripForm.startDate) {
      setError('Please fill in all required fields (Name, Destination, Start Date)');
      return;
    }

    try {
      setError(null);
      const newTrip = await ApiService.createTrip(tripForm);
      setTrips([newTrip, ...trips]);
      setTripForm({ name: '', destination: '', startDate: '', endDate: '', budget: '' });
      setShowTripForm(false);
    } catch (error) {
      setError(`Failed to create trip: ${error.message}`);
      console.error('Error creating trip:', error);
    }
  };

  const updateTrip = async () => {
    if (!editingTrip || !tripForm.name || !tripForm.destination || !tripForm.startDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError(null);
      const updatedTrip = await ApiService.updateTrip(editingTrip.id, tripForm);
      setTrips(trips.map(trip => trip.id === editingTrip.id ? updatedTrip : trip));

      if (activeTrip && activeTrip.id === editingTrip.id) {
        setActiveTrip(updatedTrip);
      }

      setEditingTrip(null);
      setTripForm({ name: '', destination: '', startDate: '', endDate: '', budget: '' });
      setShowTripForm(false);
    } catch (error) {
      setError(`Failed to update trip: ${error.message}`);
      console.error('Error updating trip:', error);
    }
  };

  const deleteTrip = async (tripId) => {
    if (!confirm('Are you sure you want to delete this trip? This will also delete all itinerary items.')) {
      return;
    }

    try {
      setError(null);
      await ApiService.deleteTrip(tripId);
      setTrips(trips.filter(trip => trip.id !== tripId));

      if (activeTrip && activeTrip.id === tripId) {
        setActiveTrip(null);
        setCurrentPage('dashboard');
      }
    } catch (error) {
      setError(`Failed to delete trip: ${error.message}`);
      console.error('Error deleting trip:', error);
    }
  };

  const addItinerary = async () => {
    if (!activeTrip || !itineraryForm.title || !itineraryForm.location) {
      setError('Please fill in all required fields (Title, Location)');
      return;
    }

    try {
      setError(null);
      const newItinerary = await ApiService.createItinerary(activeTrip.id, itineraryForm);

      // Refresh the active trip to get updated data
      const updatedTrip = await ApiService.getTrip(activeTrip.id);
      setActiveTrip(updatedTrip);
      setTrips(trips.map(trip => trip.id === activeTrip.id ? updatedTrip : trip));

      // Reset form without time field
      setItineraryForm({ title: '', location: '', date: '', description: '', price: '', category: 'activity' });
      setShowItineraryForm(false);
    } catch (error) {
      setError(`Failed to add itinerary item: ${error.message}`);
      console.error('Error adding itinerary:', error);
    }
  };

  const updateItinerary = async () => {
    if (!editingItinerary || !itineraryForm.title || !itineraryForm.location) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError(null);
      await ApiService.updateItinerary(editingItinerary.id, itineraryForm);

      // Refresh the active trip to get updated data
      const updatedTrip = await ApiService.getTrip(activeTrip.id);
      setActiveTrip(updatedTrip);
      setTrips(trips.map(trip => trip.id === activeTrip.id ? updatedTrip : trip));

      setEditingItinerary(null);
      // Reset form without time field
      setItineraryForm({ title: '', location: '', date: '', description: '', price: '', category: 'activity' });
      setShowItineraryForm(false);
    } catch (error) {
      setError(`Failed to update itinerary item: ${error.message}`);
      console.error('Error updating itinerary:', error);
    }
  };

  const deleteItinerary = async (itineraryId) => {
    if (!confirm('Are you sure you want to delete this itinerary item?')) {
      return;
    }

    try {
      setError(null);
      await ApiService.deleteItinerary(itineraryId);

      // Refresh the active trip to get updated data
      const updatedTrip = await ApiService.getTrip(activeTrip.id);
      setActiveTrip(updatedTrip);
      setTrips(trips.map(trip => trip.id === activeTrip.id ? updatedTrip : trip));
    } catch (error) {
      setError(`Failed to delete itinerary item: ${error.message}`);
      console.error('Error deleting itinerary:', error);
    }
  };

  const startEditTrip = (trip) => {
    setEditingTrip(trip);
    setTripForm({
      name: trip.name,
      destination: trip.destination,
      startDate: trip.startDate.split('T')[0], // Convert to YYYY-MM-DD format
      endDate: trip.endDate ? trip.endDate.split('T')[0] : '',
      budget: trip.budget.toString()
    });
    setShowTripForm(true);
  };

  const startEditItinerary = (itinerary) => {
    setEditingItinerary(itinerary);
    // Updated to exclude time field
    setItineraryForm({
      title: itinerary.title,
      location: itinerary.location,
      date: itinerary.date.split('T')[0], // Convert to YYYY-MM-DD format
      description: itinerary.description || '',
      price: itinerary.price.toString(),
      category: itinerary.category
    });
    setShowItineraryForm(true);
  };

  const setActiveTripAndRefresh = async (trip) => {
    try {
      setError(null);
      const fullTrip = await ApiService.getTrip(trip.id);
      setActiveTrip(fullTrip);
    } catch (error) {
      setError(`Failed to load trip details: ${error.message}`);
      console.error('Error loading trip details:', error);
    }
  };

  const handleCloseItineraryForm = () => {
    setShowItineraryForm(false);
    setEditingItinerary(null);
    // Reset form without time field
    setItineraryForm({ title: '', location: '', date: '', description: '', price: '', category: 'activity' });
  };

  const handleCloseTripForm = () => {
    setShowTripForm(false);
    setEditingTrip(null);
    setTripForm({ name: '', destination: '', startDate: '', endDate: '', budget: '' });
  };

  const themeClasses = darkMode ? 'bg-gray-900 text-white min-h-screen' : 'bg-gray-50 text-gray-900 min-h-screen';

  const renderCurrentPage = () => {
    const baseProps = {
      trips, activeTrip, setCurrentPage, setShowTripForm, darkMode,
      setActiveTrip: setActiveTripAndRefresh, startEditTrip, deleteTrip
    };
    const itineraryProps = {
      ...baseProps, startEditItinerary, deleteItinerary, setShowItineraryForm
    };

    switch (currentPage) {
      case 'dashboard': return <DashboardPage {...baseProps} />;
      case 'trips': return <TripsPage {...baseProps} />;
      case 'itinerary': return <ItineraryPage {...itineraryProps} />;
      case 'budget': return <BudgetPage {...baseProps} />;
      default: return <DashboardPage {...baseProps} />;
    }
  };

  // Add install button to header (optional)
  const renderInstallButton = () => {
    if (!isInstallable || isInstalled) return null;

    return (
      <button
        onClick={installApp}
        className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
        title="Install App"
      >
        📱
      </button>
    );
  };

  // Add offline indicator
  const renderOfflineIndicator = () => {
    if (isOnline) return null;

    return (
      <div className="fixed top-14 left-4 right-4 bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm z-50">
        📡 You're offline. Some features may be limited.
      </div>
    );
  };

  if (loading) {
    return (
      <div className={themeClasses}>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className={themeClasses}>
      {/* Mobile Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 sticky top-0 z-40`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-500 w-6 h-6" />
            <h1 className="text-lg font-bold">Travel Planner</h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        {activeTrip && (
          <div className={`mt-2 p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className="text-xs font-medium truncate">{activeTrip.name}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>{activeTrip.destination}</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} onClose={() => setError(null)} darkMode={darkMode} />}

      {/* Main Content */}
      <div className="px-4 py-4 pb-20">
        {renderCurrentPage()}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage={currentPage} setCurrentPage={setCurrentPage} activeTrip={activeTrip} darkMode={darkMode} />

      {/* Trip Form Modal */}
      {showTripForm && (
        <TripForm
          tripForm={tripForm}
          setTripForm={setTripForm}
          createTrip={editingTrip ? updateTrip : createTrip}
          setShowTripForm={handleCloseTripForm}
          darkMode={darkMode}
          isEditing={!!editingTrip}
        />
      )}

      {/* Itinerary Form Modal */}
      {showItineraryForm && (
        <ItineraryForm
          itineraryForm={itineraryForm}
          setItineraryForm={setItineraryForm}
          addItinerary={addItinerary}
          updateItinerary={updateItinerary}
          editingItinerary={editingItinerary}
          setEditingItinerary={setEditingItinerary}
          setShowItineraryForm={handleCloseItineraryForm}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default TravelPlanner;