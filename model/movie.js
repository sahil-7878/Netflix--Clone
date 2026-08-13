const {Schema, model} = require("mongoose");

const movieSchema = new Schema({
    year: {type: Number, required: true},
    genre: {type: [String], required: true},
    title: {type: String, required: true},
    poster: {type: String, required: true},
    rating: {type: Number, required: true},
    duration: {type: Number, required: true},
    director: {type: [String], required: true},
    description: {type: String, required: true},
}, {
    timestamps: true,
});

module.exports = model("movieSchema", movieSchema);