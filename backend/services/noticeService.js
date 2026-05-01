const Notice = require("../models/Notice");
const NoticeView = require("../models/NoticeView");
const Citizen = require("../models/Citizens");
const Village = require("../models/Village");
const { notifyNewNotice } = require("../service/notificationService");
const {
  isValidObjectId,
  parseBoolean,
  parsePage,
  parsePinnedFilter,
} = require("../utils/requestParsers");

const getUploadedFile = (file) => {
  if (!file) {
    return { fileUrl: null, fileName: null };
  }

  return {
    fileUrl: file.path,
    fileName: file.originalname,
  };
};

const buildNoticeFilter = ({ category, priority, isPinned, village } = {}) => {
  const filter = { status: "published" };

  if (village) {
    filter.village = village;
  }

  if (category && category !== "all") {
    filter.category = category;
  }

  if (priority && priority !== "all") {
    filter.priority = priority;
  }

  const pinnedFilter = parsePinnedFilter(isPinned);
  if (pinnedFilter !== undefined) {
    filter.isPinned = pinnedFilter;
  }

  return filter;
};

const findPaginatedNotices = async ({ filter, page, limit, populateVillage = false }) => {
  let query = Notice.find(filter).populate("createdBy", "name email");

  if (populateVillage) {
    query = query.populate("village", "name district state pincode");
  }

  const notices = await query
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Notice.countDocuments(filter);

  return {
    notices,
    totalPages: Math.ceil(total / limit),
    currentPage: parsePage(page),
    total,
  };
};

const notifyVillageCitizens = async ({ village, title }) => {
  try {
    const citizens = await Citizen.find({ village });

    if (citizens && citizens.length > 0) {
      await notifyNewNotice(citizens, title, village);
      console.log(`ðŸ“¬ Push notifications sent to ${citizens.length} citizens`);
    }
  } catch (notifErr) {
    console.error("Push notification error:", notifErr.message);
  }
};

const uploadNotice = async ({ body, file, user }) => {
  const {
    title,
    description,
    noticeId,
    category,
    priority = "medium",
    isPinned = false,
  } = body;

  if (!title || !description || !category) {
    return {
      statusCode: 400,
      body: {
        message: "Missing required fields: title, description, and category are required",
      },
    };
  }

  const { fileUrl, fileName } = getUploadedFile(file);
  let notice;

  if (noticeId) {
    notice = await Notice.findById(noticeId);
    if (!notice) {
      return { statusCode: 404, body: { message: "Notice not found" } };
    }

    if (notice.createdBy.toString() !== user.id) {
      return {
        statusCode: 403,
        body: { message: "Not authorized to update this notice" },
      };
    }

    notice.title = title;
    notice.description = description;
    notice.category = category;
    notice.priority = priority;
    notice.isPinned = parseBoolean(isPinned);

    if (fileUrl) {
      notice.fileUrl = fileUrl;
      notice.fileName = fileName;
    }

    await notice.save();
  } else {
    const noticeData = {
      title,
      description,
      category,
      priority,
      isPinned: parseBoolean(isPinned),
      createdBy: user.id,
      village: user.village,
      status: "published",
    };

    if (fileUrl) {
      noticeData.fileUrl = fileUrl;
      noticeData.fileName = fileName;
    }

    notice = new Notice(noticeData);
    await notice.save();

    await notifyVillageCitizens({ village: user.village, title });
  }

  await notice.populate("createdBy", "name email");

  return {
    statusCode: 201,
    body: {
      message: noticeId ? "Notice updated successfully" : "Notice published successfully",
      notice,
    },
  };
};

const updateNotice = async ({ params, body, file, user }) => {
  const { title, description, category, priority, isPinned } = body;

  if (!isValidObjectId(params.id)) {
    return {
      statusCode: 400,
      body: { message: "Invalid notice ID format" },
    };
  }

  const notice = await Notice.findById(params.id);
  if (!notice) {
    return { statusCode: 404, body: { message: "Notice not found" } };
  }

  if (!user.village) {
    return {
      statusCode: 401,
      body: { message: "Village information not found in token. Please log in again." },
    };
  }

  if (notice.village.toString() !== user.village.toString()) {
    return {
      statusCode: 403,
      body: { message: "Not authorized to update this notice - different village" },
    };
  }

  const { fileUrl, fileName } = getUploadedFile(file);

  notice.title = title || notice.title;
  notice.description = description || notice.description;
  notice.category = category || notice.category;
  notice.priority = priority || notice.priority;
  notice.isPinned = isPinned !== undefined ? parseBoolean(isPinned) : notice.isPinned;

  if (fileUrl) {
    notice.fileUrl = fileUrl;
    notice.fileName = fileName;
  }

  await notice.save();
  await notice.populate("createdBy", "name email");

  return {
    statusCode: 200,
    body: {
      message: "Notice updated successfully",
      notice,
    },
  };
};

