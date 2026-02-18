const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/nearby", async (req, res) => {
  const { lat, lng, type } = req.query;

  let query = "";

  if (type === "hospital") {
    query = `
      [out:json];
      node["amenity"="hospital"](around:5000,${lat},${lng});
      out;
    `;
  } else if (type === "blood_bank") {
    query = `
      [out:json];
      node["healthcare"="blood_donation"](around:5000,${lat},${lng});
      out;
    `;
  } else if (type === "pharmacy") {
    query = `
      [out:json];
      node["amenity"="pharmacy"](around:5000,${lat},${lng});
      out;
    `;
  } else {
    return res.status(400).json({ msg: "Invalid type" });
  }

  try {
    const response = await axios.post(
  "https://overpass.kumi.systems/api/interpreter",
   query,
      { headers: { "Content-Type": "text/plain" } }
    );

    res.json(response.data.elements);
  } catch (error) {
    res.status(500).json({ msg: "Overpass API error" });
  }
});

module.exports = router;
