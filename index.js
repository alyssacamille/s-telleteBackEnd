import express from 'express';
import { connect } from 'mongoose'; //For MongoDB
import cors from 'cors';
import User from './models/User.js'; // Import User model
import Product from './models/Products.js'; // Import Product model

const app = express();
const PORT = process.env.PORT || 5173;

// Allow requests from specific origins
app.use(cors({
  origin: ['https://s-tellete.vercel.app', 'https://s-tellete-alyssa-camilles-projects.vercel.app', 'https://s-tellete-git-main-alyssa-camilles-projects.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB online!! na
connect('mongodb+srv://saki:admin12345@cluster0.w8lu7la.mongodb.net/test')
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    console.log('may mali pi huhu');
});

// Handle GET requests at the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the homepage!');
});


// Handle POST requests for both signup and login at the root URL
app.post('/', async (req, res) => {
  const { username, email, dateOfBirth, password, loginUsernameOrEmail, loginPassword } = req.body;

  // Signup logic
  if (username && email && dateOfBirth && password) {
    try {
      // Create a new user document
      const newUser = await User.create({
        username,
        email,
        dateOfBirth,
        password,
      });
      
      // Save the user to the database
      await newUser.save();

      //Return Success Response
      res.status(201).json({ message: "Registration Successful. You are successfully registered!", user: newUser });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: "Internal server error. Unable to register user." });
    }
  } 
  // Login logic
  else if (loginUsernameOrEmail && loginPassword) {
    try {
      // Find the user by username or email
      const user = await User.findOne({ $or: [{ username: loginUsernameOrEmail }, { email: loginUsernameOrEmail }] });
      
      if (!user) {
        // User not found
        return res.status(404).json({ error: "User not found. Please check your username or email." });
      }

      // Compare the provided password with the hashed password
      const isPasswordMatch = await bcrypt.compare(loginPassword, user.password);
      
      if (isPasswordMatch) {
        // Passwords match, login successful
        res.status(200).json({ message: "Login Successful. You are successfully logged in!", user });
      } else {
        // Passwords don't match
        res.status(401).json({ error: "Invalid credentials. Please check your password." });
      }
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: "Internal server error. Unable to log in." });
    }
  } else {
    // Invalid request
    res.status(400).json({ error: "Invalid request. Please provide the required data for login or registration." });
  }
});


//Listen to Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

