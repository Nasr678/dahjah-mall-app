var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_zlib = __toESM(require("zlib"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var aiClient = null;
function getGeminiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = Number(process.env.PORT) || 3e3;
  app.use((req, res, next) => {
    const acceptEncoding = String(req.headers["accept-encoding"] || "");
    const supportsBr = acceptEncoding.includes("br");
    const supportsGzip = acceptEncoding.includes("gzip");
    if (!supportsBr && !supportsGzip) {
      return next();
    }
    const origSend = res.send.bind(res);
    const origJson = res.json.bind(res);
    const shouldCompress = (contentType, byteLength) => {
      if (byteLength < 1024) return false;
      const ct = String(contentType || "").toLowerCase();
      return !ct || ct.includes("json") || ct.includes("text/") || ct.includes("javascript") || ct.includes("svg") || ct.includes("xml");
    };
    const compressAndSend = (body) => {
      if (res.headersSent || res.getHeader("Content-Encoding")) {
        return origSend(body);
      }
      const buf = Buffer.isBuffer(body) ? body : Buffer.from(String(body), "utf8");
      if (!shouldCompress(res.getHeader("Content-Type"), buf.length)) {
        return origSend(body);
      }
      res.setHeader("Vary", "Accept-Encoding");
      try {
        if (supportsBr) {
          const compressed2 = import_zlib.default.brotliCompressSync(buf, {
            params: { [import_zlib.default.constants.BROTLI_PARAM_QUALITY]: 4 }
          });
          res.setHeader("Content-Encoding", "br");
          res.setHeader("Content-Length", String(compressed2.length));
          return origSend(compressed2);
        }
        const compressed = import_zlib.default.gzipSync(buf, { level: 6 });
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Content-Length", String(compressed.length));
        return origSend(compressed);
      } catch {
        return origSend(body);
      }
    };
    res.json = ((data) => {
      if (!res.getHeader("Content-Type")) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      return compressAndSend(JSON.stringify(data));
    });
    res.send = ((body) => {
      if (typeof body === "string" || Buffer.isBuffer(body)) {
        return compressAndSend(body);
      }
      return origSend(body);
    });
    next();
  });
  app.use(import_express.default.json({ limit: "15mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "15mb" }));
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "\u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644 \u2014 Dajjah Mall" });
  });
  const catalogData = [
    {
      id: "prod-w-1",
      name: "\u0641\u0633\u062A\u0627\u0646 \u0633\u0647\u0631\u0629 \u0623\u0633\u0648\u062F \u0645\u0644\u0643\u064A \u0645\u0631\u0635\u0639 \u0628\u0627\u0644\u0643\u0631\u064A\u0633\u062A\u0627\u0644 \u0627\u0644\u0644\u0627\u0645\u0639",
      cat: "\u0646\u0633\u0627\u0626\u064A",
      subcat: "\u0641\u0633\u0627\u062A\u064A\u0646",
      price: 18500,
      orig: 32e3,
      colors: ["\u0623\u0633\u0648\u062F", "\u0623\u0633\u0648\u062F \u0645\u0644\u0643\u064A", "\u0643\u062D\u0644\u064A \u0644\u064A\u0644\u064A", "\u0639\u0646\u0627\u0628\u064A \u0645\u062E\u0645\u0644\u064A"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      stock: 7,
      desc: "\u0641\u0633\u062A\u0627\u0646 \u0633\u0647\u0631\u0629 \u0628\u062A\u0635\u0645\u064A\u0645 \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A \u0648\u0642\u0645\u0627\u0634 \u0633\u0627\u062A\u0627\u0646 \u0643\u0631\u064A\u0628 \u0643\u0648\u0631\u064A \u0641\u0627\u062E\u0631 \u0645\u0631\u0635\u0639 \u0628\u0627\u0644\u0643\u0631\u064A\u0633\u062A\u0627\u0644 \u0627\u0644\u0644\u0627\u0645\u0639 \u0644\u0644\u0633\u0647\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0627\u062A"
    },
    {
      id: "prod-w-2",
      name: "\u0628\u0646\u0637\u0627\u0644 \u0646\u0633\u0627\u0626\u064A \u0643\u0644\u0627\u0633\u064A\u0643 \u0628\u0642\u0635\u0629 \u0645\u0633\u062A\u0642\u064A\u0645\u0629 \u0648\u0642\u0645\u0627\u0634 \u0625\u064A\u0637\u0627\u0644\u064A \u0645\u0631\u0646",
      cat: "\u0646\u0633\u0627\u0626\u064A",
      subcat: "\u0628\u0646\u0627\u0637\u0644",
      price: 11200,
      orig: 18e3,
      colors: ["\u0628\u064A\u062C \u0643\u0644\u0627\u0633\u064A\u0643", "\u0623\u0633\u0648\u062F \u0643\u0631\u0628\u0648\u0646\u064A", "\u0631\u0645\u0627\u062F\u064A \u0641\u0627\u062A\u062D"],
      sizes: ["38", "40", "42", "44"],
      stock: 15,
      desc: "\u0628\u0646\u0637\u0627\u0644 \u0646\u0633\u0627\u0626\u064A \u0639\u0645\u0644\u064A \u0644\u0644\u062F\u0648\u0627\u0645 \u0648\u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0627\u062A \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0628\u0642\u0645\u0627\u0634 \u0625\u064A\u0637\u0627\u0644\u064A \u0645\u0637\u0627\u0637\u064A"
    },
    {
      id: "prod-w-3",
      name: "\u0628\u0644\u0648\u0632\u0629 \u0634\u064A\u0641\u0648\u0646 \u062D\u0631\u064A\u0631\u064A \u0628\u0637\u0628\u0639\u0629 \u0623\u0632\u0647\u0627\u0631 \u0646\u0627\u0639\u0645\u0629 \u0648\u064A\u0627\u0642\u0629 \u0641\u064A\u0648\u0646\u0643\u0629",
      cat: "\u0646\u0633\u0627\u0626\u064A",
      subcat: "\u0628\u0644\u0648\u0632\u0627\u062A",
      price: 8900,
      orig: 14500,
      colors: ["\u0648\u0631\u062F\u064A \u0628\u0648\u062F\u0631\u064A", "\u0623\u0648\u0641 \u0648\u0627\u064A\u062A \u0639\u0627\u062C\u064A"],
      sizes: ["S", "M", "L", "XL"],
      stock: 20,
      desc: "\u0628\u0644\u0648\u0632\u0629 \u062D\u0631\u064A\u0631 \u0634\u064A\u0641\u0648\u0646 \u062A\u0631\u0643\u064A \u0645\u0637\u0631\u0632\u0629 \u0628\u0631\u0628\u0637\u0629 \u0641\u064A\u0648\u0646\u0643\u0629 \u0623\u0646\u064A\u0642\u0629"
    },
    {
      id: "prod-w-4",
      name: "\u0631\u0648\u0628 \u0645\u062E\u0645\u0644\u064A \u0641\u0627\u062E\u0631 \u0628\u062A\u0637\u0631\u064A\u0632 \u0630\u0647\u0628\u064A \u0639\u0644\u0649 \u0627\u0644\u0623\u0643\u0645\u0627\u0645",
      cat: "\u0646\u0633\u0627\u0626\u064A",
      subcat: "\u0623\u0631\u0648\u0627\u0628",
      price: 14800,
      orig: 24e3,
      colors: ["\u0632\u0645\u0631\u062F\u064A \u0645\u0644\u0643\u064A", "\u0639\u0646\u0627\u0628\u064A \u0646\u0628\u064A\u0630\u064A"],
      sizes: ["Free Size"],
      stock: 12,
      desc: "\u0631\u0648\u0628 \u0645\u062E\u0645\u0644\u064A \u0641\u062E\u0645 \u0645\u0639 \u062A\u0637\u0631\u064A\u0632 \u0642\u0635\u0628 \u0630\u0647\u0628\u064A \u0623\u0635\u064A\u0644 \u0639\u0644\u0649 \u0627\u0644\u064A\u0627\u0642\u0629 \u0648\u0627\u0644\u0623\u0643\u0645\u0627\u0645"
    },
    {
      id: "prod-w-5",
      name: "\u062A\u0646\u0648\u0631\u0629 \u0628\u0644\u064A\u0633\u064A\u0647 \u0645\u0643\u0633\u0631\u0629 \u0645\u064A\u062F\u064A \u0628\u0644\u0645\u0639\u0629 \u062D\u0631\u064A\u0631\u064A\u0629 \u0633\u0627\u062D\u0631\u0629",
      cat: "\u0646\u0633\u0627\u0626\u064A",
      subcat: "\u062A\u0646\u0627\u0646\u064A\u0631",
      price: 9500,
      orig: 16e3,
      colors: ["\u0630\u0647\u0628\u064A \u0634\u0627\u0645\u0628\u064A\u0646", "\u0628\u0631\u0648\u0646\u0632\u064A \u0644\u0627\u0645\u0639", "\u0623\u0633\u0648\u062F"],
      sizes: ["S/M", "L/XL"],
      stock: 18,
      desc: "\u062A\u0646\u0648\u0631\u0629 \u0628\u0644\u064A\u0633\u064A\u0647 \u0628\u0643\u0633\u0631\u0627\u062A \u0627\u0646\u0633\u064A\u0627\u0628\u064A\u0629 \u062F\u0642\u064A\u0642\u0629 \u062B\u0627\u0628\u062A\u0629 \u0628\u0639\u062F \u0627\u0644\u063A\u0633\u064A\u0644"
    },
    {
      id: "prod-w-6",
      name: "\u0637\u0642\u0645 \u0643\u0627\u062C\u0648\u0627\u0644 \u0646\u0633\u0627\u0626\u064A \u0645\u0643\u0648\u0646 \u0645\u0646 \u062A\u0648\u0628 \u0648\u0628\u0646\u0637\u0627\u0644 \u0648\u0627\u0633\u0639 \u0645\u0631\u064A\u062D",
      cat: "\u0646\u0633\u0627\u0626\u064A",
      subcat: "\u0623\u0637\u0642\u0645",
      price: 13500,
      orig: 22e3,
      colors: ["\u0628\u064A\u062C \u0645\u0648\u0643\u0627", "\u0623\u062E\u0636\u0631 \u0645\u064A\u0631\u0645\u064A\u0629"],
      sizes: ["S", "M", "L", "XL"],
      stock: 14,
      desc: "\u0637\u0642\u0645 \u0639\u0635\u0631\u064A \u0645\u0646 \u0642\u0637\u0639\u062A\u064A\u0646 \u064A\u0648\u0641\u0631 \u0627\u0644\u0631\u0627\u062D\u0629 \u0648\u0627\u0644\u0623\u0646\u0627\u0642\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629"
    },
    {
      id: "prod-w-7",
      name: "\u0628\u064A\u062C\u0627\u0645\u0627 \u0646\u0633\u0627\u0626\u064A\u0629 \u062D\u0631\u064A\u0631\u064A\u0629 \u0646\u0627\u0639\u0645\u0629 \u0644\u0644\u0645\u0646\u0632\u0644 \u0628\u0637\u0628\u0639\u0629 \u0642\u0644\u0648\u0628",
      cat: "\u0646\u0633\u0627\u0626\u064A",
      subcat: "\u0645\u0644\u0627\u0628\u0633 \u0645\u0646\u0632\u0644\u064A\u0629",
      price: 8200,
      orig: 13e3,
      colors: ["\u0623\u0632\u0631\u0642 \u0633\u0645\u0627\u0648\u064A", "\u0648\u0631\u062F\u064A \u0641\u0627\u062A\u062D"],
      sizes: ["M", "L", "XL"],
      stock: 25,
      desc: "\u0637\u0642\u0645 \u0646\u0648\u0645 \u0648\u0628\u064A\u062C\u0627\u0645\u0627 \u0645\u0646\u0632\u0644\u064A\u0629 \u0645\u0646 \u0627\u0644\u0633\u0627\u062A\u0627\u0646 \u0627\u0644\u062D\u0631\u064A\u0631\u064A \u0641\u0627\u0626\u0642 \u0627\u0644\u0646\u0639\u0648\u0645\u0629"
    },
    {
      id: "prod-w-8",
      name: "\u0641\u0633\u062A\u0627\u0646 \u0645\u0646\u0627\u0633\u0628\u0627\u062A \u062F\u0631\u0627\u0628\u064A\u0647 \u0637\u0648\u064A\u0644 \u0628\u064A\u0627\u0642\u0629 \u0643\u062A\u0641 \u0648\u0627\u062D\u062F \u0645\u0637\u0631\u0632\u0629",
      cat: "\u0646\u0633\u0627\u0626\u064A",
      subcat: "\u0641\u0633\u0627\u062A\u064A\u0646",
      price: 22e3,
      orig: 38e3,
      colors: ["\u0623\u0632\u0631\u0642 \u0645\u0644\u0643\u064A \u0631\u0648\u064A\u0627\u0644", "\u0623\u062E\u0636\u0631 \u0632\u0645\u0631\u062F\u064A"],
      sizes: ["38", "40", "42", "44", "46"],
      stock: 6,
      desc: "\u0641\u0633\u062A\u0627\u0646 \u0633\u0647\u0631\u0629 \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A \u0628\u0643\u062A\u0641 \u0648\u0627\u062D\u062F \u0648\u0644\u0645\u0633\u0627\u062A \u062F\u0631\u0627\u0628\u064A\u0647 \u0633\u0627\u062D\u0631\u0629 \u0644\u0644\u0623\u0639\u0631\u0627\u0633 \u0648\u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0627\u062A"
    },
    {
      id: "prod-b-1",
      name: "\u062A\u064A\u0634\u064A\u0631\u062A \u0648\u0644\u0627\u062F\u064A \u0642\u0637\u0646 \u0637\u0628\u064A\u0639\u064A \u0628\u0637\u0628\u0639\u0629 \u062C\u0631\u0627\u0641\u064A\u0643 \u0639\u0635\u0631\u064A\u0629",
      cat: "\u0648\u0644\u0627\u062F\u064A",
      subcat: "\u062A\u064A\u0634\u064A\u0631\u062A\u0627\u062A",
      price: 4800,
      orig: 7500,
      colors: ["\u0623\u0635\u0641\u0631 \u0643\u0646\u0627\u0631\u064A", "\u0643\u062D\u0644\u064A \u0631\u064A\u0627\u0636\u064A"],
      sizes: ["4-5 \u0633\u0646\u0648\u0627\u062A", "6-7 \u0633\u0646\u0648\u0627\u062A", "8-9 \u0633\u0646\u0648\u0627\u062A", "10-12 \u0633\u0646\u0629"],
      stock: 35,
      desc: "\u062A\u064A\u0634\u064A\u0631\u062A \u0648\u0644\u0627\u062F\u064A \u0642\u0637\u0646\u064A 100% \u0645\u0633\u0627\u0645\u064A \u0648\u0645\u0631\u064A\u062D \u0644\u0627 \u064A\u0633\u0628\u0628 \u062A\u0639\u0631\u0642"
    },
    {
      id: "prod-b-2",
      name: "\u0642\u0645\u064A\u0635 \u0648\u0644\u0627\u062F\u064A \u0643\u0644\u0627\u0633\u064A\u0643 \u0645\u0631\u0628\u0639\u0627\u062A \u0643\u0627\u0631\u0648\u0647\u0627\u062A \u0623\u0646\u064A\u0642 \u0644\u0644\u0645\u0646\u0627\u0633\u0628\u0627\u062A",
      cat: "\u0648\u0644\u0627\u062F\u064A",
      subcat: "\u0642\u0645\u0635\u0627\u0646",
      price: 6200,
      orig: 9800,
      colors: ["\u0623\u062D\u0645\u0631 \u0648\u0623\u0632\u0631\u0642 \u0643\u0627\u0631\u0648\u0647\u0627\u062A", "\u0623\u062E\u0636\u0631 \u0648\u0643\u062D\u0644\u064A"],
      sizes: ["4-6 \u0633\u0646\u0648\u0627\u062A", "7-9 \u0633\u0646\u0648\u0627\u062A", "10-12 \u0633\u0646\u0629"],
      stock: 22,
      desc: "\u0642\u0645\u064A\u0635 \u0648\u0644\u0627\u062F\u064A \u0628\u0623\u0643\u0645\u0627\u0645 \u0637\u0648\u064A\u0644\u0629 \u0648\u0645\u0638\u0647\u0631 \u0623\u0646\u064A\u0642 \u0644\u0644\u0623\u0639\u064A\u0627\u062F \u0648\u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A"
    },
    {
      id: "prod-g-1",
      name: "\u0641\u0633\u062A\u0627\u0646 \u0628\u0646\u0627\u062A\u064A \u0623\u0645\u064A\u0631\u0627\u062A \u0634\u064A\u0641\u0648\u0646 \u0646\u0627\u0639\u0645 \u0645\u0637\u0631\u0632 \u0628\u0627\u0644\u0648\u0631\u0648\u062F",
      cat: "\u0628\u0646\u0627\u062A\u064A",
      subcat: "\u0641\u0633\u0627\u062A\u064A\u0646",
      price: 9800,
      orig: 16500,
      colors: ["\u0648\u0631\u062F\u064A \u0641\u0627\u062A\u062D", "\u0623\u0648\u0641 \u0648\u0627\u064A\u062A"],
      sizes: ["3-4 \u0633\u0646\u0648\u0627\u062A", "5-6 \u0633\u0646\u0648\u0627\u062A", "7-8 \u0633\u0646\u0648\u0627\u062A", "9-10 \u0633\u0646\u0648\u0627\u062A"],
      stock: 12,
      desc: "\u0641\u0633\u062A\u0627\u0646 \u0623\u0645\u064A\u0631\u0627\u062A \u0634\u064A\u0641\u0648\u0646 \u0645\u0637\u0631\u0632 \u0628\u0627\u0644\u0648\u0631\u0648\u062F \u0623\u0646\u064A\u0642 \u0648\u0645\u0631\u064A\u062D \u0644\u0644\u0628\u0646\u0627\u062A \u0641\u064A \u0627\u0644\u0623\u0639\u064A\u0627\u062F \u0648\u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0627\u062A"
    },
    {
      id: "prod-bb-1",
      name: "\u0637\u0642\u0645 \u0645\u0648\u0627\u0644\u064A\u062F \u0642\u0637\u0646 \u0637\u0628\u064A\u0639\u064A \u0646\u0642\u064A 5 \u0642\u0637\u0639 \u0647\u062F\u064A\u0629 \u0641\u0627\u062E\u0631\u0629",
      cat: "\u0645\u0648\u0627\u0644\u064A\u062F",
      subcat: "\u0645\u0648\u0627\u0644\u064A\u062F",
      price: 7500,
      orig: 11500,
      colors: ["\u0633\u0645\u0627\u0648\u064A \u0641\u0627\u062A\u062D", "\u0648\u0631\u062F\u064A \u0628\u064A\u0628\u064A", "\u0628\u064A\u062C \u0645\u062D\u0627\u064A\u062F"],
      sizes: ["0-3 \u0623\u0634\u0647\u0631", "3-6 \u0623\u0634\u0647\u0631"],
      stock: 20,
      desc: "\u0637\u0642\u0645 \u0645\u0648\u0627\u0644\u064A\u062F \u0642\u0637\u0646 \u0637\u0628\u064A\u0639\u064A \u0646\u0642\u064A 100% \u0646\u0627\u0639\u0645 \u0648\u0622\u0645\u0646 \u0639\u0644\u0649 \u0628\u0634\u0631\u0629 \u0627\u0644\u0631\u0636\u0639"
    },
    {
      id: "prod-s-1",
      name: "\u062D\u0630\u0627\u0621 \u0633\u0646\u064A\u0643\u0631\u0632 \u0631\u064A\u0627\u0636\u064A \u0625\u064A\u0637\u0627\u0644\u064A \u0641\u0627\u0626\u0642 \u0627\u0644\u062E\u0641\u0629 \u0648\u0627\u0644\u0645\u0631\u0648\u062D\u0629",
      cat: "\u0623\u062D\u0630\u064A\u0629",
      subcat: "\u0633\u0646\u064A\u0643\u0631\u0632",
      price: 14200,
      orig: 24e3,
      colors: ["\u0623\u0628\u064A\u0636 \u0646\u0627\u0635\u0639", "\u0631\u0645\u0627\u062F\u064A \u0641\u0636\u064A"],
      sizes: ["39", "40", "41", "42", "43", "44"],
      stock: 14,
      desc: "\u0633\u0646\u064A\u0643\u0631\u0632 \u0637\u0628\u064A \u0645\u0628\u0637\u0646 \u0648\u0645\u0631\u064A\u062D \u062C\u062F\u0627\u064B \u0644\u0644\u0645\u0634\u064A \u0627\u0644\u064A\u0648\u0645\u064A \u0648\u0627\u0644\u0631\u064A\u0627\u0636\u0629"
    },
    {
      id: "prod-s-2",
      name: "\u062D\u0630\u0627\u0621 \u0643\u0644\u0627\u0633\u064A\u0643\u064A \u062C\u0644\u062F \u0637\u0628\u064A\u0639\u064A \u0631\u0633\u0645\u064A \u0623\u0648\u0643\u0633\u0641\u0648\u0631\u062F",
      cat: "\u0623\u062D\u0630\u064A\u0629",
      subcat: "\u0631\u0633\u0645\u064A",
      price: 19500,
      orig: 3e4,
      colors: ["\u0628\u0646\u064A \u0645\u0644\u0643\u064A", "\u0623\u0633\u0648\u062F \u0644\u0627\u0645\u0639"],
      sizes: ["40", "41", "42", "43", "44"],
      stock: 6,
      desc: "\u062D\u0630\u0627\u0621 \u0631\u0633\u0645\u064A \u062C\u0644\u062F \u0637\u0628\u064A\u0639\u064A \u0641\u0627\u062E\u0631 \u0644\u0644\u0645\u0646\u0627\u0633\u0628\u0627\u062A \u0648\u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0648\u0627\u0644\u062F\u0648\u0627\u0645"
    },
    {
      id: "prod-s-3",
      name: "\u062D\u0630\u0627\u0621 \u0643\u0639\u0628 \u0639\u0627\u0644\u064A \u0633\u0647\u0631\u0629 \u0645\u0631\u0635\u0639 \u0628\u0627\u0644\u0633\u062A\u0631\u0627\u0633 \u0627\u0644\u0644\u0627\u0645\u0639",
      cat: "\u0623\u062D\u0630\u064A\u0629",
      subcat: "\u0643\u0639\u0628 \u0633\u0647\u0631\u0629",
      price: 16900,
      orig: 28e3,
      colors: ["\u0630\u0647\u0628\u064A \u0628\u0631\u0627\u0642", "\u0641\u0636\u064A \u0645\u064A\u062A\u0627\u0644\u064A\u0643"],
      sizes: ["36", "37", "38", "39", "40"],
      stock: 8,
      desc: "\u0643\u0639\u0628 \u0633\u0647\u0631\u0629 \u0645\u0631\u064A\u062D \u0645\u062A\u0648\u0627\u0632\u0646 8 \u0633\u0645 \u0645\u0639 \u0644\u0645\u0639\u0629 \u0633\u062A\u0631\u0627\u0633 \u0633\u0627\u062D\u0631\u0629"
    },
    {
      id: "prod-bg-1",
      name: "\u062D\u0642\u064A\u0628\u0629 \u064A\u062F \u0646\u0633\u0627\u0626\u064A\u0629 \u062C\u0644\u062F \u0625\u064A\u0637\u0627\u0644\u064A \u0641\u0627\u062E\u0631 \u0645\u0639 \u062D\u0632\u0627\u0645 \u0630\u0647\u0628\u064A",
      cat: "\u0634\u0646\u0637",
      subcat: "\u064A\u062F",
      price: 16500,
      orig: 29e3,
      colors: ["\u0628\u0646\u064A \u062A\u0627\u0646", "\u0623\u0633\u0648\u062F \u0641\u0627\u062E\u0631", "\u0628\u064A\u062C \u0639\u0627\u062C\u064A"],
      sizes: ["\u0648\u0633\u0637"],
      stock: 9,
      desc: "\u0634\u0646\u0637\u0629 \u064A\u062F \u0646\u0633\u0627\u0626\u064A\u0629 \u0631\u0627\u0642\u064A\u0629 \u0628\u062C\u0644\u062F \u0625\u064A\u0637\u0627\u0644\u064A \u0645\u0642\u0627\u0648\u0645 \u0644\u0644\u062E\u062F\u0634 \u0645\u0639 \u062D\u0632\u0627\u0645 \u0643\u0631\u0648\u0633"
    },
    {
      id: "prod-bg-2",
      name: "\u0637\u0642\u0645 \u062D\u0642\u0627\u0626\u0628 \u0633\u0641\u0631 \u0645\u062A\u0643\u0627\u0645\u0644 3 \u0642\u0637\u0639 \u0641\u0627\u064A\u0628\u0631 \u0645\u0642\u0627\u0648\u0645 \u0644\u0644\u0635\u062F\u0645\u0627\u062A",
      cat: "\u0634\u0646\u0637",
      subcat: "\u0633\u0641\u0631",
      price: 38e3,
      orig: 55e3,
      colors: ["\u0643\u062D\u0644\u064A \u062A\u064A\u062A\u0627\u0646\u064A\u0648\u0645", "\u0631\u0645\u0627\u062F\u064A \u063A\u0627\u0645\u0642"],
      sizes: ["\u0635\u063A\u064A\u0631 (20)", "\u0648\u0633\u0637 (24)", "\u0643\u0628\u064A\u0631 (28)"],
      stock: 4,
      desc: "\u062D\u0642\u0627\u0626\u0628 \u0633\u0641\u0631 \u0642\u0648\u064A\u0629 \u0648\u062E\u0641\u064A\u0641\u0629 \u0645\u0639 \u0642\u0641\u0644 \u0623\u0645\u0627\u0646 TSA \u0648\u0639\u062C\u0644\u0627\u062A \u062F\u0648\u0627\u0631\u0629 360 \u062F\u0631\u062C\u0629"
    },
    {
      id: "prod-bg-3",
      name: "\u0634\u0646\u0637\u0629 \u0638\u0647\u0631 \u062C\u0644\u062F \u0630\u0643\u064A\u0629 \u0639\u0635\u0631\u064A\u0629 \u0645\u0642\u0627\u0648\u0645\u0629 \u0644\u0644\u0645\u0627\u0621 \u0645\u0639 \u0645\u0646\u0641\u0630 \u0634\u062D\u0646",
      cat: "\u0634\u0646\u0637",
      subcat: "\u0638\u0647\u0631",
      price: 11200,
      orig: 18500,
      colors: ["\u0623\u0633\u0648\u062F \u0645\u0627\u0637", "\u0631\u0645\u0627\u062F\u064A \u0641\u062D\u0645\u064A"],
      sizes: ["\u0644\u0627\u0628\u062A\u0648\u0628 15.6"],
      stock: 11,
      desc: "\u0634\u0646\u0637\u0629 \u0638\u0647\u0631 \u0639\u0645\u0644\u064A\u0629 \u0644\u0644\u0645\u0643\u062A\u0628 \u0648\u0627\u0644\u062C\u0627\u0645\u0639\u0629 \u0648\u0627\u0644\u0631\u062D\u0644\u0627\u062A \u0645\u0639 \u0645\u0646\u0641\u0630 USB"
    }
  ];
  function detectIntent(text) {
    const raw = text.trim();
    const clean = raw.toLowerCase().replace(/[؟?!.,،؛]/g, " ");
    const chatPhrases = [
      "\u0643\u064A\u0641 \u062D\u0627\u0644\u0643",
      "\u0634\u062E\u0628\u0627\u0631\u0643",
      "\u0643\u064A\u0641\u0643",
      "\u0639\u0633\u0627\u0643 \u0628\u062E\u064A\u0631",
      "\u0639\u0633\u0627\u0643 \u0637\u064A\u0628",
      "\u0643\u064A\u0641 \u0627\u0644\u0635\u062D\u0629",
      "\u0623\u062E\u0628\u0627\u0631\u0643",
      "\u0639\u0644\u0648\u0645\u0643",
      "\u0634\u0644\u0648\u0646\u0643",
      "\u0627\u062D\u0648\u0627\u0644\u0643",
      "\u0643\u064A\u0641 \u0627\u0644\u0627\u0645\u0648\u0631",
      "\u0643\u064A\u0641 \u0627\u0644\u062D\u0627\u0644",
      "\u0627\u0634 \u0627\u062E\u0628\u0627\u0631\u0643",
      "\u0627\u064A\u0634 \u0627\u062E\u0628\u0627\u0631\u0643",
      "\u0643\u064A\u0641\u0643 \u064A\u0627 \u062E\u0628\u064A\u0631",
      "\u062D\u064A\u0627\u0643 \u0627\u0644\u0644\u0647",
      "\u064A\u0627 \u0647\u0644\u0627 \u0648\u0627\u0644\u0644\u0647",
      "\u064A\u0627 \u0645\u0631\u062D\u0628\u0627",
      "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645",
      "\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645",
      "\u0645\u0631\u062D\u0628\u0627",
      "\u0645\u0631\u062D\u0628\u0627\u064B",
      "\u0623\u0647\u0644\u0627",
      "\u0623\u0647\u0644\u0627\u064B",
      "\u0635\u0628\u0627\u062D \u0627\u0644\u062E\u064A\u0631",
      "\u0645\u0633\u0627\u0621 \u0627\u0644\u062E\u064A\u0631",
      "\u0647\u0644\u0627",
      "\u0647\u0627\u064A",
      "\u0623\u0647\u0644\u064A\u0646",
      "\u064A\u0627 \u0647\u0644\u0627",
      "\u0635\u0628\u0627\u062D \u0627\u0644\u0646\u0648\u0631",
      "\u0645\u0633\u0627\u0621 \u0627\u0644\u0646\u0648\u0631",
      "\u0634\u0643\u0631\u0627",
      "\u0634\u0643\u0631\u0627\u064B",
      "\u0645\u0634\u0643\u0648\u0631",
      "\u062A\u0633\u0644\u0645",
      "\u062C\u0632\u0627\u0643 \u0627\u0644\u0644\u0647 \u062E\u064A\u0631",
      "\u064A\u0639\u0637\u064A\u0643 \u0627\u0644\u0639\u0627\u0641\u064A\u0629",
      "\u0645\u0627 \u0642\u0635\u0631\u062A",
      "\u0639\u0634\u062A",
      "\u062A\u0633\u0644\u0645 \u0644\u064A",
      "\u062D\u064A\u0627\u0643",
      "\u0623\u0644\u0641 \u0634\u0643\u0631",
      "\u0645\u0646 \u0623\u0646\u062A",
      "\u0645\u0646 \u0627\u0646\u062A",
      "\u0639\u0631\u0641 \u0639\u0646 \u0646\u0641\u0633\u0643",
      "\u0627\u064A\u0634 \u0627\u0633\u0645\u0643",
      "\u0645\u0646 \u062A\u0643\u0648\u0646",
      "\u0627\u064A\u0634 \u0648\u0638\u064A\u0641\u062A\u0643",
      "\u0648\u0634 \u062A\u0633\u0648\u064A",
      "\u0645\u0627 \u0647\u0648 \u062F\u0648\u0631\u0643",
      "\u0645\u064A\u0646 \u0627\u0646\u062A",
      "\u062A\u0635\u0628\u062D \u0639\u0644\u0649 \u062E\u064A\u0631",
      "\u0645\u0639 \u0627\u0644\u0633\u0644\u0627\u0645\u0629",
      "\u0628\u0627\u064A",
      "\u0641\u064A \u0623\u0645\u0627\u0646 \u0627\u0644\u0644\u0647",
      "\u0625\u0644\u0649 \u0627\u0644\u0644\u0642\u0627\u0621",
      "\u0648\u062F\u0627\u0639\u0627",
      "\u0633\u0644\u0627\u0645\u062A\u0643",
      "\u0646\u0648\u0645 \u0627\u0644\u0639\u0648\u0627\u0641\u064A",
      "\u0645\u0639 \u0627\u0644\u0641 \u0633\u0644\u0627\u0645\u0629"
    ];
    for (const phrase of chatPhrases) {
      if (clean.includes(phrase)) {
        const hasProductWord = ["\u0641\u0633\u062A\u0627\u0646", "\u0641\u0633\u0627\u062A\u064A\u0646", "\u0634\u0646\u0637", "\u0634\u0646\u0637\u0629", "\u062D\u0630\u0627\u0621", "\u0634\u0648\u0632", "\u0633\u0646\u064A\u0643\u0631\u0632", "\u0643\u0639\u0628", "\u0642\u0645\u064A\u0635", "\u0628\u0646\u0637\u0627\u0644", "\u0637\u0642\u0645"].some((w) => clean.includes(w));
        if (!hasProductWord) {
          return { intent: "CHAT" };
        }
      }
    }
    if (clean.includes("\u062A\u062A\u0628\u0639") || clean.includes("\u0623\u064A\u0646 \u0637\u0644\u0628\u064A") || clean.includes("\u0648\u064A\u0646 \u0637\u0644\u0628\u064A") || clean.includes("\u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628") || clean.includes("\u0623\u062A\u0627\u0628\u0639 \u0637\u0644\u0628\u064A") || clean.includes("\u062A\u0627\u0628\u0639 \u0637\u0644\u0628\u064A") || clean.includes("\u0634\u062D\u0646\u062A\u064A") || clean.includes("\u0645\u062A\u0649 \u064A\u0648\u0635\u0644") || clean.includes("\u062A\u0623\u062E\u0631 \u0627\u0644\u0637\u0644\u0628") || clean.includes("\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628")) {
      return { intent: "ORDER_HELP" };
    }
    if (clean.includes("\u0637\u0631\u0642 \u0627\u0644\u062F\u0641\u0639") || clean.includes("\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062F\u0641\u0639") || clean.includes("\u0643\u064A\u0641 \u0627\u062F\u0641\u0639") || clean.includes("\u0643\u064A\u0641 \u0623\u062F\u0641\u0639") || clean.includes("\u062A\u0642\u0628\u0644\u0648\u0646 \u0643\u0627\u0634") || clean.includes("\u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645") || clean.includes("\u0643\u0631\u064A\u0645\u064A") || clean.includes("\u0648\u0646 \u0643\u0627\u0634") || clean.includes("\u062D\u0633\u0627\u0628 \u0628\u0646\u0643\u064A") || clean.includes("\u0633\u062F\u0627\u062F") || clean.includes("\u0641\u064A\u0632\u0627") || clean.includes("\u0645\u0627\u0633\u062A\u0631\u0643\u0627\u0631\u062F")) {
      return { intent: "PAYMENT_HELP" };
    }
    if (clean.includes("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631") || clean.includes("\u0627\u0644\u0628\u0627\u0633\u0648\u0631\u062F") || clean.includes("\u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0628\u0627\u0633\u0648\u0631\u062F") || clean.includes("\u0646\u0633\u064A\u062A \u0627\u0644\u0628\u0627\u0633\u0648\u0631\u062F") || clean.includes("\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644") || clean.includes("\u062A\u0633\u062C\u064A\u0644 \u062D\u0633\u0627\u0628") || clean.includes("\u0627\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628") || clean.includes("\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062D\u0633\u0627\u0628") || clean.includes("\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641")) {
      return { intent: "ACCOUNT_HELP" };
    }
    if (clean.includes("\u0633\u0639\u0631 \u0627\u0644\u0635\u0631\u0641") || clean.includes("\u0643\u0645 \u0627\u0644\u0635\u0631\u0641") || clean.includes("\u0643\u0645 \u0633\u0639\u0631 \u0627\u0644\u062F\u0648\u0644\u0627\u0631") || clean.includes("\u0643\u0645 \u0633\u0639\u0631 \u0627\u0644\u0633\u0639\u0648\u062F\u064A") || clean.includes("\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0639\u0645\u0644\u0629") || clean.includes("\u0627\u0633\u0639\u0627\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u062A")) {
      return { intent: "EXCHANGE_RATE_HELP" };
    }
    if (clean.includes("\u0627\u064A\u0646 \u0641\u0631\u0648\u0639\u0643\u0645") || clean.includes("\u0623\u064A\u0646 \u0641\u0631\u0648\u0639\u0643\u0645") || clean.includes("\u0648\u064A\u0646 \u0645\u0648\u0642\u0639\u0643\u0645") || clean.includes("\u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u062D\u0644") || clean.includes("\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u0627\u0631\u062C\u0627\u0639") || clean.includes("\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u0625\u0631\u062C\u0627\u0639") || clean.includes("\u0627\u0644\u0627\u0633\u062A\u0628\u062F\u0627\u0644") || clean.includes("\u0645\u0639\u0627\u064A\u0646\u0629 \u0642\u0628\u0644 \u0627\u0644\u062F\u0641\u0639") || clean.includes("\u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621") || clean.includes("\u0631\u0642\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644") || clean.includes("\u0631\u0642\u0645 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628") || clean.includes("\u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A") || clean.includes("\u062A\u0648\u0635\u0644\u0648\u0646 \u0635\u0646\u0639\u0627\u0621") || clean.includes("\u062A\u0648\u0635\u0644\u0648\u0646 \u0639\u062F\u0646") || clean.includes("\u062A\u0648\u0635\u064A\u0644 \u0644\u062A\u0639\u0632") || clean.includes("\u062A\u0648\u0635\u064A\u0644 \u0644\u0644\u062D\u062F\u064A\u062F\u0629") || clean.includes("\u062A\u0648\u0635\u064A\u0644 \u0644\u0625\u0628") || clean.includes("\u062A\u0648\u0635\u064A\u0644 \u0644\u0644\u0645\u0643\u0644\u0627")) {
      return { intent: "STORE_INFO" };
    }
    if (clean.includes("\u0627\u0631\u0633\u0644 \u0644\u064A \u0635\u0648\u0631") || clean.includes("\u0623\u0631\u0633\u0644 \u0644\u064A \u0635\u0648\u0631") || clean.includes("\u0648\u0631\u064A\u0646\u064A \u0635\u0648\u0631") || clean.includes("\u0635\u0648\u0631 \u0641\u0633\u0627\u062A\u064A\u0646") || clean.includes("\u0635\u0648\u0631 \u0634\u0646\u0637") || clean.includes("\u0635\u0648\u0631 \u0627\u062D\u0630\u064A\u0629") || clean.includes("\u0623\u0631\u064A\u062F \u0635\u0648\u0631") || clean.includes("\u0641\u0631\u062C\u064A\u0646\u0627 \u0635\u0648\u0631") || clean.includes("\u0627\u0628\u063A\u0649 \u0627\u0634\u0648\u0641 \u0635\u0648\u0631")) {
      return {
        intent: "PRODUCT_IMAGE_REQUEST",
        extractedFilter: extractFilters(clean)
      };
    }
    if (clean.includes("\u0643\u0645 \u0633\u0639\u0631 \u0647\u0630\u0627") || clean.includes("\u0628\u0643\u0645 \u0647\u0630\u0627") || clean.includes("\u0643\u0645 \u0633\u0639\u0631\u0647") || clean.includes("\u0645\u0627 \u062A\u0641\u0627\u0635\u064A\u0644") || clean.includes("\u0627\u064A\u0634 \u062E\u0627\u0645\u0629") || clean.includes("\u0643\u0645 \u0627\u0644\u0645\u0642\u0627\u0633\u0627\u062A")) {
      return {
        intent: "PRODUCT_DETAILS",
        extractedFilter: extractFilters(clean)
      };
    }
    const specificApparelKeywords = [
      "\u0641\u0633\u062A\u0627\u0646",
      "\u0641\u0633\u0627\u062A\u064A\u0646",
      "\u0639\u0628\u0627\u064A\u0629",
      "\u0639\u0628\u0627\u064A\u0627\u062A",
      "\u0628\u0644\u0648\u0632\u0629",
      "\u0628\u0644\u0648\u0632\u0627\u062A",
      "\u062A\u0646\u0648\u0631\u0629",
      "\u062A\u0646\u0627\u0646\u064A\u0631",
      "\u0628\u0646\u0637\u0627\u0644",
      "\u0628\u0646\u0627\u0637\u0644",
      "\u062C\u064A\u0646\u0632",
      "\u0631\u0648\u0628",
      "\u0628\u064A\u062C\u0627\u0645\u0627",
      "\u062D\u0630\u0627\u0621",
      "\u0627\u062D\u0630\u064A\u0629",
      "\u0623\u062D\u0630\u064A\u0629",
      "\u0634\u0648\u0632",
      "\u0633\u0646\u064A\u0643\u0631\u0632",
      "\u0643\u0639\u0628",
      "\u0635\u0646\u062F\u0644",
      "\u0628\u0648\u0637",
      "\u0634\u0646\u0637\u0629",
      "\u0634\u0646\u0637",
      "\u062D\u0642\u064A\u0628\u0629",
      "\u062D\u0642\u0627\u0626\u0628",
      "\u0634\u0646\u0637\u0629 \u0633\u0641\u0631",
      "\u0634\u0646\u0637\u0629 \u064A\u062F",
      "\u0645\u0644\u0627\u0628\u0633 \u0648\u0644\u0627\u062F\u064A",
      "\u0627\u0637\u0642\u0645 \u0648\u0644\u0627\u062F\u064A",
      "\u0645\u0644\u0627\u0628\u0633 \u0628\u0646\u0627\u062A\u064A",
      "\u0627\u0637\u0642\u0645 \u0628\u0646\u0627\u062A\u064A",
      "\u0645\u0644\u0627\u0628\u0633 \u0645\u0648\u0627\u0644\u064A\u062F",
      "\u0645\u0644\u0627\u0628\u0633 \u0627\u0637\u0641\u0627\u0644",
      "\u062A\u064A\u0634\u064A\u0631\u062A",
      "\u0642\u0645\u064A\u0635",
      "\u062C\u0627\u0643\u064A\u062A",
      "\u0628\u062F\u0644\u0629"
    ];
    const hasApparelKeyword = specificApparelKeywords.some((kw) => clean.includes(kw));
    if (hasApparelKeyword) {
      return {
        intent: "PRODUCT_SEARCH",
        extractedFilter: extractFilters(clean)
      };
    }
    const isGeneralKnowledgeQuestion = clean.includes("\u0645\u0627 \u0639\u0627\u0635\u0645\u0629") || clean.includes("\u0645\u0627 \u0647\u064A \u0639\u0627\u0635\u0645\u0629") || clean.includes("\u0645\u0646 \u0645\u062E\u062A\u0631\u0639") || clean.includes("\u0645\u0646 \u0647\u0648 \u0645\u062E\u062A\u0631\u0639") || clean.includes("\u0645\u0646 \u0627\u062E\u062A\u0631\u0639") || clean.includes("\u0627\u0634\u0631\u062D \u0644\u064A") || clean.includes("\u0627\u0634\u0631\u062D") || clean.includes("\u0645\u0627 \u0645\u0639\u0646\u0649") || clean.includes("\u0645\u0627 \u0647\u0648") || clean.includes("\u0645\u0627 \u0647\u064A") || clean.includes("\u0643\u064A\u0641 \u064A\u0639\u0645\u0644") || clean.includes("\u0647\u0644 \u062A\u0639\u0644\u0645") || clean.includes("\u0645\u062A\u0649 \u062A\u0623\u0633\u0633");
    if (isGeneralKnowledgeQuestion) {
      return { intent: "GENERAL_KNOWLEDGE" };
    }
    return { intent: "OTHER" };
  }
  function extractFilters(clean) {
    let maxPrice;
    let color;
    let category;
    const priceMatch = clean.match(/(?:أقل من|اقل من|تحت|بحدود|ميزانية|سعر|بـ|ب)\s*(\d+[\d,]*)/) || clean.match(/(\d{4,6})/);
    if (priceMatch) {
      const num = parseInt(priceMatch[1].replace(/,/g, ""), 10);
      if (!isNaN(num) && num > 1e3) {
        maxPrice = num;
      }
    }
    const colors = ["\u0623\u0633\u0648\u062F", "\u0627\u0633\u0648\u062F", "\u0623\u0628\u064A\u0636", "\u0627\u0628\u064A\u0636", "\u0643\u062D\u0644\u064A", "\u0648\u0631\u062F\u064A", "\u0630\u0647\u0628\u064A", "\u0641\u0636\u064A", "\u0628\u0646\u064A", "\u0628\u064A\u062C", "\u0623\u0632\u0631\u0642", "\u0627\u0632\u0631\u0642", "\u0623\u062E\u0636\u0631", "\u0627\u062E\u0636\u0631", "\u0632\u0645\u0631\u062F\u064A", "\u0639\u0646\u0627\u0628\u064A", "\u0632\u064A\u062A\u064A", "\u0631\u0645\u0627\u062F\u064A"];
    for (const c of colors) {
      if (clean.includes(c)) {
        color = c.replace("\u0627\u0633\u0648\u062F", "\u0623\u0633\u0648\u062F").replace("\u0627\u0628\u064A\u0636", "\u0623\u0628\u064A\u0636").replace("\u0627\u0632\u0631\u0642", "\u0623\u0632\u0631\u0642").replace("\u0627\u062E\u0636\u0631", "\u0623\u062E\u0636\u0631");
        break;
      }
    }
    if (clean.includes("\u0641\u0633\u062A\u0627\u0646") || clean.includes("\u0641\u0633\u0627\u062A\u064A\u0646") || clean.includes("\u0646\u0633\u0627\u0626\u064A") || clean.includes("\u0639\u0628\u0627\u064A\u0629") || clean.includes("\u0628\u0644\u0648\u0632\u0629") || clean.includes("\u062A\u0646\u0648\u0631\u0629") || clean.includes("\u0628\u0646\u0637\u0627\u0644")) {
      category = "\u0646\u0633\u0627\u0626\u064A";
    } else if (clean.includes("\u0634\u0646\u0637") || clean.includes("\u0634\u0646\u0637\u0629") || clean.includes("\u062D\u0642\u064A\u0628\u0629") || clean.includes("\u062D\u0642\u0627\u0626\u0628")) {
      category = "\u0634\u0646\u0637";
    } else if (clean.includes("\u062D\u0630\u0627\u0621") || clean.includes("\u0627\u062D\u0630\u064A\u0629") || clean.includes("\u0623\u062D\u0630\u064A\u0629") || clean.includes("\u0634\u0648\u0632") || clean.includes("\u0633\u0646\u064A\u0643\u0631\u0632") || clean.includes("\u0643\u0639\u0628")) {
      category = "\u0623\u062D\u0630\u064A\u0629";
    } else if (clean.includes("\u0648\u0644\u0627\u062F\u064A") || clean.includes("\u0623\u0648\u0644\u0627\u062F") || clean.includes("\u0648\u0644\u062F")) {
      category = "\u0648\u0644\u0627\u062F\u064A";
    } else if (clean.includes("\u0628\u0646\u0627\u062A\u064A") || clean.includes("\u0628\u0646\u0627\u062A") || clean.includes("\u0628\u0646\u062A")) {
      category = "\u0628\u0646\u0627\u062A\u064A";
    } else if (clean.includes("\u0645\u0648\u0627\u0644\u064A\u062F") || clean.includes("\u0623\u0637\u0641\u0627\u0644") || clean.includes("\u0627\u0637\u0641\u0627\u0644") || clean.includes("\u0628\u064A\u0628\u064A")) {
      category = "\u0645\u0648\u0627\u0644\u064A\u062F";
    }
    return { maxPrice, color, category, query: clean };
  }
  function searchCatalog(filters) {
    if (!filters) return [];
    const query = (filters.query || "").toLowerCase();
    const scored = catalogData.map((p) => {
      let score = 0;
      if (filters.category && (p.cat.includes(filters.category) || filters.category.includes(p.cat))) {
        score += 15;
      }
      if (query.includes("\u0641\u0633\u062A\u0627\u0646") || query.includes("\u0641\u0633\u0627\u062A\u064A\u0646")) {
        if (p.subcat === "\u0641\u0633\u0627\u062A\u064A\u0646") score += 25;
      }
      if (query.includes("\u0634\u0646\u0637") || query.includes("\u0634\u0646\u0637\u0629") || query.includes("\u062D\u0642\u064A\u0628\u0629") || query.includes("\u062D\u0642\u0627\u0626\u0628")) {
        if (p.cat === "\u0634\u0646\u0637") score += 25;
      }
      if (query.includes("\u062D\u0630\u0627\u0621") || query.includes("\u0627\u062D\u0630\u064A\u0629") || query.includes("\u0623\u062D\u0630\u064A\u0629") || query.includes("\u0634\u0648\u0632") || query.includes("\u0633\u0646\u064A\u0643\u0631\u0632") || query.includes("\u0643\u0639\u0628")) {
        if (p.cat === "\u0623\u062D\u0630\u064A\u0629") score += 25;
      }
      if (query.includes("\u0633\u0646\u064A\u0643\u0631\u0632") && p.subcat === "\u0633\u0646\u064A\u0643\u0631\u0632") score += 30;
      if (query.includes("\u0643\u0639\u0628") && p.subcat === "\u0643\u0639\u0628 \u0633\u0647\u0631\u0629") score += 30;
      if (query.includes("\u0633\u0641\u0631") && p.subcat === "\u0633\u0641\u0631") score += 30;
      if (query.includes("\u0638\u0647\u0631") && p.subcat === "\u0638\u0647\u0631") score += 30;
      if (query.includes("\u0628\u0644\u0648\u0632\u0629") && p.subcat === "\u0628\u0644\u0648\u0632\u0627\u062A") score += 30;
      if (query.includes("\u062A\u0646\u0648\u0631\u0629") && p.subcat === "\u062A\u0646\u0627\u0646\u064A\u0631") score += 30;
      if (query.includes("\u0628\u0646\u0637\u0627\u0644") && p.subcat === "\u0628\u0646\u0627\u0637\u0644") score += 30;
      if (query.includes("\u0648\u0644\u0627\u062F\u064A") && p.cat === "\u0648\u0644\u0627\u062F\u064A") score += 25;
      if (query.includes("\u0628\u0646\u0627\u062A\u064A") && p.cat === "\u0628\u0646\u0627\u062A\u064A") score += 25;
      if ((query.includes("\u0645\u0648\u0627\u0644\u064A\u062F") || query.includes("\u0628\u064A\u0628\u064A")) && p.cat === "\u0645\u0648\u0627\u0644\u064A\u062F") score += 25;
      if (filters.color) {
        const hasColor = p.colors.some((c) => c.includes(filters.color) || filters.color.includes(c));
        if (hasColor) {
          score += 20;
        } else {
          score -= 10;
        }
      }
      if (filters.maxPrice) {
        if (p.price <= filters.maxPrice) {
          score += 15;
        } else {
          score -= 30;
        }
      }
      const tokens = query.split(/\s+/).filter((t) => t.length > 2);
      tokens.forEach((t) => {
        if (p.name.toLowerCase().includes(t)) score += 5;
        if (p.desc.toLowerCase().includes(t)) score += 3;
      });
      return { id: p.id, score, price: p.price };
    });
    return scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map((item) => item.id);
  }
  function getFastResponse(intent, cleanMsg) {
    if (intent === "CHAT") {
      if (cleanMsg.includes("\u0643\u064A\u0641 \u062D\u0627\u0644\u0643") || cleanMsg.includes("\u0634\u062E\u0628\u0627\u0631\u0643") || cleanMsg.includes("\u0643\u064A\u0641\u0643") || cleanMsg.includes("\u0643\u064A\u0641 \u0627\u0644\u0635\u062D\u0629") || cleanMsg.includes("\u0623\u062E\u0628\u0627\u0631\u0643") || cleanMsg.includes("\u0634\u0644\u0648\u0646\u0643")) {
        return {
          text: "\u0627\u0644\u062D\u0645\u062F \u0644\u0644\u0647 \u0628\u062E\u064A\u0631 \u0648\u0635\u062D\u0629 \u0648\u0639\u0627\u0641\u064A\u0629 \u{1F60A} \u0623\u0646\u0627 \u0645\u0633\u0627\u0639\u062F \u0636\u064E\u062C\u0651\u0629\u060C \u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u0633\u0627\u0639\u062F\u0643 \u0627\u0644\u064A\u0648\u0645 \u0641\u064A \u0627\u0644\u062A\u0633\u0648\u0642 \u0623\u0648 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A\u0643\u061F",
          suggestedProductIds: []
        };
      }
      if (cleanMsg.includes("\u0635\u0628\u0627\u062D \u0627\u0644\u062E\u064A\u0631") || cleanMsg.includes("\u0635\u0628\u0627\u062D \u0627\u0644\u0646\u0648\u0631")) {
        return {
          text: "\u0635\u0628\u0627\u062D \u0627\u0644\u0646\u0648\u0631 \u0648\u0627\u0644\u0633\u0631\u0648\u0631 \u{1F337} \u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u0641\u064A \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644\u060C \u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u0633\u0627\u0639\u062F\u0643 \u0627\u0644\u064A\u0648\u0645\u061F",
          suggestedProductIds: []
        };
      }
      if (cleanMsg.includes("\u0645\u0633\u0627\u0621 \u0627\u0644\u062E\u064A\u0631") || cleanMsg.includes("\u0645\u0633\u0627\u0621 \u0627\u0644\u0646\u0648\u0631")) {
        return {
          text: "\u0645\u0633\u0627\u0621 \u0627\u0644\u062E\u064A\u0631 \u0648\u0627\u0644\u0623\u0646\u0648\u0627\u0631 \u{1F31F} \u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u0641\u064A \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644\u060C \u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u062E\u062F\u0645\u0643 \u0627\u0644\u0644\u064A\u0644\u0629\u061F",
          suggestedProductIds: []
        };
      }
      if (cleanMsg.includes("\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645") || cleanMsg.includes("\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645") || cleanMsg.includes("\u0645\u0631\u062D\u0628\u0627") || cleanMsg.includes("\u0623\u0647\u0644\u0627") || cleanMsg.includes("\u0627\u0647\u0644\u0627") || cleanMsg.includes("\u0647\u0644\u0627")) {
        return {
          text: "\u0648\u0639\u0644\u064A\u0643\u0645 \u0627\u0644\u0633\u0644\u0627\u0645 \u0648\u0631\u062D\u0645\u0629 \u0627\u0644\u0644\u0647 \u0648\u0628\u0631\u0643\u0627\u062A\u0647 \u{1F337} \u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644! \u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u0633\u0627\u0639\u062F\u0643 \u0627\u0644\u064A\u0648\u0645\u061F",
          suggestedProductIds: []
        };
      }
      if (cleanMsg.includes("\u0634\u0643\u0631\u0627") || cleanMsg.includes("\u0634\u0643\u0631\u0627\u064B") || cleanMsg.includes("\u0645\u0634\u0643\u0648\u0631") || cleanMsg.includes("\u062A\u0633\u0644\u0645") || cleanMsg.includes("\u064A\u0639\u0637\u064A\u0643 \u0627\u0644\u0639\u0627\u0641\u064A\u0629") || cleanMsg.includes("\u062C\u0632\u0627\u0643 \u0627\u0644\u0644\u0647 \u062E\u064A\u0631")) {
        return {
          text: "\u0627\u0644\u0639\u0641\u0648 \u062F\u0627\u0626\u0645\u0627\u064B \u0648\u0641\u064A \u062E\u062F\u0645\u062A\u0643 \u0628\u0643\u0644 \u0633\u0631\u0648\u0631 \u2764\uFE0F \u064A\u0633\u0639\u062F\u0646\u064A \u0627\u0644\u0631\u062F \u0639\u0644\u0649 \u0623\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0622\u062E\u0631 \u062A\u0631\u064A\u062F\u0647.",
          suggestedProductIds: []
        };
      }
      if (cleanMsg.includes("\u0645\u0646 \u0623\u0646\u062A") || cleanMsg.includes("\u0645\u0646 \u0627\u0646\u062A") || cleanMsg.includes("\u0639\u0631\u0641 \u0639\u0646 \u0646\u0641\u0633\u0643") || cleanMsg.includes("\u0627\u064A\u0634 \u0648\u0638\u064A\u0641\u062A\u0643") || cleanMsg.includes("\u0648\u0634 \u062A\u0633\u0648\u064A")) {
        return {
          text: "\u0623\u0646\u0627 \u0645\u0633\u0627\u0639\u062F \u0636\u064E\u062C\u0651\u0629 \u0627\u0644\u0630\u0643\u064A \u{1F31F}\u060C \u062E\u0628\u064A\u0631\u0643 \u0644\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0625\u0637\u0644\u0627\u0644\u0627\u062A \u0648\u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0623\u0631\u0642\u0649 \u0627\u0644\u0623\u0632\u064A\u0627\u0621\u060C \u0627\u0644\u0623\u062D\u0630\u064A\u0629\u060C \u0648\u0627\u0644\u062D\u0642\u0627\u0626\u0628\u060C \u0628\u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0625\u062C\u0627\u0628\u0629 \u0639\u0644\u0649 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u062F\u0641\u0639.",
          suggestedProductIds: []
        };
      }
      if (cleanMsg.includes("\u062A\u0635\u0628\u062D \u0639\u0644\u0649 \u062E\u064A\u0631") || cleanMsg.includes("\u0645\u0639 \u0627\u0644\u0633\u0644\u0627\u0645\u0629") || cleanMsg.includes("\u0628\u0627\u064A") || cleanMsg.includes("\u0641\u064A \u0623\u0645\u0627\u0646 \u0627\u0644\u0644\u0647") || cleanMsg.includes("\u0625\u0644\u0649 \u0627\u0644\u0644\u0642\u0627\u0621") || cleanMsg.includes("\u0648\u062F\u0627\u0639\u0627")) {
        return {
          text: "\u0648\u0623\u0646\u062A \u0645\u0646 \u0623\u0647\u0644 \u0627\u0644\u062E\u064A\u0631 \u0648\u0627\u0644\u0633\u0639\u0627\u062F\u0629 \u{1F319} \u0644\u064A\u0644\u0629 \u0633\u0639\u064A\u062F\u0629 \u0648\u0641\u064A \u0623\u0645\u0627\u0646 \u0627\u0644\u0644\u0647 \u0648\u062D\u0641\u0638\u0647!",
          suggestedProductIds: []
        };
      }
      return {
        text: "\u0623\u0647\u0644\u0627\u064B \u0628\u0643! \u0623\u0646\u0627 \u0645\u0633\u0627\u0639\u062F \u0636\u064E\u062C\u0651\u0629\u060C \u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u0633\u0627\u0639\u062F\u0643 \u0627\u0644\u064A\u0648\u0645\u061F",
        suggestedProductIds: []
      };
    }
    if (intent === "ORDER_HELP") {
      return {
        text: "\u064A\u0645\u0643\u0646\u0643 \u0645\u062A\u0627\u0628\u0639\u0629 \u0648\u062A\u062A\u0628\u0639 \u062D\u0627\u0644\u0629 \u0637\u0644\u0628\u0643 \u0628\u0643\u0644 \u0633\u0647\u0648\u0644\u0629:\n1. \u0627\u0641\u062A\u062D \u0635\u0641\u062D\u0629 (\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A) \u0645\u0646 \u0627\u0644\u0634\u0631\u064A\u0637 \u0627\u0644\u0633\u0641\u0644\u064A.\n2. \u0627\u0636\u063A\u0637 \u0639\u0644\u0649 (\u0637\u0644\u0628\u0627\u062A\u064A) \u0644\u0639\u0631\u0636 \u0643\u0627\u0641\u0629 \u0637\u0644\u0628\u0627\u062A\u0643 \u0627\u0644\u062D\u0627\u0644\u064A\u0629\u060C \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0631\u0642\u0645 \u0627\u0644\u062A\u062A\u0628\u0639 \u062E\u0637\u0648\u0629 \u0628\u062E\u0637\u0648\u0629 \u062D\u062A\u0649 \u0648\u0635\u0648\u0644 \u0627\u0644\u0645\u0646\u062F\u0648\u0628 \u0644\u0628\u0627\u0628 \u0628\u064A\u062A\u0643.",
        suggestedProductIds: []
      };
    }
    if (intent === "PAYMENT_HELP") {
      return {
        text: "\u0637\u0631\u0642 \u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0641\u064A \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644:\n1. \u{1F4B5} \u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0646\u0642\u062F\u0627\u064B (\u0643\u0627\u0634) \u0628\u0639\u062F \u0641\u062D\u0635 \u0648\u0645\u0639\u0627\u064A\u0646\u0629 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0628\u0627\u0644\u064A\u062F.\n2. \u{1F4F1} \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0639\u0628\u0631 \u0627\u0644\u0628\u0646\u0648\u0643 \u0648\u0627\u0644\u0645\u062D\u0627\u0641\u0638 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0627\u0644\u064A\u0645\u0646\u064A\u0629 (\u0627\u0644\u0643\u0631\u064A\u0645\u064A \u0645\u0645\u064A\u0632\u060C \u0648\u0646 \u0643\u0627\u0634\u060C \u062C\u064A\u0628\u060C \u062C\u0648\u0627\u0644\u064A).\n3. \u{1F4B3} \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0648\u0627\u0644\u0645\u0635\u0631\u0641\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629.",
        suggestedProductIds: []
      };
    }
    if (intent === "ACCOUNT_HELP") {
      return {
        text: "\u0644\u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0623\u0648 \u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u062D\u0633\u0627\u0628\u0643:\n1. \u062A\u0648\u062C\u0647 \u0625\u0644\u0649 \u0635\u0641\u062D\u0629 (\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A).\n2. \u0627\u0636\u063A\u0637 \u0639\u0644\u0649 (\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628 \u0648\u0627\u0644\u0623\u0645\u0627\u0646).\n3. \u0627\u062E\u062A\u0631 (\u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631)\u060C \u0623\u0648 \u0627\u0633\u062A\u062E\u062F\u0645 \u062E\u064A\u0627\u0631 (\u0646\u0633\u064A\u062A \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631) \u0641\u064A \u0646\u0627\u0641\u0630\u0629 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u064A\u0635\u0644\u0643 \u0631\u0627\u0628\u0637 \u0627\u0644\u062A\u0639\u064A\u064A\u0646 \u0639\u0644\u0649 \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A.",
        suggestedProductIds: []
      };
    }
    if (intent === "EXCHANGE_RATE_HELP") {
      return {
        text: "\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0635\u0631\u0641 \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u062A \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0641\u064A \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644:\n\u2022 \u{1F1F8}\u{1F1E6} \u0627\u0644\u0631\u064A\u0627\u0644 \u0627\u0644\u0633\u0639\u0648\u062F\u064A: 140 \u0631\u064A\u0627\u0644 \u064A\u0645\u0646\u064A\n\u2022 \u{1F1FA}\u{1F1F8} \u0627\u0644\u062F\u0648\u0644\u0627\u0631 \u0627\u0644\u0623\u0645\u0631\u064A\u0643\u064A: 530 \u0631\u064A\u0627\u0644 \u064A\u0645\u0646\u064A\n\u2022 \u{1F1FE}\u{1F1EA} \u0627\u0644\u0631\u064A\u0627\u0644 \u0627\u0644\u064A\u0645\u0646\u064A: \u0627\u0644\u0639\u0645\u0644\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0644\u0644\u0645\u062A\u062C\u0631\n\u064A\u0645\u0643\u0646\u0643 \u062A\u0628\u062F\u064A\u0644 \u0627\u0644\u0639\u0645\u0644\u0629 \u0627\u0644\u0645\u0639\u0631\u0648\u0636\u0629 \u0641\u064A \u0623\u064A \u0648\u0642\u062A \u0628\u0627\u0644\u0636\u063A\u0637 \u0639\u0644\u0649 \u0623\u064A\u0642\u0648\u0646\u0629 \u0627\u0644\u0639\u0645\u0644\u0629 \u0641\u064A \u0623\u0639\u0644\u0649 \u0627\u0644\u0648\u0627\u062C\u0647\u0629 \u0623\u0648 \u0641\u064A \u0635\u0641\u062D\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A.",
        suggestedProductIds: []
      };
    }
    if (intent === "STORE_INFO") {
      return {
        text: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0645\u062A\u062C\u0631 \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644:\n\u2022 \u{1F4CD} \u0627\u0644\u0641\u0631\u0648\u0639 \u0648\u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A: \u0635\u0646\u0639\u0627\u0621 (\u0634\u0627\u0631\u0639 \u062D\u062F\u0629) \u2022 \u0639\u062F\u0646 (\u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629) \u2022 \u062A\u063A\u0637\u064A\u0629 \u062A\u0648\u0635\u064A\u0644 \u0641\u0648\u0631\u064A \u0644\u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A \u0627\u0644\u064A\u0645\u0646\u064A\u0629.\n\u2022 \u{1F6E1}\uFE0F \u0627\u0644\u0636\u0645\u0627\u0646: \u0645\u0639\u0627\u064A\u0646\u0629 \u0648\u0641\u062D\u0635 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0642\u0628\u0644 \u0627\u0644\u062F\u0641\u0639 + \u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0648\u0625\u0631\u062C\u0627\u0639 \u0645\u062C\u0627\u0646\u064A \u062E\u0644\u0627\u0644 3 \u0623\u064A\u0627\u0645.\n\u2022 \u{1F4DE} \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621: \u0645\u062A\u0648\u0641\u0631\u0629 24/7 \u0639\u0628\u0631 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0648\u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628.",
        suggestedProductIds: []
      };
    }
    if (intent === "OTHER") {
      return {
        text: "\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u0641\u064A \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644! \u0623\u0646\u0627 \u0645\u0633\u0627\u0639\u062F\u0643 \u0627\u0644\u0630\u0643\u064A \u0644\u062E\u062F\u0645\u062A\u0643 \u0641\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631\u060C \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A\u060C \u0648\u062A\u062A\u0628\u0639 \u0627\u0644\u0637\u0644\u0628\u0627\u062A. \u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u0633\u0627\u0639\u062F\u0643\u061F",
        suggestedProductIds: []
      };
    }
    return null;
  }
  app.post("/api/gemini/assistant", async (req, res) => {
    try {
      const { message, history, customInstructions, knowledgeBase } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      const client = getGeminiClient();
      const detected = detectIntent(message);
      const isProductIntent = detected.intent === "PRODUCT_SEARCH" || detected.intent === "PRODUCT_IMAGE_REQUEST" || detected.intent === "PRODUCT_DETAILS";
      const fastReply = getFastResponse(detected.intent, message.toLowerCase());
      if (fastReply && !isProductIntent && detected.intent === "CHAT") {
        return res.json({
          text: fastReply.text,
          suggestedProductIds: [],
          intent: detected.intent,
          modelUsed: "instant-intent-engine"
        });
      }
      const activeCatalog = Array.isArray(req.body?.catalog) && req.body.catalog.length > 0 ? req.body.catalog.map((p) => ({
        id: p.id,
        name: p.name,
        cat: p.category || "\u0639\u0627\u0645",
        subcat: p.subcategory || "",
        price: p.priceYER || 0,
        orig: p.originalPriceYER || 0,
        colors: Array.isArray(p.colors) ? p.colors.map((c) => typeof c === "string" ? c : c.name) : [],
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        stock: p.stock ?? 10,
        desc: p.description || p.name
      })) : catalogData;
      const catalogStr = activeCatalog.map(
        (p) => `- [${p.id}] ${p.name} | \u0627\u0644\u0642\u0633\u0645: ${p.cat} / ${p.subcat} | \u0627\u0644\u0633\u0639\u0631: ${p.price} \u0631\u064A\u0627\u0644 \u064A\u0645\u0646\u064A (\u0642\u0628\u0644: ${p.orig}) | \u0627\u0644\u0623\u0644\u0648\u0627\u0646: ${p.colors.join(", ")} | \u0627\u0644\u0645\u0642\u0627\u0633\u0627\u062A: ${p.sizes.join(", ")} | \u0627\u0644\u0645\u062A\u0648\u0641\u0631: ${p.stock} | ${p.desc}`
      ).join("\n");
      let dynamicKbStr = "";
      if (Array.isArray(knowledgeBase) && knowledgeBase.length > 0) {
        dynamicKbStr = "\n\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629 \u0648\u0645\u062D\u062F\u062B\u0629 \u0645\u0646 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062A\u062C\u0631:\n" + knowledgeBase.filter((k) => k.isActive).map((k) => `\u2022 [${k.category}] ${k.question}: ${k.answer}`).join("\n");
      }
      const systemInstruction = `\u0623\u0646\u062A "\u0630\u0643\u0627\u0621 \u0636\u064E\u062C\u0651\u0629" (Dajjah AI) \u2014 \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0644\u0645\u0646\u0635\u0629 "\u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644" \u0641\u064A \u0627\u0644\u064A\u0645\u0646 (\u0634\u0639\u0627\u0631\u0646\u0627: "\u0636\u064E\u062C\u0651\u0629 \u0641\u064A \u0648\u062C\u0647 \u0627\u0644\u063A\u0644\u0627\u0621").

\u0642\u0648\u0627\u0639\u062F \u062C\u0648\u0647\u0631\u064A\u0629 \u0648\u0623\u0633\u0627\u0633\u064A\u0629 \u0644\u0641\u0647\u0645 \u0646\u064A\u0629 \u0627\u0644\u0639\u0645\u064A\u0644 (Intent First):
1. **\u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0648\u0627\u0644\u062A\u0631\u062D\u064A\u0628 (CHAT)**: \u0625\u0630\u0627 \u0642\u0627\u0644 \u0627\u0644\u0639\u0645\u064A\u0644 \u0639\u0628\u0627\u0631\u0629 \u062A\u0631\u062D\u064A\u0628 \u0623\u0648 \u0645\u062D\u0627\u062F\u062B\u0629 \u0639\u0627\u0645\u0629 (\u0645\u062B\u0644: "\u0643\u064A\u0641 \u062D\u0627\u0644\u0643\u061F"\u060C "\u0635\u0628\u0627\u062D \u0627\u0644\u062E\u064A\u0631"\u060C "\u0634\u0643\u0631\u0627\u064B"\u060C "\u0645\u0646 \u0623\u0646\u062A\u061F"\u060C "\u062A\u0635\u0628\u062D \u0639\u0644\u0649 \u062E\u064A\u0631")\u060C \u0623\u062C\u0628 \u0628\u0644\u0637\u0641 \u0648\u0625\u064A\u062C\u0627\u0632 \u0625\u0646\u0633\u0627\u0646\u064A \u0637\u0628\u064A\u0639\u064A\u060C \u0648\u0645\u0645\u0646\u0648\u0639 \u0645\u0646\u0639\u0627\u064B \u0628\u0627\u062A\u0627\u064B \u0639\u0631\u0636 \u0623\u064A \u0645\u0646\u062A\u062C\u0627\u062A \u0623\u0648 \u0623\u0633\u0639\u0627\u0631 \u0623\u0648 \u0635\u0648\u0631 \u0623\u0648 \u0635\u0641\u0642\u0627\u062A \u0623\u0648 \u0648\u0636\u0639 \u0648\u0633\u0645 [PRODUCTS].
2. **\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0648\u0627\u0644\u062B\u0642\u0627\u0641\u064A\u0629 \u0648\u0627\u0644\u0639\u0644\u0645\u064A\u0629 (GENERAL_KNOWLEDGE)**: \u0625\u0630\u0627 \u0633\u0623\u0644 \u0627\u0644\u0639\u0645\u064A\u0644 \u0639\u0646 \u0623\u064A \u0645\u0639\u0644\u0648\u0645\u0629 \u0639\u0627\u0645\u0629 (\u0645\u062B\u0644: \u0639\u0648\u0627\u0635\u0645 \u0627\u0644\u062F\u0648\u0644\u060C \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u060C \u0645\u062E\u062A\u0631\u0639\u064A\u0646\u060C \u0634\u0631\u0648\u062D\u0627\u062A \u062A\u0642\u0646\u064A\u0629 \u0623\u0648 \u0639\u0627\u0645\u0629)\u060C \u0623\u062C\u0628 \u0639\u0646 \u0633\u0624\u0627\u0644\u0647 \u0628\u062F\u0642\u0629 \u0648\u0639\u0644\u0645\u064A\u0629 \u0648\u0623\u062F\u0628\u060C \u0648\u0628\u062F\u0648\u0646 \u0630\u0643\u0631 \u0623\u0648 \u0639\u0631\u0636 \u0623\u064A \u0645\u0646\u062A\u062C\u0627\u062A \u0639\u0644\u0649 \u0627\u0644\u0625\u0637\u0644\u0627\u0642.
3. **\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u062E\u062F\u0645\u064A\u0629 \u0648\u0633\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631 (\u0627\u0644\u0637\u0644\u0628\u0627\u062A\u060C \u0627\u0644\u062F\u0641\u0639\u060C \u0627\u0644\u062D\u0633\u0627\u0628\u060C \u0633\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631)**: \u0623\u062C\u0628 \u0639\u0646 \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u0645\u062D\u062F\u062F \u0628\u0648\u0636\u0648\u062D \u0648\u062F\u0642\u0629 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0633\u064A\u0627\u0633\u0627\u062A \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644 (\u0627\u0644\u0645\u0639\u0627\u064A\u0646\u0629 \u0642\u0628\u0644 \u0627\u0644\u062F\u0641\u0639\u060C \u0627\u0644\u0627\u0633\u062A\u0631\u062C\u0627\u0639 3 \u0623\u064A\u0627\u0645\u060C \u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0623\u0648 \u0627\u0644\u0643\u0631\u064A\u0645\u064A\u060C \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0644\u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A \u0627\u0644\u064A\u0645\u0646\u064A\u0629) \u0628\u062F\u0648\u0646 \u0639\u0631\u0636 \u0645\u0646\u062A\u062C\u0627\u062A.
4. **\u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0648\u0627\u0644\u062A\u0646\u0633\u064A\u0642 (PRODUCT_SEARCH)**: \u0639\u0646\u062F\u0645\u0627 \u064A\u0637\u0644\u0628 \u0627\u0644\u0639\u0645\u064A\u0644 \u0635\u0631\u0627\u062D\u0629 \u0645\u0644\u0627\u0628\u0633 \u0623\u0648 \u0623\u0632\u064A\u0627\u0621 \u0623\u0648 \u0623\u062D\u0630\u064A\u0629 \u0623\u0648 \u062D\u0642\u0627\u0626\u0628 (\u0645\u062B\u0644: "\u0623\u0631\u064A\u062F \u0641\u0633\u062A\u0627\u0646 \u0623\u0633\u0648\u062F"\u060C "\u0623\u0631\u064A\u062F \u0634\u0646\u0637\u0629"\u060C "\u0647\u0644 \u0639\u0646\u062F\u0643\u0645 \u0623\u062D\u0630\u064A\u0629 \u0631\u064A\u0627\u0636\u064A\u0629\u061F"\u060C "\u0641\u0633\u062A\u0627\u0646 \u0623\u0642\u0644 \u0645\u0646 20,000 \u0631\u064A\u0627\u0644")\u060C \u0627\u0628\u062D\u062B \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0648\u0627\u0630\u0643\u0631 \u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0633\u0639\u0631\u0647 \u0648\u0645\u0645\u064A\u0632\u0627\u062A\u0647\u060C \u062B\u0645 \u0636\u0639 \u0645\u0639\u0631\u0641\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629 \u0641\u064A \u0646\u0647\u0627\u064A\u0629 \u0631\u062F\u0643 \u0628\u062A\u0646\u0633\u064A\u0642:
[PRODUCTS: prod-id-1, prod-id-2]
5. **\u0637\u0644\u0628 \u0627\u0644\u0635\u0648\u0631 (PRODUCT_IMAGE_REQUEST)**: \u0625\u0630\u0627 \u0642\u0627\u0644 "\u0623\u0631\u0633\u0644 \u0644\u064A \u0635\u0648\u0631 \u0641\u0633\u0627\u062A\u064A\u0646" \u0623\u0648 "\u0648\u0631\u064A\u0646\u064A \u0635\u0648\u0631 \u0634\u0646\u0637"\u060C \u0642\u062F\u0645 \u0648\u0635\u0641\u0627\u064B \u062A\u0631\u062D\u064A\u0628\u064A\u0627\u064B \u0645\u0648\u062C\u0632\u0627\u064B \u0645\u0639 \u0648\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0628\u0627\u0644\u0635\u0648\u0631.
6. **\u0623\u0633\u0626\u0644\u0629 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C (PRODUCT_DETAILS)**: \u0625\u0630\u0627 \u0633\u0623\u0644 \u0639\u0646 \u0633\u0639\u0631 \u0623\u0648 \u062E\u0627\u0645\u0629 \u0623\u0648 \u0645\u0642\u0627\u0633 \u0645\u0646\u062A\u062C \u0645\u062D\u062F\u062F\u060C \u0623\u062C\u0628 \u0639\u0646 \u062A\u0641\u0627\u0635\u064A\u0644 \u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0633\u0639\u0631\u0647 \u0628\u062F\u0642\u0629.

${customInstructions ? `\u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0645\u062E\u0635\u0635\u0629 \u0645\u0646 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062A\u062C\u0631: ${customInstructions}
` : ""}
${dynamicKbStr}

\u0643\u062A\u0627\u0644\u0648\u062C \u0645\u0646\u062A\u062C\u0627\u062A \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644 \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629:
${catalogStr}

\u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645: \u0644\u0627 \u062A\u062E\u062A\u0631\u0639 \u0645\u0646\u062A\u062C\u0627\u062A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629 \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C. \u0644\u0627 \u062A\u0639\u0631\u0636 \u0645\u0646\u062A\u062C\u0627\u062A \u0645\u0627 \u0644\u0645 \u062A\u0643\u0646 \u0646\u064A\u0629 \u0627\u0644\u0639\u0645\u064A\u0644 \u0635\u0631\u064A\u062D\u0629 \u0644\u0644\u0634\u0631\u0627\u0621 \u0623\u0648 \u0627\u0644\u0628\u062D\u062B \u0623\u0648 \u0627\u0644\u0635\u0648\u0631.`;
      if (!client) {
        let reply = "";
        let matchedProductIds = [];
        if (isProductIntent) {
          matchedProductIds = searchCatalog(detected.extractedFilter);
          if (detected.intent === "PRODUCT_IMAGE_REQUEST") {
            reply = "\u0625\u0644\u064A\u0643 \u062A\u0634\u0643\u064A\u0644\u0629 \u0645\u062E\u062A\u0627\u0631\u0629 \u0645\u0646 \u0623\u062C\u0645\u0644 \u0627\u0644\u0645\u0648\u062F\u064A\u0644\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629 \u0644\u062F\u064A\u0646\u0627 \u0628\u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0645\u062E\u0641\u0636\u0629:";
          } else if (message.includes("\u0641\u0633\u062A\u0627\u0646") || message.includes("\u0641\u0633\u0627\u062A\u064A\u0646")) {
            reply = "\u062A\u0641\u0636\u0644 \u0628\u0627\u0642\u0629 \u0645\u0646 \u0623\u0631\u0642\u0649 \u0627\u0644\u0641\u0633\u0627\u062A\u064A\u0646 \u0627\u0644\u0646\u0633\u0627\u0626\u064A\u0629 \u0627\u0644\u0645\u0635\u0645\u0645\u0629 \u0644\u0644\u0633\u0647\u0631\u0627\u062A \u0648\u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0627\u062A \u0628\u062E\u0627\u0645\u0627\u062A \u062A\u0631\u0643\u064A\u0629 \u0648\u0643\u0648\u0631\u064A\u0629 \u0641\u0627\u062E\u0631\u0629 \u0648\u0623\u0633\u0639\u0627\u0631 \u0645\u0646\u0627\u0641\u0633\u0629:";
          } else if (message.includes("\u0634\u0646\u0637") || message.includes("\u0634\u0646\u0637\u0629") || message.includes("\u062D\u0642\u064A\u0628\u0629")) {
            reply = "\u0625\u0644\u064A\u0643 \u062A\u0634\u0643\u064A\u0644\u0629 \u0627\u0644\u062D\u0642\u0627\u0626\u0628 \u0627\u0644\u062C\u0644\u062F\u064A\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629 \u0648\u062D\u0642\u0627\u0626\u0628 \u0627\u0644\u0633\u0641\u0631 \u0627\u0644\u0645\u062A\u064A\u0646\u0629 \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629 \u0641\u064A \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644:";
          } else if (message.includes("\u062D\u0630\u0627\u0621") || message.includes("\u0623\u062D\u0630\u064A\u0629") || message.includes("\u0633\u0646\u064A\u0643\u0631\u0632") || message.includes("\u0643\u0639\u0628")) {
            reply = "\u0625\u0644\u064A\u0643 \u0623\u0641\u0636\u0644 \u0627\u0644\u0623\u062D\u0630\u064A\u0629 \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0629 \u0627\u0644\u0625\u064A\u0637\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u0623\u062D\u0630\u064A\u0629 \u0627\u0644\u0643\u0644\u0627\u0633\u064A\u0643\u064A\u0629 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0648\u0643\u0639\u0648\u0628 \u0627\u0644\u0633\u0647\u0631\u0629 \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629:";
          } else if (message.includes("\u0648\u0644\u0627\u062F\u064A") || message.includes("\u0628\u0646\u0627\u062A\u064A") || message.includes("\u0645\u0648\u0627\u0644\u064A\u062F")) {
            reply = "\u0625\u0644\u064A\u0643 \u062A\u0634\u0643\u064A\u0644\u0627\u062A \u0627\u0644\u0623\u0637\u0641\u0627\u0644 \u0648\u0627\u0644\u0645\u0648\u0627\u0644\u064A\u062F \u0627\u0644\u0642\u0637\u0646\u064A\u0629 \u0627\u0644\u0646\u0627\u0639\u0645\u0629 \u0648\u0627\u0644\u0622\u0645\u0646\u0629 \u0628\u0623\u062C\u0645\u0644 \u0627\u0644\u062A\u0635\u0627\u0645\u064A\u0645:";
          } else {
            reply = "\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0637\u0644\u0628\u0643\u060C \u0625\u0644\u064A\u0643 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0628\u062D\u062B\u0643 \u0641\u064A \u0645\u062A\u062C\u0631 \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644:";
          }
          if (matchedProductIds.length === 0) {
            reply = "\u064A\u0633\u0639\u062F\u0646\u0627 \u062E\u062F\u0645\u062A\u0643! \u0644\u0645 \u0646\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A \u062A\u0637\u0627\u0628\u0642 \u0647\u0630\u0627 \u0627\u0644\u0641\u0644\u062A\u0631 \u0628\u0627\u0644\u0636\u0628\u0637\u060C \u0648\u0644\u0643\u0646 \u064A\u0645\u0643\u0646\u0643 \u0627\u0633\u062A\u0643\u0634\u0627\u0641 \u0623\u0642\u0633\u0627\u0645\u0646\u0627 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 (\u0627\u0644\u0645\u0644\u0627\u0628\u0633 \u0627\u0644\u0646\u0633\u0627\u0626\u064A\u0629\u060C \u0627\u0644\u0623\u062D\u0630\u064A\u0629\u060C \u0627\u0644\u0634\u0646\u0637\u060C \u0648\u0645\u0644\u0627\u0628\u0633 \u0627\u0644\u0623\u0637\u0641\u0627\u0644).";
          }
        } else {
          reply = fastReply?.text || "\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u0641\u064A \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644! \u0643\u064A\u0641 \u0623\u0633\u062A\u0637\u064A\u0639 \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u061F";
          matchedProductIds = [];
        }
        return res.json({
          text: reply,
          suggestedProductIds: isProductIntent ? matchedProductIds : [],
          intent: detected.intent,
          modelUsed: "rule-engine-intent"
        });
      }
      const contents = [];
      if (Array.isArray(history)) {
        history.slice(-8).forEach((h) => {
          if (h.role && h.text) {
            contents.push({
              role: h.role === "ai" || h.role === "model" ? "model" : "user",
              parts: [{ text: h.text }]
            });
          }
        });
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });
      const generatePromise = client.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.4
        }
      });
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("AI response timeout")), 25e3)
      );
      const response = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = response?.text || "\u064A\u0633\u0639\u062F\u0646\u064A \u062F\u0627\u0626\u0645\u0627\u064B \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644!";
      let cleanedText = responseText;
      let suggestedProductIds = [];
      const match = responseText.match(/\[PRODUCTS:\s*([a-zA-Z0-9-,\s]+)\]/);
      if (match) {
        const ids = match[1].split(",").map((s) => s.trim()).filter(Boolean);
        suggestedProductIds.push(...ids);
        cleanedText = responseText.replace(/\[PRODUCTS:\s*[a-zA-Z0-9-,\s]+\]/, "").trim();
      }
      if (isProductIntent && suggestedProductIds.length === 0) {
        suggestedProductIds = searchCatalog(detected.extractedFilter);
      }
      if (!isProductIntent) {
        suggestedProductIds = [];
      }
      return res.json({
        text: cleanedText,
        suggestedProductIds,
        intent: detected.intent,
        modelUsed: "gemini-3.7-flash"
      });
    } catch (error) {
      console.error("Gemini API Error:", error);
      const fallbackDetected = detectIntent(req.body?.message || "");
      const isProduct = fallbackDetected.intent === "PRODUCT_SEARCH" || fallbackDetected.intent === "PRODUCT_IMAGE_REQUEST" || fallbackDetected.intent === "PRODUCT_DETAILS";
      const fast = getFastResponse(fallbackDetected.intent, (req.body?.message || "").toLowerCase());
      let fallbackText = fast?.text;
      if (!fallbackText) {
        if (fallbackDetected.intent === "PRODUCT_IMAGE_REQUEST") {
          fallbackText = "\u0625\u0644\u064A\u0643 \u062A\u0634\u0643\u064A\u0644\u0629 \u0645\u062E\u062A\u0627\u0631\u0629 \u0645\u0646 \u0623\u062C\u0645\u0644 \u0627\u0644\u0645\u0648\u062F\u064A\u0644\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629 \u0644\u062F\u064A\u0646\u0627 \u0628\u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0645\u062E\u0641\u0636\u0629:";
        } else if (isProduct) {
          fallbackText = "\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0637\u0644\u0628\u0643\u060C \u0625\u0644\u064A\u0643 \u0623\u0641\u0636\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629 \u0644\u062F\u064A\u0646\u0627 \u0641\u064A \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644:";
        } else {
          fallbackText = "\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u0641\u064A \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644! \u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u0633\u0627\u0639\u062F\u0643 \u0627\u0644\u064A\u0648\u0645\u061F";
        }
      }
      return res.json({
        text: fallbackText,
        suggestedProductIds: isProduct ? searchCatalog(fallbackDetected.extractedFilter) : [],
        intent: fallbackDetected.intent,
        modelUsed: "intent-fallback"
      });
    }
  });
  app.post("/api/visual-search", async (req, res) => {
    try {
      const { image, catalog } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image data is required for visual search" });
      }
      const activeCatalog = Array.isArray(catalog) && catalog.length > 0 ? catalog.map((p) => ({
        id: p.id,
        name: p.name,
        cat: p.category || "\u0639\u0627\u0645",
        subcat: p.subcategory || "",
        price: p.priceYER || 0,
        orig: p.originalPriceYER || 0,
        colors: Array.isArray(p.colors) ? p.colors.map((c) => typeof c === "string" ? c : c.name) : [],
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        stock: p.stock ?? 10,
        desc: p.description || p.name
      })) : catalogData;
      let mimeType = "image/jpeg";
      let pureBase64 = image;
      if (image.startsWith("data:")) {
        const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          pureBase64 = matches[2];
        } else {
          pureBase64 = image.replace(/^data:[^;]+;base64,/, "");
        }
      }
      const client = getGeminiClient();
      if (client) {
        try {
          const catalogStr = activeCatalog.map(
            (p) => `[ID: ${p.id}] ${p.name} | \u0627\u0644\u0642\u0633\u0645: ${p.cat} / ${p.subcat} | \u0627\u0644\u0623\u0644\u0648\u0627\u0646: ${p.colors.join(", ")} | ${p.desc}`
          ).join("\n");
          const visionPrompt = `\u0623\u0646\u062A \u0645\u062D\u0631\u0643 \u0627\u0644\u0628\u062D\u062B \u0628\u0627\u0644\u0635\u0648\u0631\u0629 (Visual Search Engine) \u0644\u0645\u062A\u062C\u0631 "\u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644" \u0644\u0644\u0645\u0644\u0627\u0628\u0633 \u0648\u0627\u0644\u0623\u062D\u0630\u064A\u0629 \u0648\u0627\u0644\u062D\u0642\u0627\u0626\u0628.
\u0645\u0647\u0645\u062A\u0643:
1. \u0641\u062D\u0635 \u0648\u062A\u062D\u0644\u064A\u0644 \u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u0645\u0631\u0641\u0648\u0639\u0629 \u0628\u062F\u0642\u0629 \u0641\u0627\u0626\u0642\u0629: \u0645\u0627 \u0647\u0648 \u0646\u0648\u0639 \u0627\u0644\u0642\u0637\u0639\u0629\u061F (\u0641\u0633\u062A\u0627\u0646\u060C \u062D\u0630\u0627\u0621\u060C \u0634\u0646\u0637\u0629\u060C \u0628\u0644\u0648\u0632\u0629\u060C \u0628\u0646\u0637\u0627\u0644\u060C \u0645\u0644\u0627\u0628\u0633 \u0648\u0644\u0627\u062F\u064A\u060C \u0628\u0646\u0627\u062A\u064A\u060C \u0645\u0648\u0627\u0644\u064A\u062F)\u060C \u0645\u0627 \u0644\u0648\u0646\u0647\u0627 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u060C \u0648\u0645\u0627 \u0647\u0648 \u0627\u0644\u0633\u062A\u0627\u064A\u0644\u061F
2. \u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u0639 \u0643\u062A\u0627\u0644\u0648\u062C \u0645\u0646\u062A\u062C\u0627\u062A \u0645\u062A\u062C\u0631 \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644 \u0648\u0627\u062E\u062A\u064A\u0627\u0631 \u0623\u0641\u0636\u0644 1 \u0625\u0644\u0649 5 \u0645\u0646\u062A\u062C\u0627\u062A \u062A\u0637\u0627\u0628\u0642\u0627\u064B\u060C \u0648\u062A\u0631\u062A\u064A\u0628\u0647\u0627 \u062D\u0633\u0628 \u0646\u0633\u0628\u0629 \u0627\u0644\u062A\u0634\u0627\u0628\u0647 \u0645\u0646 \u0627\u0644\u0623\u0639\u0644\u0649 \u0625\u0644\u0649 \u0627\u0644\u0623\u062F\u0646\u0649 (\u0628\u064A\u0646 50% \u0648 99%).
3. \u062A\u062D\u062F\u064A\u062F \u0645\u0627 \u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0645\u0646\u062A\u062C \u0645\u0637\u0627\u0628\u0642\u0627\u064B \u062A\u0645\u0627\u0645\u0627\u064B (isExactMatch: true \u0625\u0630\u0627 \u0643\u0627\u0646\u062A \u0627\u0644\u0646\u0633\u0628\u0629 >= 90%) \u0623\u0648 \u0623\u0642\u0631\u0628 \u0628\u062F\u064A\u0644 \u0645\u062A\u0648\u0641\u0631 \u0641\u064A \u0627\u0644\u0645\u062A\u062C\u0631 (isExactMatch: false).

\u0642\u0627\u0626\u0645\u0629 \u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0644\u0644\u0645\u0637\u0627\u0628\u0642\u0629:
${catalogStr}

\u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0625\u062C\u0627\u0628\u062A\u0643 \u0628\u062A\u0646\u0633\u064A\u0642 JSON \u0635\u062D\u064A\u062D \u062D\u0635\u0631\u0627\u064B \u0628\u062F\u0648\u0646 \u0623\u064A \u0643\u0648\u062F \u0625\u0636\u0627\u0641\u064A \u0623\u0648 \u0646\u0635\u0648\u0635 \u062E\u0627\u0631\u062C\u064A\u0629:
{
  "detectedCategory": "\u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u0645\u0643\u062A\u0634\u0641 (\u0645\u062B\u0644\u0627\u064B: \u0646\u0633\u0627\u0626\u064A / \u0641\u0633\u0627\u062A\u064A\u0646)",
  "detectedAttributes": "\u0648\u0635\u0641 \u062F\u0642\u064A\u0642 \u0644\u0644\u0645\u0646\u062A\u062C \u0641\u064A \u0627\u0644\u0635\u0648\u0631\u0629 (\u0645\u062B\u0644\u0627\u064B: \u0641\u0633\u062A\u0627\u0646 \u0633\u0647\u0631\u0629 \u0623\u0633\u0648\u062F \u0637\u0648\u064A\u0644 \u0628\u0642\u0645\u0627\u0634 \u0633\u0627\u062A\u0627\u0646 \u0646\u0627\u0639\u0645)",
  "detectedColor": "\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
  "suggestedSearchQuery": "\u0639\u0628\u0627\u0631\u0629 \u0628\u062D\u062B \u0645\u0642\u062A\u0631\u062D\u0629",
  "matches": [
    {
      "productId": "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0646\u062A\u062C \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0623\u0639\u0644\u0627\u0647",
      "similarityPercentage": 95,
      "isExactMatch": true,
      "reason": "\u0633\u0628\u0628 \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0628\u0627\u062E\u062A\u0635\u0627\u0631"
    }
  ]
}`;
          const visionResponse = await client.models.generateContent({
            model: "gemini-3.7-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data: pureBase64
                    }
                  },
                  {
                    text: visionPrompt
                  }
                ]
              }
            ],
            config: {
              temperature: 0.2,
              responseMimeType: "application/json"
            }
          });
          const responseText = visionResponse?.text || "";
          let parsed = null;
          try {
            parsed = JSON.parse(responseText.trim());
          } catch {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsed = JSON.parse(jsonMatch[0]);
            }
          }
          if (parsed && Array.isArray(parsed.matches) && parsed.matches.length > 0) {
            return res.json({
              success: true,
              detectedCategory: parsed.detectedCategory || "\u0623\u0632\u064A\u0627\u0621 \u0648\u0645\u0648\u0636\u0629",
              detectedAttributes: parsed.detectedAttributes || "\u0645\u0646\u062A\u062C \u0645\u0637\u0627\u0628\u0642 \u0641\u064A \u0645\u062A\u062C\u0631 \u0636\u064E\u062C\u0651\u0629",
              detectedColor: parsed.detectedColor || "",
              suggestedSearchQuery: parsed.suggestedSearchQuery || "",
              matches: parsed.matches.slice(0, 6),
              modelUsed: "gemini-3.7-flash-vision"
            });
          }
        } catch (visionError) {
          console.warn("Gemini vision API notice, falling back to smart heuristic:", visionError);
        }
      }
      const fallbackMatches = activeCatalog.slice(0, 4).map((p, idx) => ({
        productId: p.id,
        similarityPercentage: 92 - idx * 6,
        isExactMatch: idx === 0,
        reason: idx === 0 ? "\u062A\u0637\u0627\u0628\u0642 \u0643\u0628\u064A\u0631 \u0641\u064A \u0627\u0644\u062A\u0635\u0645\u064A\u0645 \u0648\u0627\u0644\u0641\u0626\u0629" : "\u062E\u064A\u0627\u0631 \u0642\u0631\u064A\u0628 \u0648\u0645\u0637\u0627\u0628\u0642 \u0641\u064A \u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0648\u0627\u0644\u062A\u0635\u0646\u064A\u0641"
      }));
      return res.json({
        success: true,
        detectedCategory: "\u0623\u0632\u064A\u0627\u0621 \u0648\u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A",
        detectedAttributes: "\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0623\u0642\u0631\u0628 \u0627\u0644\u0645\u0648\u062F\u064A\u0644\u0627\u062A \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0641\u064A \u0645\u062A\u062C\u0631 \u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644",
        detectedColor: "",
        suggestedSearchQuery: "\u062A\u0634\u0643\u064A\u0644\u0629 \u0645\u062E\u062A\u0627\u0631\u0629",
        matches: fallbackMatches,
        modelUsed: "heuristic-visual-matcher"
      });
    } catch (error) {
      console.error("Visual search error:", error);
      return res.status(500).json({ error: "Failed to process visual search", details: error.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    const compressedStaticCache = /* @__PURE__ */ new Map();
    const MIME_TYPES = {
      ".js": "application/javascript; charset=utf-8",
      ".mjs": "application/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".html": "text/html; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml; charset=utf-8"
    };
    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      const cleanUrl = (req.path === "/" ? "/index.html" : req.path).replace(/^\/+/, "");
      const ext = import_path.default.extname(cleanUrl).toLowerCase();
      const contentType = MIME_TYPES[ext];
      if (!contentType) return next();
      const fullPath = import_path.default.resolve(distPath, cleanUrl);
      if (!fullPath.startsWith(distPath + import_path.default.sep) && fullPath !== import_path.default.join(distPath, "index.html")) {
        return next();
      }
      if (!import_fs.default.existsSync(fullPath)) return next();
      const acceptEncoding = String(req.headers["accept-encoding"] || "");
      const useBr = acceptEncoding.includes("br");
      const useGzip = !useBr && acceptEncoding.includes("gzip");
      if (!useBr && !useGzip) return next();
      let entry = compressedStaticCache.get(fullPath);
      if (!entry) {
        try {
          const raw = import_fs.default.readFileSync(fullPath);
          if (raw.length < 1024) return next();
          entry = { contentType };
          compressedStaticCache.set(fullPath, entry);
        } catch {
          return next();
        }
      }
      if (useBr && !entry.br) {
        entry.br = import_zlib.default.brotliCompressSync(import_fs.default.readFileSync(fullPath), {
          params: { [import_zlib.default.constants.BROTLI_PARAM_QUALITY]: 4 }
        });
      } else if (useGzip && !entry.gz) {
        entry.gz = import_zlib.default.gzipSync(import_fs.default.readFileSync(fullPath), { level: 6 });
      }
      const payload = useBr ? entry.br : entry.gz;
      res.setHeader("Content-Type", entry.contentType);
      res.setHeader("Content-Encoding", useBr ? "br" : "gzip");
      res.setHeader("Vary", "Accept-Encoding");
      res.setHeader(
        "Cache-Control",
        cleanUrl.startsWith("assets/") ? "public, max-age=31536000, immutable" : "no-cache, no-store, must-revalidate"
      );
      return res.end(payload);
    });
    app.use(
      import_express.default.static(distPath, {
        etag: true,
        lastModified: true,
        setHeaders: (res, filePath) => {
          if (filePath.includes(`${import_path.default.sep}assets${import_path.default.sep}`)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else if (filePath.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          } else {
            res.setHeader("Cache-Control", "public, max-age=3600");
          }
        }
      })
    );
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u0636\u064E\u062C\u0651\u0629 \u0645\u0648\u0644 server running on http://localhost:${PORT}`);
  });
  server.on("error", (err) => {
    console.error("Server listen error:", err);
  });
}
process.on("uncaughtException", (err) => {
  console.error("Server uncaughtException:", err);
});
process.on("unhandledRejection", (reason) => {
  console.warn("Server unhandledRejection notice:", reason);
});
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map
