const { body, param, query, validationResult } = require("express-validator");

const hasUnsafeMongoKey = (value) => {
  if (!value || typeof value !== "object") return false;

  if (Array.isArray(value)) {
    return value.some(hasUnsafeMongoKey);
  }

  return Object.entries(value).some(([key, nestedValue]) => {
    return key.startsWith("$") || key.includes(".") || hasUnsafeMongoKey(nestedValue);
  });
};

const rejectMongoOperators = (req, res, next) => {
  if (
    hasUnsafeMongoKey(req.body) ||
    hasUnsafeMongoKey(req.query) ||
    hasUnsafeMongoKey(req.params)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data.",
    });
  }

  next();
};

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.warn("[validation] Request validation failed", {
      method: req.method,
      path: req.originalUrl,
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

const text = (field, options = {}) => {
  const chain = options.optional
    ? body(field).optional({ checkFalsy: true })
    : body(field).exists({ checkFalsy: true });

  return chain
    .isString()
    .withMessage(`${field} must be text`)
    .trim()
    .isLength({ min: options.min || 1, max: options.max || 500 })
    .withMessage(`${field} length is invalid`);
};

const optionalText = (field, options = {}) => text(field, { ...options, optional: true });

const objectIdBody = (field, options = {}) => {
  const chain = options.optional
    ? body(field).optional({ checkFalsy: true })
    : body(field).exists({ checkFalsy: true });

  return chain.isMongoId().withMessage(`${field} must be a valid id`);
};

const objectIdParam = (field) =>
  param(field).isMongoId().withMessage(`${field} must be a valid id`);

const objectIdQuery = (field) =>
  query(field).optional({ checkFalsy: true }).isMongoId().withMessage(`${field} must be a valid id`);

const pagination = [
  query("page").optional().isInt({ min: 1, max: 10000 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

const stringArray = (field) =>
  body(field)
    .optional()
    .isArray()
    .withMessage(`${field} must be an array`)
    .custom((items) => items.every((item) => typeof item === "string"))
    .withMessage(`${field} must contain only text values`);

const booleanField = (field) => body(field).optional().isBoolean().toBoolean();

const coordinates = [
  body("latitude").exists().isFloat({ min: -90, max: 90 }).toFloat(),
  body("longitude").exists().isFloat({ min: -180, max: 180 }).toFloat(),
];

const authValidators = {
  adminRegister: [
    body("email").isEmail().normalizeEmail(),
    text("password", { min: 6, max: 128 }),
    objectIdBody("village", { optional: true }),
  ],
  loginEmail: [
    body("email").isEmail().normalizeEmail(),
    text("password", { min: 1, max: 128 }),
  ],
  citizenRegister: [
    text("name", { max: 120 }),
    text("phone", { min: 10, max: 15 }),
    text("password", { min: 6, max: 128 }),
    objectIdBody("village"),
  ],
  citizenLogin: [
    text("phone", { min: 10, max: 15 }),
    text("password", { min: 1, max: 128 }),
  ],
  pushToken: [text("pushToken", { min: 10, max: 512 })],
  officialRegister: [
    text("name", { max: 120 }),
    body("email").isEmail().normalizeEmail(),
    text("password", { min: 6, max: 128 }),
    text("phone", { min: 10, max: 15 }),
    objectIdBody("village"),
  ],
};

const adminValidators = {
  editAdmin: [
    objectIdParam("id"),
    body("email").optional({ checkFalsy: true }).isEmail().normalizeEmail(),
    objectIdBody("village", { optional: true }),
    body("status").optional().isIn(["pending", "approved", "rejected"]),
  ],
  editOfficial: [
    objectIdParam("id"),
    optionalText("name", { max: 120 }),
    body("email").optional({ checkFalsy: true }).isEmail().normalizeEmail(),
    optionalText("phone", { min: 10, max: 15 }),
    objectIdBody("village", { optional: true }),
    body("status").optional().isIn(["pending", "approved", "rejected"]),
  ],
};

const villageValidators = {
  register: [
    text("name", { max: 160 }),
    text("district", { max: 120 }),
    text("state", { max: 120 }),
    text("pincode", { min: 4, max: 10 }),
    ...coordinates,
    body("requesterEmail").isEmail().normalizeEmail(),
    text("requesterPassword", { min: 6, max: 128 }),
  ],
  create: [
    text("name", { max: 160 }),
    optionalText("district", { max: 120 }),
    optionalText("state", { max: 120 }),
    optionalText("pincode", { min: 4, max: 10 }),
    ...coordinates,
  ],
  update: [
    objectIdParam("id"),
    optionalText("name", { max: 160 }),
    optionalText("district", { max: 120 }),
    optionalText("state", { max: 120 }),
    optionalText("pincode", { min: 4, max: 10 }),
    body("latitude").optional().isFloat({ min: -90, max: 90 }).toFloat(),
    body("longitude").optional().isFloat({ min: -180, max: 180 }).toFloat(),
  ],
  coordinates: [objectIdParam("id"), ...coordinates],
};

const complaintValidators = {
  create: [
    body("type").isIn(["issue", "suggestion"]),
    text("title", { max: 160 }),
    text("description", { max: 2000 }),
    body("lat").optional().isFloat({ min: -90, max: 90 }).toFloat(),
    body("lng").optional().isFloat({ min: -180, max: 180 }).toFloat(),
    body("imageSource").optional({ checkFalsy: true }).isIn(["camera", "gallery"]),
    body("timestamp").optional({ checkFalsy: true }).isISO8601().toDate(),
  ],
  updateStatus: [
    objectIdParam("id"),
    body("status").isIn(["pending", "in-progress", "resolved", "rejected"]),
  ],
};

const noticeValidators = {
  save: [
    optionalText("noticeId", { min: 24, max: 24 }),
    text("title", { max: 160 }),
    text("description", { max: 5000 }),
    text("category", { max: 80 }),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    body("isPinned").optional().isBoolean().toBoolean(),
  ],
  update: [
    objectIdParam("id"),
    optionalText("title", { max: 160 }),
    optionalText("description", { max: 5000 }),
    optionalText("category", { max: 80 }),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    body("isPinned").optional().isBoolean().toBoolean(),
  ],
  trackView: [
    objectIdParam("id"),
    text("visitorId", { min: 8, max: 128 }),
  ],
};

const schemeValidators = {
  query: [
    ...pagination,
    objectIdQuery("villageId"),
    query("search").optional().isString().trim().isLength({ max: 120 }),
    query("keyword").optional().isString().trim().isLength({ max: 120 }),
    query("category").optional().isString().trim().isLength({ max: 80 }),
    query("tag").optional().isString().trim().isLength({ max: 80 }),
    query("beneficiary").optional().isString().trim().isLength({ max: 80 }),
    query("level").optional().isString().trim().isLength({ max: 80 }),
    query("state").optional().isString().trim().isLength({ max: 120 }),
  ],
  slug: [
    param("slug").isString().trim().isLength({ min: 1, max: 160 }).matches(/^[a-z0-9-]+$/),
    objectIdQuery("villageId"),
  ],
  villageScheme: [
    text("title", { max: 160 }),
    text("description", { max: 5000 }),
    body("amount").optional().isFloat({ min: 0 }).toFloat(),
    optionalText("eligibility", { max: 2000 }),
    stringArray("documents"),
    stringArray("applicationSteps"),
    stringArray("category"),
    optionalText("beneficiary", { max: 120 }),
  ],
};

const workGuideValidators = {
  save: [
    text("category", { max: 120 }),
    text("workName", { max: 160 }),
    text("officerName", { max: 120 }),
    text("designation", { max: 120 }),
    stringArray("availableDays"),
    optionalText("timing", { max: 160 }),
    optionalText("location", { max: 200 }),
    stringArray("documents"),
    stringArray("searchKeywords"),
    optionalText("note", { max: 1000 }),
    booleanField("isActive"),
  ],
  update: [
    objectIdParam("id"),
    optionalText("category", { max: 120 }),
    optionalText("workName", { max: 160 }),
    optionalText("officerName", { max: 120 }),
    optionalText("designation", { max: 120 }),
    stringArray("availableDays"),
    optionalText("timing", { max: 160 }),
    optionalText("location", { max: 200 }),
    stringArray("documents"),
    stringArray("searchKeywords"),
    optionalText("note", { max: 1000 }),
    booleanField("isActive"),
  ],
};

const assistantValidators = {
  chat: [
    text("message", { max: 1000 }),
    objectIdBody("villageId"),
  ],
};

module.exports = {
  rejectMongoOperators,
  validateRequest,
  objectIdParam,
  objectIdQuery,
  pagination,
  authValidators,
  adminValidators,
  villageValidators,
  complaintValidators,
  noticeValidators,
  schemeValidators,
  workGuideValidators,
  assistantValidators,
};
