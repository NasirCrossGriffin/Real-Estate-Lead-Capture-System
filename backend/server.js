const express = require('express')
const router = express.Router()
dotenv = require("dotenv").config();
const cors = require("cors");
const session = require("express-session");
const path = require('path');
const MongoStore = require('connect-mongo').default;

//Define app
const app = express()

app.use(express.json());

const port = process.env.PORT

//Cors Settings
const permittedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176", // Vite
  "http://localhost:3000", // React dev server / same port sometimes
  "http://localhost:4200", // Angular
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4200",
  "http://nasirgriffin.com",
  "http://www.nasirgriffin.com",
  "https://nasirgriffin.com",
  "https://www.nasirgriffin.com"
];

app.use(
  cors({
    origin: permittedOrigins,          // do NOT use "*" with credentials
    credentials: true,           // needed if frontend uses fetch(..., { credentials: 'include' })
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//Mongoose
const mongoUrl = process.env.MONGO_URL;

const mongoose = require('mongoose');

const connectToMongo = async () => {
  await mongoose.connect(mongoUrl);
}

try {
    connectToMongo();
    console.log("Successfully connected to Mongo Database")
} catch(err) {
    console.log("failed to connect to MongoDB with error: " + err);
}

//Session

const store = MongoStore.create({
      mongoUrl: process.env.MONGO_URL, // your Mongo connection string
      collectionName: "apex_sessions",
      ttl: 60 * 60 * 24 * 7, // seconds
})

app.use(
  session({
    name: "apex", // cookie name
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // true behind HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
    store: store,
  })
);


app.use(express.json());

app.use(`${process.env.BASE_URL}/api/organization`, require('./routes/organization'));
app.use(`${process.env.BASE_URL}/api/contact`, require('./routes/contact'));
app.use(`${process.env.BASE_URL}/api/user`, require('./routes/user'));
app.use(`${process.env.BASE_URL}/api/admin`, require('./routes/admin'));
app.use(`${process.env.BASE_URL}/api/real-estate-query`, require('./routes/real-estate-query'));
app.use(`${process.env.BASE_URL}/api/real-estate-photo`, require('./routes/real-estate-photo'));
app.use(`${process.env.BASE_URL}/api/query-response`, require('./routes/query-response'));
app.use(`${process.env.BASE_URL}/api/s3`, require('./routes/upload'));
app.use(`${process.env.BASE_URL}/api/notes`, require('./routes/note'));


// Serve frontend build
app.use(express.static(path.join(__dirname, "build")));

// SPA fallback (must be last)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

//Start Server
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`)
})

module.exports = app;
