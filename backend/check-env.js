// Quick environment variable checker for Railway
console.log("🔍 ENVIRONMENT CHECK:");
console.log("NEWS_API_KEY:", process.env.NEWS_API_KEY ? "✅ SET" : "❌ MISSING");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ SET" : "❌ MISSING");
console.log("NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("PORT:", process.env.PORT || "not set");