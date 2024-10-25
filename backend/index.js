require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
}
connectDB();

// Define Rate subdocument schema to be embedded in User schema
const rateSchema = new mongoose.Schema({
  rate: { type: Number, required: true },
  mode: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// User Schema and Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savings: { type: Number, default: 0 },
  rates: [rateSchema], // Each user has their own rates array
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let mode = 'low';

const toggleMode = () => {
  mode = mode === 'low' ? 'high' : 'low';
};
setInterval(toggleMode, 10000);

// Generate a random rate and add it to a specific user
const generateUserRate = async (user) => {
  const rateValue = mode === 'low' ? (Math.random() * 50).toFixed(2) : (Math.random() * 50 + 50).toFixed(2);
  const newRate = {
    rate: parseFloat(rateValue),
    mode: rateValue > 50 ? 'Solar' : 'Normal',
    timestamp: new Date(),
  };

  user.rates.push(newRate);
  
  // Calculate new savings based only on "Solar" mode rates in the user's rates array
  user.savings = user.rates
    .filter(rate => rate.mode === 'Solar')
    .reduce((total, rate) => total + rate.rate, 0);
  
  await user.save();
  return newRate;
};

// Socket connection for real-time updates
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('set_user_email', async (email) => {
    socket.join(email);
    const user = await User.findOne({ email });
    if (user) {
      socket.emit('update_total_savings', { totalSavings: user.savings });
      socket.emit('initial_rates', { rates: user.rates.slice(-50) }); // Send last 50 rates
    }
  });

  socket.on('disconnect', () => console.log('A client disconnected:', socket.id));
});

// Generate rates for each user and update their savings
setInterval(async () => {
  const users = await User.find();
  users.forEach(async (user) => {
    const newRate = await generateUserRate(user);
    io.to(user.email).emit('new_rate', newRate); // Emit the new rate to only that user
    io.to(user.email).emit('update_total_savings', { totalSavings: user.savings });
  });
}, 1000);

// Endpoint to get a user's historical data based on a dynamic time range and unit
app.get('/historicaldata', async (req, res) => {
  const { email, amount = 1, unit = 'hours' } = req.query;
  const timeMultiplier = { minutes: 60000, hours: 3600000, days: 86400000 };
  const cutoff = new Date(Date.now() - amount * timeMultiplier[unit]);

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const filteredData = user.rates.filter(rate => new Date(rate.timestamp) >= cutoff);
  res.json(filteredData);
});

// Endpoint to get a user's total savings
app.get('/totalsavings', async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  
  res.json({ totalSavings: user.savings });
});

// Signup Endpoint
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const newUser = new User({ email, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully", savings: newUser.savings });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful", savings: user.savings, rates: user.rates.slice(-50) });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
