const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("../controllers/movieController");

const storage = multer.diskStorage({
  destination: "upload/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.get("/", controller.getMovies);
router.post("/add", upload.single("poster"), controller.addMovie);
router.get("/view/:id", controller.getMovieById);
router.get("/delete/:id", controller.deleteMovie);
router.post("/update/:id", upload.single("poster"), controller.updateMovie);

module.exports = router;