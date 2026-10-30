
const express = require("express");
const mongoose = require("mongoose");
const Plant = require("../models/Plant");

const router = express.Router();

// 1. CREATE PLANT - POST /api/plants
router.post("/", async (req, res) => {
    try {
        const {
            plantName,
            category,
            wateringFrequency,
            lastWatered,
            sunlight,
            notes
        } = req.body;

        const newPlant = new Plant({
            plantName,
            category,
            wateringFrequency,
            lastWatered,
            sunlight,
            notes
        });

        const savedPlant = await newPlant.save();

        res.status(201).json({
            success: true,
            message: "Plant added successfully",
            data: savedPlant
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});


// 2. READ ALL PLANTS - GET /api/plants
router.get("/", async (req, res) => {
    try {
        const plants = await Plant.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: plants.length,
            data: plants
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// 3. READ SINGLE PLANT - GET /api/plants/:id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid plant ID"
            });
        }

        const plant = await Plant.findById(id);

        if (!plant) {
            return res.status(404).json({
                success: false,
                message: "Plant not found"
            });
        }

        res.status(200).json({
            success: true,
            data: plant
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// 4. UPDATE PLANT - PUT /api/plants/:id
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid plant ID"
            });
        }

        const allowedFields = [
            "plantName",
            "category",
            "wateringFrequency",
            "lastWatered",
            "sunlight",
            "notes"
        ];

        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const updatedPlant = await Plant.findByIdAndUpdate(
            id,
            updateData,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!updatedPlant) {
            return res.status(404).json({
                success: false,
                message: "Plant not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Plant updated successfully",
            data: updatedPlant
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});


// 5. DELETE PLANT - DELETE /api/plants/:id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid plant ID"
            });
        }

        const deletedPlant = await Plant.findByIdAndDelete(id);

        if (!deletedPlant) {
            return res.status(404).json({
                success: false,
                message: "Plant not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Plant deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
