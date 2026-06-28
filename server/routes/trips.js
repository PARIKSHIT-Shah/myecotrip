const express = require("express");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/auth");
const { generateTripPlan } = require("../config/aiService");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ trips });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }
    res.json({ trip });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { destination, startDate, endDate, members, budget, currency, preferences } = req.body;

    if (!destination || !startDate || !endDate || !members || !budget) {
      return res.status(400).json({
        message: "Destination, start date, end date, members, and budget are all required.",
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: "End date cannot be before start date." });
    }

    if (Number(members) < 1) {
      return res.status(400).json({ message: "There must be at least 1 traveler." });
    }

    if (Number(budget) < 0) {
      return res.status(400).json({ message: "Budget cannot be negative." });
    }

    const trip = await Trip.create({
      user: req.user._id,
      destination,
      startDate,
      endDate,
      members,
      budget,
      currency: currency || "USD",
      preferences: preferences || "",
      status: "generating",
    });

    try {
      const plan = await generateTripPlan({
        destination,
        startDate,
        endDate,
        members,
        budget,
        currency,
        preferences,
      });

      trip.aiSummary = plan.summary;
      trip.ecoScore = plan.ecoScore;
      trip.bestTimeToVisit = plan.bestTimeToVisit;
      trip.localTransportTips = plan.localTransportTips;
      trip.weatherNotes = plan.weatherNotes;
      trip.carbonFootprintEstimate = plan.carbonFootprintEstimate;
      trip.stayOptions = plan.stayOptions;
      trip.itinerary = plan.itinerary;
      trip.packingList = plan.packingList;
      trip.rawAiResponse = plan.rawText;
      trip.status = "ready";
      await trip.save();

      return res.status(201).json({ trip });
    } catch (aiErr) {
      trip.status = "failed";
      await trip.save();
      console.error("AI generation failed:", aiErr.message);
      return res.status(502).json({
        message:
          "Your trip was saved, but the AI planner couldn't generate an itinerary right now. You can retry from your dashboard.",
        trip,
      });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/:id/retry", async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    trip.status = "generating";
    await trip.save();

    try {
      const plan = await generateTripPlan({
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        members: trip.members,
        budget: trip.budget,
        currency: trip.currency,
        preferences: trip.preferences,
      });

      trip.aiSummary = plan.summary;
      trip.ecoScore = plan.ecoScore;
      trip.bestTimeToVisit = plan.bestTimeToVisit;
      trip.localTransportTips = plan.localTransportTips;
      trip.weatherNotes = plan.weatherNotes;
      trip.carbonFootprintEstimate = plan.carbonFootprintEstimate;
      trip.stayOptions = plan.stayOptions;
      trip.itinerary = plan.itinerary;
      trip.packingList = plan.packingList;
      trip.rawAiResponse = plan.rawText;
      trip.status = "ready";
      await trip.save();

      res.json({ trip });
    } catch (aiErr) {
      trip.status = "failed";
      await trip.save();
      res.status(502).json({ message: "The AI planner is still having trouble. Please try again shortly.", trip });
    }
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }
    res.json({ message: "Trip deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;