import fs from "node:fs";
import path from "node:path";

export const UMAMI_SCRIPT_URL = "https://cloud.umami.is/script.js";
export const UMAMI_DOMAINS = "adamsimms.xyz,syllabi.adamsimms.xyz";
export const UMAMI_CONNECT_SRC =
  "https://cloud.umami.is https://gateway.umami.is https://api-gateway.umami.dev";

export function loadAnalyticsConfig(rootDir) {
  const configPath = path.join(rootDir, "analytics.config.json");
  const defaults = {
    umamiWebsiteId: "",
    umamiScriptUrl: UMAMI_SCRIPT_URL,
    domains: UMAMI_DOMAINS,
  };

  let file = defaults;
  if (fs.existsSync(configPath)) {
    file = { ...defaults, ...JSON.parse(fs.readFileSync(configPath, "utf8")) };
  }

  return {
    umamiWebsiteId: process.env.UMAMI_WEBSITE_ID || file.umamiWebsiteId || "",
    umamiScriptUrl: file.umamiScriptUrl || UMAMI_SCRIPT_URL,
    domains: file.domains || UMAMI_DOMAINS,
  };
}

export function buildUmamiScriptTag(config) {
  if (!config.umamiWebsiteId) {
    return "";
  }

  return `<script defer src="${config.umamiScriptUrl}" data-website-id="${config.umamiWebsiteId}" data-domains="${config.domains}" data-do-not-track="true"></script>`;
}

export function writeAnalyticsPartial(rootDir, config) {
  const partialPath = path.join(rootDir, "templates/hugo-layouts/partials/analytics.html");
  const tag = buildUmamiScriptTag(config);
  const content = tag
    ? `${tag}\n`
    : "{{/* Umami: set umamiWebsiteId in analytics.config.json or UMAMI_WEBSITE_ID */}}\n";

  fs.mkdirSync(path.dirname(partialPath), { recursive: true });
  fs.writeFileSync(partialPath, content);
}

export function buildHeadersBlock() {
  return `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cloud.umami.is; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self' https://cloud.umami.is https://gateway.umami.is https://api-gateway.umami.dev; media-src 'self'; worker-src 'self'
`;
}
