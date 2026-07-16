require("dotenv").config();

const express = require("express");
const path = require("path");
const multer = require("multer");

const connectDB = require("./config/db");
const Movie = require("./model/movie");
const movieRouter = require("./routes/movieRoutes");

const app = express();
const PORT = process.env.PORT || 8001;

// Database Connection
connectDB();

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));
app.use("/upload", express.static(path.join(__dirname, "upload")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/api/movies", movieRouter);

// Home Page
app.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.render("index", { movies });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Movies Page
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.render("movies", { movies });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add Movie Page
app.get("/add", (req, res) => {
  res.render("add-movie");
});

// View Movie
app.get("/view/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.render("view", { movie });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Edit Movie Page
app.get("/edit/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.render("edit-movie", { movie });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update Movie
app.post("/api/movies/update/:id", upload.single("poster"), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      genre: req.body.genre,
      year: req.body.year,
      rating: req.body.rating,
      duration: req.body.duration,
      director: req.body.director,
    };

    if (req.file) {
      updateData.poster = "/upload/" + req.file.filename;
    }

    await Movie.findByIdAndUpdate(req.params.id, updateData);

    res.redirect("/movies");
  } catch (err) {
    res.status(500).send("Update failed: " + err.message);
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