const fetchNotices = async ({ query }) => {
  const { category, page = 1, limit = 10, priority, isPinned } = query;
  const filter = buildNoticeFilter({ category, priority, isPinned });
  const body = await findPaginatedNotices({ filter, page, limit });

  return { statusCode: 200, body };
};

const fetchOfficialNotices = async ({ query, user }) => {
  const { category, page = 1, limit = 10, priority, isPinned } = query;
  const filter = buildNoticeFilter({
    category,
    priority,
    isPinned,
    village: user.village,
  });
  const body = await findPaginatedNotices({ filter, page, limit });

  return { statusCode: 200, body };
};

const deleteNotice = async ({ params, user }) => {
  if (!isValidObjectId(params.id)) {
    return {
      statusCode: 400,
      body: { message: "Invalid notice ID format" },
    };
  }

  const notice = await Notice.findById(params.id);
  if (!notice) {
    return { statusCode: 404, body: { message: "Notice not found" } };
  }

  if (!user.village) {
    return {
      statusCode: 401,
      body: { message: "Village information not found in token. Please log in again." },
    };
  }

  if (notice.village.toString() !== user.village.toString()) {
    return {
      statusCode: 403,
      body: { message: "Not authorized to delete this notice - different village" },
    };
  }

  await notice.deleteOne();

  return {
    statusCode: 200,
    body: { message: "Notice deleted successfully" },
  };
};

const trackNoticeView = async ({ params, body, req }) => {
  const { visitorId } = body;
  const noticeId = params.id;

  if (!isValidObjectId(noticeId)) {
    return {
      statusCode: 400,
      body: { error: "Invalid notice ID format" },
    };
  }

  if (!visitorId) {
    return { statusCode: 400, body: { error: "Visitor ID is required" } };
  }

  const notice = await Notice.findById(noticeId);
  if (!notice) {
    return { statusCode: 404, body: { error: "Notice not found" } };
  }

  const existingView = await NoticeView.findOne({
    noticeId,
    visitorId,
  });

  if (existingView) {
    return {
      statusCode: 200,
      body: {
        success: true,
        views: notice.views,
        alreadyViewed: true,
      },
    };
  }

  try {
    const noticeView = new NoticeView({
      noticeId,
      visitorId,
      userAgent: req.get("User-Agent") || "",
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    await noticeView.save();

    notice.views += 1;
    await notice.save();

    return {
      statusCode: 200,
      body: {
        success: true,
        views: notice.views,
        firstView: true,
      },
    };
  } catch (error) {
    if (error.code === 11000) {
      const latestNotice = await Notice.findById(params.id);
      return {
        statusCode: 200,
        body: {
          success: true,
          views: latestNotice.views,
          alreadyViewed: true,
        },
      };
    }

    throw error;
  }
};

const getPopularNotices = async ({ query }) => {
  const { limit = 10, category } = query;

  const popularQuery = { status: "published" };
  if (category && category !== "all") {
    popularQuery.category = category;
  }

  const popularNotices = await Notice.find(popularQuery)
    .sort({ views: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .populate("createdBy", "name email");

  return { statusCode: 200, body: popularNotices };
};

const getNoticeById = async ({ params }) => {
  const { id } = params;

  if (!isValidObjectId(id)) {
    return {
      statusCode: 400,
      body: {
        success: false,
        message: "Invalid notice ID format",
      },
    };
  }

  const notice = await Notice.findById(id).populate("createdBy", "name email");

  if (!notice) {
    return {
      statusCode: 404,
      body: { success: false, message: "Notice not found" },
    };
  }

  return {
    statusCode: 200,
    body: {
      success: true,
      notice,
    },
  };
};

const getNoticesByVillage = async ({ params, query, user }) => {
  const { villageId } = params;
  const { page = 1, limit = 10, category = "all" } = query;

  const village = await Village.findById(villageId);
  if (!village) {
    return { statusCode: 404, body: { message: "Village not found" } };
  }

  if (village.status !== "approved") {
    return {
      statusCode: 403,
      body: { message: "Village is not approved yet" },
    };
  }

  if (user && user.village && user.village.toString() !== villageId.toString()) {
    return {
      statusCode: 403,
      body: { message: "Not authorized to view notices from this village" },
    };
  }

  const filter = buildNoticeFilter({ category, village: villageId });
  const result = await findPaginatedNotices({
    filter,
    page,
    limit,
    populateVillage: true,
  });

  return {
    statusCode: 200,
    body: {
      notices: result.notices,
      village: {
        _id: village._id,
        name: village.name,
        district: village.district,
        state: village.state,
        pincode: village.pincode,
      },
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      total: result.total,
    },
  };
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
