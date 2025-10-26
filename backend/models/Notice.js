
const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  fileUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return v === null || v === '' || /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Invalid file URL'
    }
  },
  fileName: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      "development",
      "health", 
      "education",
      "agriculture",
      "employment",
      "social_welfare",
      "tax_billing",
      "election",
      "meeting",
      "general",
      "urgent"
    ],
    default: "general"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  targetAudience: {
    type: String,
    enum: ["all", "ward_specific"],
    default: "all"
  },
  targetWards: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Officals",
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived", "cancelled"],
    default: "draft",
    required: true,
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  uniqueViews: {
    type: Number,
    default: 0,
    min: 0
  },
  lastViewedAt: {
    type: Date,
    default: null
  },
  publishDate: {
    type: Date,
    default: null
  },
  expiryDate: {
    type: Date,
    default: null
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    version: {
      type: Number,
      default: 1
    },
    language: {
      type: String,
      default: "en"
    }
  }
}, {
  timestamps: true
});

// Virtual for checking if notice is active
NoticeSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'published' && 
         (!this.publishDate || this.publishDate <= now) &&
         (!this.expiryDate || this.expiryDate >= now);
});

// Virtual for days since publication
NoticeSchema.virtual('daysSincePublication').get(function() {
  if (!this.publishDate) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.publishDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until expiry
NoticeSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diffTime = this.expiryDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Instance method to check if notice is expiring soon
NoticeSchema.methods.isExpiringSoon = function(days = 3) {
  if (!this.expiryDate) return false;
  const now = new Date();
  const diffTime = this.expiryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days && diffDays > 0;
};

// Instance method to increment views
NoticeSchema.methods.incrementViews = function(isUnique = false) {
  this.views += 1;
  if (isUnique) {
    this.uniqueViews += 1;
  }
  this.lastViewedAt = new Date();
  return this.save();
};

// Instance method to publish notice
NoticeSchema.methods.publish = function() {
  this.status = 'published';
  this.publishDate = new Date();
  return this.save();
};

// Instance method to archive notice
NoticeSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Static method to get popular notices
NoticeSchema.statics.getPopularNotices = function(limit = 10, days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return this.find({
    status: 'published',
    publishDate: { $gte: date }
  })
  .sort({ views: -1 })
  .limit(limit)
  .populate('createdBy', 'name email');
};

// Static method to get active notices
NoticeSchema.statics.getActiveNotices = function() {
  const now = new Date();
  return this.find({
    status: 'published',
    $or: [
      { publishDate: { $lte: now } },
      { publishDate: null }
    ],
    $or: [
      { expiryDate: { $gte: now } },
      { expiryDate: null }
    ]
  }).sort({ isPinned: -1, publishDate: -1 });
};

// Static method to get notices by ward
NoticeSchema.statics.getNoticesByWard = function(wardNumber) {
  const now = new Date();
  return this.find({
    status: 'published',
    $or: [
      { publishDate: { $lte: now } },
      { publishDate: null }
    ],
    $or: [
      { expiryDate: { $gte: now } },
      { expiryDate: null }
    ],
    $or: [
      { targetAudience: 'all' },
      { 
        targetAudience: 'ward_specific',
        targetWards: wardNumber
      }
    ]
  }).sort({ isPinned: -1, publishDate: -1 });
};

// Static method to automatically expire notices
NoticeSchema.statics.autoExpireNotices = async function() {
  const now = new Date();
  const result = await this.updateMany(
    {
      status: 'published',
      expiryDate: { $lt: now, $ne: null }
    },
    { 
      $set: { 
        status: 'archived',
        updatedAt: now
      } 
    }
  );
  
  console.log(`Auto-archived ${result.modifiedCount} expired notices`);
  return result;
};

// Middleware to set publishDate when status changes to published
NoticeSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishDate) {
    this.publishDate = new Date();
  }
  next();
});

// Indexes for better performance
NoticeSchema.index({ createdAt: -1 });
NoticeSchema.index({ category: 1 });
NoticeSchema.index({ status: 1 });
NoticeSchema.index({ views: -1 });
NoticeSchema.index({ publishDate: -1 });
NoticeSchema.index({ isPinned: -1 });
NoticeSchema.index({ targetAudience: 1, targetWards: 1 });
NoticeSchema.index({ 
  status: 1, 
  publishDate: -1, 
  expiryDate: 1 
});
NoticeSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

module.exports = mongoose.model("Notice", NoticeSchema);