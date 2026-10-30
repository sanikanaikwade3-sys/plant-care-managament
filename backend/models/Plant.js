
const mongoose = require("mongoose");

// Define Plant Schema
const plantSchema = new mongoose.Schema({

    plantName: {
        type: String,
        required: [true, "Plant name is required"],
        trim: true,
        minlength: [2, "Plant name must contain at least 2 characters"],
        maxlength: [60, "Plant name cannot exceed 60 characters"]
    },

    category: {
        type: String,
        required: [true, "Category is required"],
        enum: {
            values: ["Indoor", "Outdoor", "Flowering", "Herb"],
            message: "Invalid plant category"
        }
    },

    wateringFrequency: {
        type: Number,
        required: [true, "Watering frequency is required"],
        min: [1, "Watering frequency must be at least 1 day"],
        max: [365, "Watering frequency cannot exceed 365 days"],
        validate: {
            validator: Number.isInteger,
            message: "Watering frequency must be a whole number"
        }
    },

    lastWatered: {
        type: Date,
        required: [true, "Last watered date is required"]
    },

    sunlight: {
        type: String,
        required: [true, "Sunlight requirement is required"],
        enum: {
            values: [
                "Full Sunlight",
                "Partial Sunlight",
                "Indirect Sunlight",
                "Shade"
            ],
            message: "Invalid sunlight requirement"
        }
    },

    notes: {
        type: String,
        trim: true,
        maxlength: [500, "Notes cannot exceed 500 characters"],
        default: ""
    }

}, {
    timestamps: true
});

// Create and export Plant model
const Plant = mongoose.model("Plant", plantSchema);

module.exports = Plant;
