const Movie = require("../model/movie");

exports.getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.render("index", { movies });
  } catch (err) {
    res.send("Error loading movies");
  }
};

exports.addMovie = async (req, res) => {
  try {
    const movie = new Movie({
      title: req.body.title,
      description: req.body.description,
      genre: req.body.genre,
      year: req.body.year,
      rating: req.body.rating,
      duration: req.body.duration,
      director: req.body.director,
      poster: req.file ? "/upload/" + req.file.filename : ""
    });
    await movie.save();
    res.redirect("/");
  } catch (err) {
    res.send("Error adding movie");
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.render("view", { movie });
  } catch (err) {
    res.send("Movie not found");
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.redirect("/movies");
  } catch (err) {
    res.send("Delete failed");
  }
};

// Naya update function
exports.updateMovie = async (req, res) => {
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
    res.send("Update failed");
  }
};