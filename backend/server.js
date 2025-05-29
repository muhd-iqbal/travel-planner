// server.js - Updated Itinerary Schema (Date Only)
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-planner', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Trip Schema (unchanged)
const tripSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  budget: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Updated Itinerary Schema - Removed time field
const itinerarySchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  // Removed: time: { type: String },
  description: { type: String },
  price: { type: Number, default: 0 },
  category: { 
    type: String, 
    enum: ['activity', 'food', 'transport', 'accommodation', 'shopping', 'other'],
    default: 'activity'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Trip = mongoose.model('Trip', tripSchema);
const Itinerary = mongoose.model('Itinerary', itinerarySchema);

// API Routes (most routes unchanged, only itinerary creation/update affected)

// Get all trips
app.get('/api/trips', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    
    // Calculate totalSpent for each trip
    const tripsWithSpent = await Promise.all(
      trips.map(async (trip) => {
        const itineraries = await Itinerary.find({ tripId: trip._id });
        const totalSpent = itineraries.reduce((sum, item) => sum + item.price, 0);
        
        // Update trip if totalSpent changed
        if (trip.totalSpent !== totalSpent) {
          await Trip.findByIdAndUpdate(trip._id, { totalSpent, updatedAt: new Date() });
        }
        
        return {
          ...trip.toObject(),
          id: trip._id,
          totalSpent,
          itineraries: itineraries.map(item => ({ ...item.toObject(), id: item._id }))
        };
      })
    );
    
    res.json(tripsWithSpent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single trip with itineraries
app.get('/api/trips/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    const itineraries = await Itinerary.find({ tripId: trip._id }).sort({ date: 1 }); // Sort by date only
    const totalSpent = itineraries.reduce((sum, item) => sum + item.price, 0);
    
    // Update totalSpent if changed
    if (trip.totalSpent !== totalSpent) {
      await Trip.findByIdAndUpdate(trip._id, { totalSpent, updatedAt: new Date() });
    }
    
    res.json({
      ...trip.toObject(),
      id: trip._id,
      totalSpent,
      itineraries: itineraries.map(item => ({ ...item.toObject(), id: item._id }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new trip (unchanged)
app.post('/api/trips', async (req, res) => {
  try {
    const { name, destination, startDate, endDate, budget } = req.body;
    
    const trip = new Trip({
      name,
      destination,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      budget: parseFloat(budget) || 0
    });
    
    const savedTrip = await trip.save();
    res.status(201).json({
      ...savedTrip.toObject(),
      id: savedTrip._id,
      itineraries: []
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update trip (unchanged)
app.put('/api/trips/:id', async (req, res) => {
  try {
    const { name, destination, startDate, endDate, budget } = req.body;
    
    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        name,
        destination,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        budget: parseFloat(budget) || 0,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    const itineraries = await Itinerary.find({ tripId: updatedTrip._id });
    const totalSpent = itineraries.reduce((sum, item) => sum + item.price, 0);
    
    res.json({
      ...updatedTrip.toObject(),
      id: updatedTrip._id,
      totalSpent,
      itineraries: itineraries.map(item => ({ ...item.toObject(), id: item._id }))
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete trip (unchanged)
app.delete('/api/trips/:id', async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Delete all itineraries for this trip
    await Itinerary.deleteMany({ tripId: req.params.id });
    
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get itineraries for a trip
app.get('/api/trips/:tripId/itineraries', async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ tripId: req.params.tripId }).sort({ date: 1 }); // Sort by date only
    res.json(itineraries.map(item => ({ ...item.toObject(), id: item._id })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new itinerary item - Updated to exclude time
app.post('/api/trips/:tripId/itineraries', async (req, res) => {
  try {
    const { title, location, date, description, price, category } = req.body;
    // Removed: time from destructuring
    
    const itinerary = new Itinerary({
      tripId: req.params.tripId,
      title,
      location,
      date: new Date(date),
      // Removed: time,
      description,
      price: parseFloat(price) || 0,
      category
    });
    
    const savedItinerary = await itinerary.save();
    
    // Update trip's totalSpent
    const allItineraries = await Itinerary.find({ tripId: req.params.tripId });
    const totalSpent = allItineraries.reduce((sum, item) => sum + item.price, 0);
    await Trip.findByIdAndUpdate(req.params.tripId, { totalSpent, updatedAt: new Date() });
    
    res.status(201).json({
      ...savedItinerary.toObject(),
      id: savedItinerary._id
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update itinerary item - Updated to exclude time
app.put('/api/itineraries/:id', async (req, res) => {
  try {
    const { title, location, date, description, price, category } = req.body;
    // Removed: time from destructuring
    
    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      {
        title,
        location,
        date: new Date(date),
        // Removed: time,
        description,
        price: parseFloat(price) || 0,
        category,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedItinerary) {
      return res.status(404).json({ error: 'Itinerary item not found' });
    }
    
    // Update trip's totalSpent
    const allItineraries = await Itinerary.find({ tripId: updatedItinerary.tripId });
    const totalSpent = allItineraries.reduce((sum, item) => sum + item.price, 0);
    await Trip.findByIdAndUpdate(updatedItinerary.tripId, { totalSpent, updatedAt: new Date() });
    
    res.json({
      ...updatedItinerary.toObject(),
      id: updatedItinerary._id
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete itinerary item (unchanged)
app.delete('/api/itineraries/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findByIdAndDelete(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary item not found' });
    }
    
    // Update trip's totalSpent
    const allItineraries = await Itinerary.find({ tripId: itinerary.tripId });
    const totalSpent = allItineraries.reduce((sum, item) => sum + item.price, 0);
    await Trip.findByIdAndUpdate(itinerary.tripId, { totalSpent, updatedAt: new Date() });
    
    res.json({ message: 'Itinerary item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check (unchanged)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Travel Planner API is running' });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();