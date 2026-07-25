import fs from "fs";
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// ✅ NEW VERSION IMPORT
const { PDFParse } = require("pdf-parse");

export const extractText = async (filePath, fileCategory, mimeType) => {
  try {
    // =========================
    // 📄 PDF (NEW API)
    // =========================
    if (mimeType === "application/pdf") {
      const buffer = fs.readFileSync(filePath);

      const parser = new PDFParse({ data: buffer });

      const result = await parser.getText();

      return result.text;
    }

    // =========================
    // 📄 DOCX
    // =========================
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    // =========================
    // 📄 TXT
    // =========================
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error("Text extraction error:", error.message);
    return "";
  }
};
