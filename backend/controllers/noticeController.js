const noticeService = require("../services/noticeService");

const sendResult = (res, result) => res.status(result.statusCode).json(result.body);

const uploadNotice = async (req, res) => {
  try {
    const result = await noticeService.uploadNotice({
      body: req.body,
      file: req.file,
      user: req.user,
    });

    return sendResult(res, result);
  } catch (err) {
    console.error("Notice upload error:", err);
    return res.status(500).json({
      message: "Error saving notice",
      error: err.message,
    });
  }
};

const updateNotice = async (req, res) => {
  try {
    const result = await noticeService.updateNotice({
      params: req.params,
      body: req.body,
      file: req.file,
      user: req.user,
    });

    return sendResult(res, result);
  } catch (err) {
    console.error("Error updating notice:", err);
    return res.status(500).json({ message: "Error updating notice", error: err.message });
  }
};

const fetchNotices = async (req, res) => {
  try {
    const result = await noticeService.fetchNotices({ query: req.query });
    return sendResult(res, result);
  } catch (error) {
    console.error("Error fetching notices:", error);
    return res.status(500).json({ message: "Error fetching notices", error: error.message });
  }
};

const fetchOfficialNotices = async (req, res) => {
  try {
    const result = await noticeService.fetchOfficialNotices({
      query: req.query,
      user: req.user,
    });

    return sendResult(res, result);
  } catch (error) {
    console.error("Error fetching official notices:", error);
    return res.status(500).json({ message: "Error fetching notices", error: error.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const result = await noticeService.deleteNotice({
      params: req.params,
      user: req.user,
    });

    return sendResult(res, result);
  } catch (err) {
    console.error("Error deleting notice:", err);
    return res.status(500).json({ message: "Error deleting notice", error: err.message });
  }
};

const trackNoticeView = async (req, res) => {
  try {
    const result = await noticeService.trackNoticeView({
      params: req.params,
      body: req.body,
      req,
    });

    return sendResult(res, result);
  } catch (error) {
    console.error("Error tracking view:", error);
    return res.status(500).json({ error: "Failed to track view" });
  }
};

const getPopularNotices = async (req, res) => {
  try {
    const result = await noticeService.getPopularNotices({ query: req.query });
    return sendResult(res, result);
  } catch (error) {
    console.error("Error fetching popular notices:", error);
    return res.status(500).json({ error: "Failed to fetch popular notices" });
  }
};

const getNoticeById = async (req, res) => {
  try {
    const result = await noticeService.getNoticeById({ params: req.params });
    return sendResult(res, result);
  } catch (error) {
    console.error("Error fetching notice:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching notice",
      error: error.message,
    });
  }
};

const getNoticesByVillage = async (req, res) => {
  try {
    const result = await noticeService.getNoticesByVillage({
      params: req.params,
      query: req.query,
      user: req.user,
    });

    return sendResult(res, result);
  } catch (err) {
    console.error("Error fetching notices by village:", err);
    return res.status(500).json({ message: "Error fetching notices", error: err.message });
  }
};

module.exports = {
  uploadNotice,
  fetchNotices,
  fetchOfficialNotices,
  updateNotice,
  deleteNotice,
  trackNoticeView,
  getPopularNotices,
  getNoticeById,
  getNoticesByVillage,
};
