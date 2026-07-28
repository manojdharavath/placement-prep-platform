const User = require("../models/User");

// @desc    Complete AI setup profile
// @route   PUT /api/user/setup
// @access  Private
const completeProfile = async (req, res) => {
  try {
    const {
      targetCompanies,
      dsaLevel,
      studyHours,
      placementTimeline,
    } = req.body;

    // Update user directly (avoids VersionError)
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        targetCompanies: targetCompanies || [],
        dsaLevel: dsaLevel || "Beginner",
        studyHours: studyHours || 2,
        placementTimeline: placementTimeline || 6,
        profileCompleted: true,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile setup completed successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Setup Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("Profile Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  completeProfile,
  getProfile,
};