const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    time: { type: String, default: "" },
    description: { type: String, required: true },
    location: { type: String, default: "" },
  },
  { _id: false }
);

const stayOptionSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    type: { type: String, default: "" },
    pricePerNight: { type: String, default: "" },
    whyEco: { type: String, default: "" },
  },
  { _id: false }
);

const dayPlanSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, default: "" },
    activities: [activitySchema],
    localFoodHighlight: { type: String, default: "" },
    ecoTip: { type: String, default: "" },
    estimatedCost: { type: String, default: "" },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    destination: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    members: { type: Number, required: true, min: 1 },
    budget: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    preferences: { type: String, default: "" },
    status: {
      type: String,
      enum: ["generating", "ready", "failed"],
      default: "generating",
    },
    aiSummary: { type: String, default: "" },
    bestTimeToVisit: { type: String, default: "" },
    localTransportTips: { type: String, default: "" },
    weatherNotes: { type: String, default: "" },
    carbonFootprintEstimate: { type: String, default: "" },
    stayOptions: [stayOptionSchema],
    itinerary: [dayPlanSchema],
    packingList: [{ type: String }],
    ecoScore: { type: Number, min: 0, max: 100, default: null },
    rawAiResponse: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);