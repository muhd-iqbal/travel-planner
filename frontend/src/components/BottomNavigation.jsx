import { Home, Plane, List, BarChart3 } from 'lucide-react';

export const BottomNavigation = ({ currentPage, setCurrentPage, activeTrip, darkMode }) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'trips', label: 'Trips', icon: Plane },
    { id: 'itinerary', label: 'Itinerary', icon: List, disabled: !activeTrip },
    { id: 'budget', label: 'Budget', icon: BarChart3, disabled: !activeTrip },
  ];

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t fixed bottom-0 left-0 right-0 z-50`}>
      <div className="grid grid-cols-4 gap-1 p-2">
        {navigationItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const isDisabled = item.disabled;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && setCurrentPage(item.id)}
              disabled={isDisabled}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg touch-manipulation ${
                isDisabled
                  ? `${darkMode ? 'text-gray-600' : 'text-gray-400'} cursor-not-allowed`
                  : isActive
                  ? 'bg-blue-500 text-white'
                  : `${darkMode ? 'text-gray-300 active:bg-gray-700' : 'text-gray-700 active:bg-gray-100'}`
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};