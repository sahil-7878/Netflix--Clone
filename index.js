require("dotenv").config();

const express = require("express");
const path = require("path");

const connectDB = require("./config/db");
const Movie = require("./model/movie");
const movieRouter = require("./routes/movieRoutes");

const {
    upload,
    uploadToCloudinary
} = require("./config/cloudinary");

const app = express();
const PORT = process.env.PORT || 8001;

// Connect database
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// API routes
app.use("/api/movies", movieRouter);

// Home page
app.get("/", async (req, res) => {
    try {
        const movies = await Movie.find().sort({
            createdAt: -1
        });

        res.render("index", { movies });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error loading movies");
    }
});

// Movies page
app.get("/movies", async (req, res) => {
    try {
        const movies = await Movie.find().sort({
            createdAt: -1
        });

        res.render("movies", { movies });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error loading movies");
    }
});

// Add movie page
app.get("/add", (req, res) => {
    res.render("add-movie");
});

// View movie
app.get("/view/:id", async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).send("Movie not found");
        }

        res.render("view", { movie });
    } catch (err) {
        console.log(err);
        res.status(500).send("Movie not found");
    }
});

// Edit movie page
app.get("/edit/:id", async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).send("Movie not found");
        }

        res.render("edit-movie", { movie });
    } catch (err) {
        console.log(err);
        res.status(500).send("Movie not found");
    }
});

// Add movie
app.post("/add", upload.single("poster"), async (req, res) => {
    try {
        const {
            title,
            description,
            genre,
            year,
            rating,
            duration,
            director
        } = req.body;

        if (!title || !description || !genre) {
            return res.status(400).send(
                "Title, description and genre are required"
            );
        }

        let poster = "";

        if (req.file) {
            const result = await uploadToCloudinary(
                req.file.buffer
            );

            poster = result.secure_url;
        }

        const movie = new Movie({
            title,
            description,
            genre,
            year: year || new Date().getFullYear(),
            rating: rating || "N/A",
            duration: duration || "N/A",
            director: director || "Unknown",
            poster
        });

        await movie.save();

        console.log("Movie added:", title);

        res.redirect("/movies");
    } catch (err) {
        console.log(err);
        res.status(500).send(
            "Error adding movie: " + err.message
        );
    }
});

// Update movie
app.post(
    "/api/movies/update/:id",
    upload.single("poster"),
    async (req, res) => {
        try {
            const updateData = {
                title: req.body.title,
                description: req.body.description,
                genre: req.body.genre,
                year: req.body.year,
                rating: req.body.rating,
                duration: req.body.duration,
                director: req.body.director
            };

            if (req.file) {
                const result = await uploadToCloudinary(
                    req.file.buffer
                );

                updateData.poster = result.secure_url;
            }

            const movie = await Movie.findByIdAndUpdate(
                req.params.id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!movie) {
                return res.status(404).send(
                    "Movie not found"
                );
            }

            console.log("Movie updated:", movie.title);

            res.redirect("/movies");
        } catch (err) {
            console.log(err);
            res.status(500).send(
                "Update failed: " + err.message
            );
        }
    }
);

// Delete movie
app.delete("/movies/:id", async (req, res) => {
    try {
        const movie = await Movie.findById(
            req.params.id
        );

        if (!movie) {
            return res.status(404).json({
                error: "Movie not found"
            });
        }

        await Movie.findByIdAndDelete(
            req.params.id
        );

        console.log("Movie deleted:", movie.title);

        res.json({
            success: true
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            error: "Delete failed"
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.log(err);

    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).send(
            "Image size must be less than 5MB"
        );
    }

    res.status(500).send(
        err.message || "Something went wrong"
    );
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});