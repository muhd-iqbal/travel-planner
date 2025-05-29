// src/services/api.js - API Service Layer
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Trip API methods
  async getTrips() {
    return this.request('/trips');
  }

  async getTrip(id) {
    return this.request(`/trips/${id}`);
  }

  async createTrip(tripData) {
    return this.request('/trips', {
      method: 'POST',
      body: tripData,
    });
  }

  async updateTrip(id, tripData) {
    return this.request(`/trips/${id}`, {
      method: 'PUT',
      body: tripData,
    });
  }

  async deleteTrip(id) {
    return this.request(`/trips/${id}`, {
      method: 'DELETE',
    });
  }

  // Itinerary API methods
  async getItineraries(tripId) {
    return this.request(`/trips/${tripId}/itineraries`);
  }

  async createItinerary(tripId, itineraryData) {
    return this.request(`/trips/${tripId}/itineraries`, {
      method: 'POST',
      body: itineraryData,
    });
  }

  async updateItinerary(id, itineraryData) {
    return this.request(`/itineraries/${id}`, {
      method: 'PUT',
      body: itineraryData,
    });
  }

  async deleteItinerary(id) {
    return this.request(`/itineraries/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();