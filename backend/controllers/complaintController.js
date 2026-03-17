const Complaint = require("../models/Complaint");

const createComplaint = async (req, res) => {
  try {

    const { type, title, description } = req.body;

    const lat = Number(req.body.lat);
    const lng = Number(req.body.lng);

    if (!type || !title || !description) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    // Issue specific validation
    if (type === "issue") {

      if (!req.file) {
        return res.status(400).json({
          message: "Issue requires photo"
        });
      }

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          message: "Invalid coordinates"
        });
      }

      // Check nearby duplicate issue
      const nearbyIssue = await Complaint.findOne({
        type: "issue",
        "location.lat": { $gte: lat - 0.0005, $lte: lat + 0.0005 },
        "location.lng": { $gte: lng - 0.0005, $lte: lng + 0.0005 },
        status: { $ne: "resolved" }
      });

      if (nearbyIssue) {
        return res.status(200).json({
          message: "Similar issue already reported",
          duplicateOf: nearbyIssue._id
        });
      }
    }

    const complaint = await Complaint.create({
      citizen: req.user.id,        // from token
      village: req.user.village,   // from token
      type,
      title,
      description,
      photo: req.file ? req.file.path : null,
      location: type === "issue" ? { lat, lng } : null
    });

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = { createComplaint };