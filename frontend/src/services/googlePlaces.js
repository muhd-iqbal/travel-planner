// src/services/googlePlaces.js - Fixed Google Places API Service
class GooglePlacesService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    this.autocompleteService = null;
    this.placesService = null;
    this.isLoaded = false;
    this.isLoading = false;
    this.initPromise = null;
  }

  // Initialize Google Places API with better error handling
  async initialize() {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return true if already loaded
    if (this.isLoaded) {
      return true;
    }

    // Check if API key exists
    if (!this.apiKey) {
      console.warn('Google Places API key not found. Using fallback search.');
      return false;
    }

    // Create initialization promise
    this.initPromise = this._initializeGoogle();
    return this.initPromise;
  }

  async _initializeGoogle() {
    try {
      this.isLoading = true;

      // Load Google Maps JavaScript API if not already loaded
      if (!window.google || !window.google.maps) {
        await this.loadGoogleMapsScript();
      }

      // Wait for Google Maps to be fully available
      await this.waitForGoogleMaps();

      // Check if Places API is available
      if (!window.google.maps.places) {
        throw new Error('Google Places API not loaded');
      }

      // Initialize services with error handling
      try {
        this.autocompleteService = new window.google.maps.places.AutocompleteService();
        
        // Create a temporary div for PlacesService
        const tempDiv = document.createElement('div');
        this.placesService = new window.google.maps.places.PlacesService(tempDiv);
        
        this.isLoaded = true;
        console.log('Google Places API initialized successfully');
        return true;
      } catch (serviceError) {
        console.error('Error creating Google Places services:', serviceError);
        return false;
      }

    } catch (error) {
      console.error('Failed to initialize Google Places API:', error);
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  // Load Google Maps JavaScript API
  loadGoogleMapsScript() {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        if (window.google && window.google.maps) {
          resolve();
        } else {
          // Wait for existing script to load
          existingScript.addEventListener('load', resolve);
          existingScript.addEventListener('error', reject);
        }
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Create global callback
      window.initGoogleMaps = () => {
        resolve();
        delete window.initGoogleMaps;
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps script'));
        delete window.initGoogleMaps;
      };
      
      document.head.appendChild(script);
    });
  }

  // Wait for Google Maps to be fully loaded with timeout
  waitForGoogleMaps(timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkGoogleMaps = () => {
        if (window.google && 
            window.google.maps && 
            window.google.maps.places &&
            window.google.maps.places.AutocompleteService) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for Google Maps to load'));
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };
      
      checkGoogleMaps();
    });
  }

  // Search for places using autocomplete with improved error handling
  async searchPlaces(query, options = {}) {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      // Initialize if not already done
      const initialized = await this.initialize();
      if (!initialized || !this.autocompleteService) {
        return this.getFallbackResults(query);
      }

      return new Promise((resolve) => {
        const request = {
          input: query,
          types: options.types || ['establishment', 'geocode'],
          componentRestrictions: options.componentRestrictions || {},
          ...options
        };

        // Add timeout to prevent hanging
        const timeout = setTimeout(() => {
          console.warn('Google Places search timeout, using fallback');
          resolve(this.getFallbackResults(query));
        }, 5000);

        this.autocompleteService.getPlacePredictions(request, (results, status) => {
          clearTimeout(timeout);
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            const places = results.slice(0, 5).map(result => ({
              id: result.place_id,
              name: result.description,
              mainText: result.structured_formatting?.main_text || result.description,
              secondaryText: result.structured_formatting?.secondary_text || '',
              types: result.types || []
            }));
            resolve(places);
          } else {
            console.warn('Google Places API status:', status);
            resolve(this.getFallbackResults(query));
          }
        });
      });
    } catch (error) {
      console.error('Search error:', error);
      return this.getFallbackResults(query);
    }
  }

  // Get place details by place ID with better error handling
  async getPlaceDetails(placeId) {
    try {
      const initialized = await this.initialize();
      if (!initialized || !this.placesService) {
        return null;
      }

      return new Promise((resolve) => {
        const request = {
          placeId: placeId,
          fields: ['name', 'formatted_address', 'geometry', 'types', 'rating', 'photos', 'price_level']
        };

        // Add timeout
        const timeout = setTimeout(() => {
          console.warn('Place details timeout');
          resolve(null);
        }, 5000);

        this.placesService.getDetails(request, (place, status) => {
          clearTimeout(timeout);
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            try {
              const result = {
                id: placeId,
                name: place.name,
                address: place.formatted_address,
                types: place.types || [],
                rating: place.rating || null,
                priceLevel: place.price_level || null
              };

              // Safely get location
              if (place.geometry && place.geometry.location) {
                try {
                  result.location = {
                    lat: typeof place.geometry.location.lat === 'function' 
                      ? place.geometry.location.lat() 
                      : place.geometry.location.lat,
                    lng: typeof place.geometry.location.lng === 'function' 
                      ? place.geometry.location.lng() 
                      : place.geometry.location.lng
                  };
                } catch (locError) {
                  console.warn('Error getting location:', locError);
                }
              }

              // Safely get photos
              if (place.photos && place.photos.length > 0) {
                try {
                  result.photos = place.photos.slice(0, 3).map(photo => {
                    try {
                      return photo.getUrl({ maxWidth: 400, maxHeight: 300 });
                    } catch (photoError) {
                      console.warn('Error getting photo URL:', photoError);
                      return null;
                    }
                  }).filter(Boolean);
                } catch (photosError) {
                  console.warn('Error processing photos:', photosError);
                }
              }

              resolve(result);
            } catch (processingError) {
              console.warn('Error processing place details:', processingError);
              resolve(null);
            }
          } else {
            console.warn('Place details error:', status);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('getPlaceDetails error:', error);
      return null;
    }
  }

  // Enhanced fallback results
  getFallbackResults(query) {
    const mockPlaces = [
      { 
        id: 'mock-eiffel', 
        name: 'Eiffel Tower, Paris, France', 
        mainText: 'Eiffel Tower', 
        secondaryText: 'Paris, France',
        types: ['tourist_attraction']
      },
      { 
        id: 'mock-central-park', 
        name: 'Central Park, New York, NY, USA', 
        mainText: 'Central Park', 
        secondaryText: 'New York, NY, USA',
        types: ['park']
      },
      { 
        id: 'mock-colosseum', 
        name: 'Colosseum, Rome, Italy', 
        mainText: 'Colosseum', 
        secondaryText: 'Rome, Italy',
        types: ['tourist_attraction']
      },
      { 
        id: 'mock-tower-bridge', 
        name: 'Tower Bridge, London, UK', 
        mainText: 'Tower Bridge', 
        secondaryText: 'London, UK',
        types: ['tourist_attraction']
      },
      { 
        id: 'mock-statue-liberty', 
        name: 'Statue of Liberty, New York, NY, USA', 
        mainText: 'Statue of Liberty', 
        secondaryText: 'New York, NY, USA',
        types: ['tourist_attraction']
      },
      { 
        id: 'mock-big-ben', 
        name: 'Big Ben, London, UK', 
        mainText: 'Big Ben', 
        secondaryText: 'London, UK',
        types: ['tourist_attraction']
      },
      { 
        id: 'mock-arc-triomphe', 
        name: 'Arc de Triomphe, Paris, France', 
        mainText: 'Arc de Triomphe', 
        secondaryText: 'Paris, France',
        types: ['tourist_attraction']
      },
      { 
        id: 'mock-times-square', 
        name: 'Times Square, New York, NY, USA', 
        mainText: 'Times Square', 
        secondaryText: 'New York, NY, USA',
        types: ['tourist_attraction']
      },
      { 
        id: 'mock-vatican', 
        name: 'Vatican City, Vatican', 
        mainText: 'Vatican City', 
        secondaryText: 'Vatican',
        types: ['tourist_attraction']
      },
      { 
        id: 'mock-notre-dame', 
        name: 'Notre Dame, Paris, France', 
        mainText: 'Notre Dame', 
        secondaryText: 'Paris, France',
        types: ['tourist_attraction']
      }
    ];

    const lowercaseQuery = query.toLowerCase();
    return mockPlaces.filter(place => 
      place.name.toLowerCase().includes(lowercaseQuery) ||
      place.mainText.toLowerCase().includes(lowercaseQuery) ||
      place.secondaryText.toLowerCase().includes(lowercaseQuery)
    ).slice(0, 5);
  }

  // Category-specific search methods with fallback
  async searchRestaurants(query, location = null) {
    return this.searchPlaces(query, {
      types: ['restaurant', 'food', 'meal_takeaway', 'cafe'],
      location: location,
      radius: location ? 5000 : undefined
    });
  }

  async searchHotels(query, location = null) {
    return this.searchPlaces(query, {
      types: ['lodging'],
      location: location,
      radius: location ? 10000 : undefined
    });
  }

  async searchAttractions(query, location = null) {
    return this.searchPlaces(query, {
      types: ['tourist_attraction', 'museum', 'amusement_park', 'zoo', 'aquarium'],
      location: location,
      radius: location ? 15000 : undefined
    });
  }

  // Check if Google Places API is available
  isAvailable() {
    return this.isLoaded && this.autocompleteService && this.placesService;
  }

  // Get initialization status
  getStatus() {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      hasApiKey: !!this.apiKey,
      isAvailable: this.isAvailable()
    };
  }
}

export default new GooglePlacesService();