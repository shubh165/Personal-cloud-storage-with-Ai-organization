import mongoose, { Schema } from "mongoose";

const fileSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    fileCategory: {
      type: String,
      enum: ["image", "video", "audio", "document"],
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      trim: true,
    },

    fileUrl: {
      type: String, // cloudinary url
      required: true,
    },

    cloudinaryPublicId: {
      type: String,
      default: "",
    },

    cloudinaryResourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      default: "raw",
    },

    fileSize: {
      type: Number,
      trim: true,
    },

    aiTags: {
      type: [String],
      default: [],
    },

    aiSummary: {
      type: String,
      trim: true,
      default: "",
    },

    aiTranscript: {
      type: String,
      trim: true,
      default: "",
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTrashed: {
      type: Boolean,
      default: false,
      index: true,
    },
    trashedAt: {
      type: Date,
      default: null,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const File = mongoose.model("File", fileSchema);
