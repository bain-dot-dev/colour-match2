#!/usr/bin/env node

/**
 * Environment Variables Check Script
 * Run this to verify your .env.local is properly configured
 *
 * Usage: node check-env.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Checking Environment Configuration...\n");

// Check if .env.local exists
const envPath = path.join(__dirname, ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ ERROR: .env.local file not found!");
  console.log("   Create it in the project root directory.");
  process.exit(1);
}

console.log("✅ .env.local file exists\n");

// Read and parse .env.local
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};

envContent.split("\n").forEach((line) => {
  // Skip comments and empty lines
  if (line.trim() && !line.trim().startsWith("#")) {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      let value = valueParts.join("=").trim();
      // Remove quotes
      value = value.replace(/^['"]|['"]$/g, "");
      envVars[key.trim()] = value;
    }
  }
});

// Required variables
const required = {
  AUTH_SECRET: {
    description: "NextAuth session encryption secret",
    minLength: 32,
  },
  NEXTAUTH_SECRET: {
    description: "NextAuth secret (should match AUTH_SECRET)",
    minLength: 32,
  },
  HMAC_SECRET_KEY: {
    description: "HMAC secret for wallet authentication",
    minLength: 32,
  },
  AUTH_URL: {
    description: "Authentication callback URL",
    validate: (val) => val.startsWith("http://") || val.startsWith("https://"),
  },
  NEXT_PUBLIC_APP_ID: {
    description: "World App ID from Developer Portal",
    validate: (val) => val.startsWith("app_") || val.startsWith("app_staging_"),
  },
  NEXT_PUBLIC_ACTION: {
    description: "World ID action identifier",
    minLength: 1,
  },
};

let hasErrors = false;

console.log("📋 Checking Required Variables:\n");

Object.entries(required).forEach(([key, config]) => {
  const value = envVars[key];

  if (!value) {
    console.error(`❌ ${key}: MISSING`);
    console.log(`   ${config.description}`);
    hasErrors = true;
  } else {
    // Check length
    if (config.minLength && value.length < config.minLength) {
      console.error(
        `❌ ${key}: Too short (${value.length} chars, need ${config.minLength}+)`
      );
      hasErrors = true;
    }
    // Check validation function
    else if (config.validate && !config.validate(value)) {
      console.error(`❌ ${key}: Invalid format`);
      console.log(`   Value: ${value.substring(0, 50)}...`);
      hasErrors = true;
    } else {
      console.log(`✅ ${key}: Configured`);
      if (key === "NEXT_PUBLIC_APP_ID") {
        console.log(`   Value: ${value}`);
      } else if (key === "AUTH_URL") {
        console.log(`   Value: ${value}`);
      }
    }
  }
});

console.log("\n");

// Special checks
if (envVars["AUTH_SECRET"] && envVars["NEXTAUTH_SECRET"]) {
  if (envVars["AUTH_SECRET"] === envVars["NEXTAUTH_SECRET"]) {
    console.log("✅ AUTH_SECRET and NEXTAUTH_SECRET match");
  } else {
    console.warn("⚠️  WARNING: AUTH_SECRET and NEXTAUTH_SECRET should match");
  }
}

if (envVars["AUTH_URL"]) {
  if (
    envVars["AUTH_URL"].includes("localhost") ||
    envVars["AUTH_URL"].includes("127.0.0.1")
  ) {
    console.log("⚠️  WARNING: AUTH_URL is set to localhost");
    console.log("   For World App testing, update this to your ngrok URL");
  } else if (envVars["AUTH_URL"].includes("ngrok")) {
    console.log("✅ AUTH_URL is set to ngrok (good for testing)");
  }
}

console.log("\n");

if (hasErrors) {
  console.error(
    "❌ Configuration has errors. Please fix them before starting the app.\n"
  );
  process.exit(1);
} else {
  console.log("✅ All required environment variables are configured!\n");
  console.log("📝 Next Steps:");
  console.log(
    "   1. If testing in World App, make sure AUTH_URL points to ngrok"
  );
  console.log("   2. Restart your dev server: npm run dev");
  console.log("   3. Test in World App using the ngrok URL\n");
  process.exit(0);
}
