import { Worker } from "bullmq";
import { createRedisConnection } from "../config/redis.js";
import mongoose from "mongoose";
import fs from "fs";
import { transcribeAudio } from "../services/ai.service.js";

import { analyzeImage, analyzeText } from "../services/ai.service.js";
import { extractText } from "../utils/textExtractor.js";

const File = mongoose.models.File || mongoose.model("File");

export const startAIWorker = () => {
  const worker = new Worker(
    "ai-processing",
    async (job) => {
      console.log("🔥 JOB RECEIVED:", job.data);

      const { fileId, fileCategory, localPath, fileMimeType } = job.data;

      try {
        // 🔄 Set processing
        await File.findByIdAndUpdate(fileId, { aiStatus: "processing" });

        let updateData = {};

        // =========================
        // 🖼️ IMAGE AI
        // =========================
        if (fileCategory === "image") {
          const result = await analyzeImage(localPath);

          console.log("🧠 IMAGE AI RESULT:", result);

          updateData = {
            aiSummary: result.summary || "Image uploaded",
            aiTags: result.tags || ["image"],
          };
        } else if (fileCategory === "audio") {
          const result = await transcribeAudio(localPath);

          console.log("🧠 AUDIO AI RESULT:", result);

          updateData = {
            aiSummary: result.summary,
            aiTags: result.tags,
            aiTranscript: result.transcript,
          };
        }

        // =========================
        // 📄 DOCUMENT AI (PDF / DOCX / TXT)
        // =========================
        else {
          console.log("📄 Extracting text...");

          const extractedText = await extractText(
            localPath,
            fileCategory,
            fileMimeType
          );

          console.log("📄 Extracted length:", extractedText.length);

          if (!extractedText || extractedText.trim().length === 0) {
            console.log("⚠️ No text found in document");

            updateData = {
              aiSummary: "No readable text found",
              aiTags: ["document"],
            };
          } else {
            const result = await analyzeText(extractedText);

            console.log("🧠 TEXT AI RESULT:", result);

            updateData = {
              aiSummary: result.summary || "",
              aiTags: result.tags || [],
            };
          }
        }

        // =========================
        // 💾 SAVE TO DB
        // =========================
        await File.findByIdAndUpdate(
          fileId,
          {
            ...updateData,
            aiStatus: "completed",
          },
          { new: true }
        );

        // =========================
        // 🗑️ DELETE TEMP FILE
        // =========================
        if (localPath && fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
          console.log("🗑️ Temp file deleted");
        }

        console.log("✅ AI done:", fileId);
      } catch (err) {
        console.error("❌ AI failed:", err);

        await File.findByIdAndUpdate(fileId, {
          aiStatus: "failed",
        });
      }
    },
    {
      connection: createRedisConnection(),
    }
  );

  console.log("🚀 AI Worker Started");
};
