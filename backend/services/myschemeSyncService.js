const axios = require("axios");
const cheerio = require("cheerio");
const Scheme = require("../models/Scheme");
const logger = require("../utlis/logger");

class MyschemeSyncService {
  constructor() {
    this.baseUrl = (process.env.MYSCHEME_BASE_URL || "https://www.myscheme.gov.in").replace(/\/+$/, "");
    this.locale = process.env.MYSCHEME_LOCALE || "en";
    this.timeoutMs = 5000;
    this.maxRetries = 3;
    this.buildIdCache = {
      value: null,
      expiresAt: 0,
    };
    this.buildIdTtlMs = 60 * 60 * 1000; // 1 hour
    this.clientApiCache = {
      apiBase: null,
      apiKey: null,
      expiresAt: 0,
    };
    this.indexesEnsured = false;
    this.browserModuleChecked = false;
    this.playwright = null;
  }

  getBrowserHeaders(acceptValue, extra = {}) {
    return {
      "User-Agent": "Mozilla/5.0",
      Accept: acceptValue,
      "Accept-Language": "en-US,en;q=0.9",
      ...extra,
    };
  }

  isHtmlResponse(responseData, contentType = "") {
    if (typeof responseData !== "string") {
      return false;
    }

    const lowerType = String(contentType).toLowerCase();
    const trimmed = responseData.trim().toLowerCase();
    return (
      lowerType.includes("text/html") ||
      trimmed.startsWith("<!doctype html") ||
      trimmed.startsWith("<html")
    );
  }

  sanitizeState(state) {
    return String(state || "")
      .trim()
      .toLowerCase();
  }

  async getBuildId() {
    const now = Date.now();
    if (this.buildIdCache.value && now < this.buildIdCache.expiresAt) {
      return this.buildIdCache.value;
    }

    const homepageUrl = this.baseUrl;
    const response = await axios.get(homepageUrl, {
      timeout: this.timeoutMs,
      headers: this.getBrowserHeaders("text/html,application/xhtml+xml"),
      responseType: "text",
      transformResponse: [(data) => data],
      validateStatus: () => true,
    });

    if (response.status < 200 || response.status >= 300 || typeof response.data !== "string") {
      throw new Error(`Failed to load myScheme homepage (status ${response.status})`);
    }

    const $ = cheerio.load(response.data);
    const nextDataRaw = $("#__NEXT_DATA__").html();
    let buildId;

    // Preferred strategy: parse __NEXT_DATA__ JSON.
    if (nextDataRaw) {
      try {
        const nextData = JSON.parse(nextDataRaw);
        buildId = nextData?.buildId;
      } catch (error) {
        logger.warn("Failed to parse __NEXT_DATA__ JSON while extracting buildId", {
          error: error.message,
        });
      }
    }

    // Fallback strategy: regex on HTML.
    if (!buildId) {
      const buildIdMatch = response.data.match(/"buildId"\s*:\s*"([^"]+)"/);
      buildId = buildIdMatch?.[1];
    }

    if (!buildId) {
      throw new Error("Unable to extract Next.js buildId from myScheme homepage");
    }

    this.buildIdCache.value = buildId;
    this.buildIdCache.expiresAt = now + this.buildIdTtlMs;
    return buildId;
  }

  async getClientSearchApiConfig() {
    const now = Date.now();
    if (
      this.clientApiCache.apiBase &&
      this.clientApiCache.apiKey &&
      now < this.clientApiCache.expiresAt
    ) {
      return {
        apiBase: this.clientApiCache.apiBase,
        apiKey: this.clientApiCache.apiKey,
      };
    }

    const searchPageUrl = `${this.baseUrl}/${this.locale}/search`;
    const searchPage = await axios.get(searchPageUrl, {
      timeout: this.timeoutMs,
      headers: this.getBrowserHeaders("text/html,application/xhtml+xml"),
      responseType: "text",
      transformResponse: [(data) => data],
      validateStatus: () => true,
    });

    if (searchPage.status < 200 || searchPage.status >= 300 || typeof searchPage.data !== "string") {
      throw new Error(`Unable to load myScheme search page (status ${searchPage.status})`);
    }

    const $ = cheerio.load(searchPage.data);
    const scriptUrls = [];
    $("script[src]").each((_, el) => {
      const src = ($(el).attr("src") || "").trim();
      if (src) {
        scriptUrls.push(src.startsWith("http") ? src : `${this.baseUrl}${src}`);
      }
    });

    for (const scriptUrl of scriptUrls) {
      try {
        const js = await axios.get(scriptUrl, {
          timeout: this.timeoutMs,
          headers: this.getBrowserHeaders("*/*"),
          responseType: "text",
          transformResponse: [(data) => data],
          validateStatus: () => true,
        });

        if (js.status < 200 || js.status >= 300 || typeof js.data !== "string") {
          continue;
        }

        const apiBaseMatch = js.data.match(/https:\/\/api\.myscheme\.gov\.in\/search\/v\d+/);
        const apiKeyMatch = js.data.match(/"x-api-key"\s*:\s*"([^"]+)"/);

        if (apiBaseMatch?.[0] && apiKeyMatch?.[1]) {
          this.clientApiCache.apiBase = apiBaseMatch[0];
          this.clientApiCache.apiKey = apiKeyMatch[1];
          this.clientApiCache.expiresAt = now + this.buildIdTtlMs;
          return {
            apiBase: this.clientApiCache.apiBase,
            apiKey: this.clientApiCache.apiKey,
          };
        }
      } catch (error) {
        logger.warn("Failed reading script while resolving myScheme client API config", {
          scriptUrl,
          error: error.message || error.code || "unknown",
        });
      }
    }

    throw new Error("Unable to discover myScheme search API config from frontend scripts");
  }

  getSearchApiUrl(buildId, state) {
    const stateQuery = encodeURIComponent(this.sanitizeState(state));
    return `${this.baseUrl}/_next/data/${buildId}/${this.locale}/search.json?state=${stateQuery}`;
  }

  extractSchemesFromPayload(payload) {
    return payload?.pageProps?.initialState?.search?.schemes || [];
  }

  parseJsonSafely(rawData) {
    if (rawData && typeof rawData === "object") {
      return rawData;
    }

    if (typeof rawData !== "string") {
      return null;
    }

    try {
      return JSON.parse(rawData);
    } catch (error) {
      return null;
    }
  }

  normalizeText(value) {
    if (Array.isArray(value)) {
      return value.filter(Boolean).join(" ").trim();
    }
    if (typeof value === "object" && value !== null) {
      return (
        value.text ||
        value.title ||
        value.name ||
        value.label ||
        ""
      )
        .toString()
        .trim();
    }
    return (value || "").toString().trim();
  }

  buildSourceUrl(rawScheme) {
    const rawUrl =
      rawScheme?.sourceUrl ||
      rawScheme?.url ||
      rawScheme?.link ||
      rawScheme?.schemeUrl ||
      rawScheme?.slug ||
      "";

    if (!rawUrl) {
      return this.baseUrl;
    }

    if (/^https?:\/\//i.test(rawUrl)) {
      return this.stripUrlFragment(rawUrl);
    }

    const cleanPath = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
    return this.stripUrlFragment(`${this.baseUrl}${cleanPath}`);
  }

  stripUrlFragment(urlValue) {
    const url = (urlValue || "").toString().trim();
    const hashIndex = url.indexOf("#");
    return hashIndex === -1 ? url : url.slice(0, hashIndex);
  }

  async getPlaywrightModule() {
    if (this.browserModuleChecked) {
      return this.playwright;
    }

    this.browserModuleChecked = true;
    try {
      // Optional dependency: install with `npm i playwright`.
      // Sync continues even if not installed.
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      this.playwright = require("playwright");
      return this.playwright;
    } catch (error) {
      logger.warn("Playwright not installed; skipping rendered detail enrichment", {
        error: error.message || "unknown",
      });
      this.playwright = null;
      return null;
    }
  }

  async enrichSchemeDetailsWithBrowser(normalizedSchemes) {
    const enabled = process.env.SCHEME_DETAIL_ENRICHMENT === "true";
    if (!enabled || !Array.isArray(normalizedSchemes) || normalizedSchemes.length === 0) {
      return normalizedSchemes;
    }

    const playwright = await this.getPlaywrightModule();
    if (!playwright) {
      return normalizedSchemes;
    }

    const maxItems = Math.max(1, parseInt(process.env.SCHEME_DETAIL_MAX_ITEMS || "25", 10));
    const timeoutMs = Math.max(5000, parseInt(process.env.SCHEME_DETAIL_NAV_TIMEOUT || "15000", 10));
    const targets = normalizedSchemes
      .filter((scheme) => scheme?.sourceUrl && (!scheme?.benefits || !scheme?.eligibility))
      .slice(0, maxItems);

    if (!targets.length) {
      return normalizedSchemes;
    }

    let browser;
    try {
      browser = await playwright.chromium.launch({ headless: true });
      const context = await browser.newContext({
        userAgent: "Mozilla/5.0",
      });
      const page = await context.newPage();

      for (const scheme of targets) {
        try {
          await page.goto(scheme.sourceUrl, {
            waitUntil: "domcontentloaded",
            timeout: timeoutMs,
          });

          // Let client-side sections render.
          await page.waitForTimeout(1200);

          const extracted = await page.evaluate(() => {
            const normalize = (txt) => (txt || "").replace(/\s+/g, " ").trim();

            const bodyText = normalize(document?.body?.innerText || "");
            const lower = bodyText.toLowerCase();

            const findAll = (needle) => {
              const out = [];
              let idx = lower.indexOf(needle);
              while (idx !== -1) {
                out.push(idx);
                idx = lower.indexOf(needle, idx + needle.length);
              }
              return out;
            };

            const extractBetween = (startKeywords, endKeywords) => {
              let best = "";
              for (const startKeyword of startKeywords) {
                const starts = findAll(startKeyword);
                for (const s of starts) {
                  let e = lower.length;
                  for (const endKeyword of endKeywords) {
                    const idx = lower.indexOf(endKeyword, s + startKeyword.length);
                    if (idx !== -1 && idx < e) e = idx;
                  }
                  const section = normalize(bodyText.slice(s + startKeyword.length, e));
                  if (section.length > best.length) best = section;
                }
              }
              return best;
            };

            return {
              benefits: extractBetween(
                ["benefits"],
                ["eligibility", "exclusions", "application process", "documents required", "frequently asked questions", "sources and references", "feedback"]
              ),
              eligibility: extractBetween(
                ["eligibility"],
                ["exclusions", "application process", "documents required", "frequently asked questions", "sources and references", "feedback"]
              ),
            };
          });

          const cleanBenefits = this.cleanSectionText(extracted?.benefits);
          const cleanEligibility = this.cleanSectionText(extracted?.eligibility);

          if (cleanBenefits) {
            scheme.benefits = cleanBenefits.slice(0, 3000);
          }
          if (cleanEligibility) {
            scheme.eligibility = cleanEligibility.slice(0, 3000);
          }
        } catch (error) {
          logger.warn("Failed rendered detail enrichment for scheme", {
            title: scheme.title,
            sourceUrl: scheme.sourceUrl,
            error: error.message || "unknown",
          });
        }
      }
    } catch (error) {
      logger.error("Rendered detail enrichment failed", {
        error: error.message || "unknown",
      });
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (error) {
          logger.warn("Failed closing Playwright browser", { error: error.message || "unknown" });
        }
      }
    }

    return normalizedSchemes;
  }

  cleanSectionText(value) {
    const text = this.normalizeText(value);
    if (!text) {
      return "";
    }

    let cleaned = text
      .replace(/\bBack\b/gi, " ")
      .replace(/\bDetails\b/gi, " ")
      .replace(/\bBenefits\b/gi, " ")
      .replace(/\bEligibility\b/gi, " ")
      .replace(/\bSign In\b/gi, " ")
      .replace(/\bSign Out\b/gi, " ")
      .replace(/\bCancel\b/gi, " ")
      .replace(/\bOk\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    const noisyIndicators = [
      "something went wrong",
      "enter scheme name to search",
      "you're being redirected",
      "theme sign in",
      "cancel sign out",
      "feedback",
      "sources and references",
      "apply now",
      "check eligibility",
    ];

    const lower = cleaned.toLowerCase();
    const noisyHits = noisyIndicators.filter((indicator) => lower.includes(indicator)).length;

    if (noisyHits >= 2) {
      return "";
    }

    if (cleaned.length < 25) {
      return "";
    }

    return cleaned;
  }

  isCorruptedSection(value) {
    const lower = (value || "").toString().toLowerCase();
    if (!lower) return false;
    return (
      lower.includes("something went wrong") ||
      lower.includes("enter scheme name to search") ||
      lower.includes("you're being redirected") ||
      lower.includes("cancel sign out") ||
      lower.includes("theme sign in")
    );
  }

  normalizeScheme(rawScheme, state) {
    const normalizedState = this.sanitizeState(state);
    const fields = rawScheme?.fields || {};
    const title = this.normalizeText(
      rawScheme?.title ||
      rawScheme?.name ||
      rawScheme?.scheme_name ||
      fields?.schemeName ||
      fields?.schemeShortTitle
    );
    if (!title) {
      return null;
    }

    const sourceUrl = this.stripUrlFragment(fields?.slug
      ? `${this.baseUrl}/${this.locale}/schemes/${fields.slug}`
      : this.buildSourceUrl(rawScheme));

    return {
      title: title.slice(0, 500),
      description: this.normalizeText(
        rawScheme?.description ||
        rawScheme?.shortDescription ||
        rawScheme?.summary ||
        fields?.briefDescription
      ).slice(0, 5000),
      category: this.normalizeText(
        rawScheme?.category ||
        rawScheme?.theme ||
        fields?.schemeCategory?.[0] ||
        "general"
      ).slice(0, 200),
      state: normalizedState,
      benefits: this.normalizeText(
        rawScheme?.benefits || rawScheme?.benefit || fields?.benefits
      ).slice(0, 3000),
      eligibility: this.normalizeText(
        rawScheme?.eligibility || rawScheme?.eligibilityCriteria || fields?.eligibility
      ).slice(0, 3000),
      sourceUrl,
      // Keep link populated to avoid legacy unique `link_1` null collisions.
      link: sourceUrl,
      createdAt: new Date(),
      source: "myscheme",
    };
  }

  async ensureIndexCompatibility() {
    if (this.indexesEnsured) {
      return;
    }

    try {
      const existingIndexes = await Scheme.collection.indexes();
      const hasLegacyUniqueLink = existingIndexes.some(
        (idx) => idx.name === "link_1" && idx.unique
      );

      if (hasLegacyUniqueLink) {
        await Scheme.collection.dropIndex("link_1");
        logger.info("Dropped legacy unique index link_1 to prevent null-link collisions");
      }

      await Scheme.syncIndexes();
      this.indexesEnsured = true;
    } catch (error) {
      logger.warn("Could not auto-adjust scheme indexes; continuing with best effort", {
        error: error.message || "unknown",
      });
    }
  }

  async saveSchemes(normalizedSchemes) {
    if (!normalizedSchemes.length) {
      return { added: 0, updated: 0, skipped: 0 };
    }

    await this.ensureIndexCompatibility();
    let added = 0;
    let updated = 0;
    let skipped = 0;

    for (const scheme of normalizedSchemes) {
      const cleanIncomingBenefits = this.cleanSectionText(scheme.benefits);
      const cleanIncomingEligibility = this.cleanSectionText(scheme.eligibility);
      scheme.benefits = cleanIncomingBenefits;
      scheme.eligibility = cleanIncomingEligibility;

      const existing = await Scheme.findOne({
        title: scheme.title,
        state: scheme.state,
      }).lean();

      if (!existing) {
        await Scheme.create(scheme);
        added += 1;
        continue;
      }

      const updates = {};
      const existingBenefitsCorrupted = this.isCorruptedSection(existing.benefits);
      const existingEligibilityCorrupted = this.isCorruptedSection(existing.eligibility);

      if (existingBenefitsCorrupted && !cleanIncomingBenefits) {
        updates.benefits = "";
      } else if ((!existing.benefits || existingBenefitsCorrupted) && cleanIncomingBenefits) {
        updates.benefits = cleanIncomingBenefits;
      }

      if (existingEligibilityCorrupted && !cleanIncomingEligibility) {
        updates.eligibility = "";
      } else if ((!existing.eligibility || existingEligibilityCorrupted) && cleanIncomingEligibility) {
        updates.eligibility = cleanIncomingEligibility;
      }

      // Keep URLs clean if older record has fragment-based URL.
      const cleanExistingSource = this.stripUrlFragment(existing.sourceUrl || "");
      const cleanExistingLink = this.stripUrlFragment(existing.link || "");
      if (existing.sourceUrl && cleanExistingSource !== existing.sourceUrl) {
        updates.sourceUrl = cleanExistingSource;
      }
      if (existing.link && cleanExistingLink !== existing.link) {
        updates.link = cleanExistingLink;
      }

      if (Object.keys(updates).length > 0) {
        await Scheme.updateOne({ _id: existing._id }, { $set: updates });
        updated += 1;
      } else {
        skipped += 1;
      }
    }

    return { added, updated, skipped };
  }

  async fallbackParseSchemeTitles(state) {
    const searchPageUrl = `${this.baseUrl}/${this.locale}/search?state=${encodeURIComponent(
      this.sanitizeState(state)
    )}`;

    const response = await axios.get(searchPageUrl, {
      timeout: this.timeoutMs,
      headers: this.getBrowserHeaders("text/html,application/xhtml+xml"),
      responseType: "text",
      transformResponse: [(data) => data],
      validateStatus: () => true,
    });

    if (response.status < 200 || response.status >= 300 || typeof response.data !== "string") {
      return [];
    }

    const $ = cheerio.load(response.data);
    const collected = new Set();
    const selectors = [
      '[data-testid*="scheme"] h2',
      '[data-testid*="scheme"] h3',
      ".scheme-card h2",
      ".scheme-card h3",
      ".scheme-title",
      "h2",
      "h3",
    ];

    selectors.forEach((selector) => {
      $(selector).each((_, el) => {
        const title = $(el).text().trim();
        if (title && title.length > 3 && title.length < 500) {
          collected.add(title);
        }
      });
    });

    return Array.from(collected).map((title) => ({
      title,
      description: "",
      category: "general",
      state: this.sanitizeState(state),
      benefits: "",
      eligibility: "",
      sourceUrl: searchPageUrl,
      link: `${searchPageUrl}&title=${encodeURIComponent(title.toLowerCase())}`,
      createdAt: new Date(),
      source: "myscheme",
    }));
  }

  async fetchSchemesJsonWithRetry(state) {
    let lastError = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt += 1) {
      try {
        const buildId = await this.getBuildId();
        const apiUrl = this.getSearchApiUrl(buildId, state);

        const response = await axios.get(apiUrl, {
          timeout: this.timeoutMs,
          headers: this.getBrowserHeaders("application/json"),
          responseType: "text",
          transformResponse: [(data) => data],
          validateStatus: () => true,
        });

        const contentType = response.headers?.["content-type"] || "";
        if (this.isHtmlResponse(response.data, contentType)) {
          this.buildIdCache.expiresAt = 0;
          logger.warn("myScheme API returned HTML instead of JSON, retrying", {
            attempt,
            state: this.sanitizeState(state),
            status: response.status,
            apiUrl,
          });
          lastError = new Error("myScheme Next.js data endpoint returned HTML");
          continue;
        }

        if (response.status < 200 || response.status >= 300) {
          throw new Error(`myScheme API request failed with status ${response.status}`);
        }

        const payload = this.parseJsonSafely(response.data);
        if (!payload) {
          throw new Error("myScheme API returned non-JSON payload");
        }

        const schemes = this.extractSchemesFromPayload(payload);
        if (!Array.isArray(schemes)) {
          throw new Error("Unexpected JSON shape: schemes path not found");
        }

        return { schemes, apiUrl, fromFallback: false };
      } catch (error) {
        lastError = error;
        logger.warn("myScheme JSON sync attempt failed", {
          attempt,
          state: this.sanitizeState(state),
          error: error.message || error.code || "unknown",
        });
      }
    }

    throw lastError || new Error("myScheme JSON sync failed after max retries");
  }

  matchesState(rawScheme, requestedState) {
    const wanted = this.sanitizeState(requestedState);
    const states = rawScheme?.fields?.beneficiaryState;
    if (!Array.isArray(states) || states.length === 0) {
      return true;
    }

    const normalizedStates = states.map((s) => this.sanitizeState(s));
    return normalizedStates.includes("all") || normalizedStates.includes(wanted);
  }

  async fetchSchemesFromClientSearchApi(state) {
    const normalizedState = this.sanitizeState(state);
    const { apiBase, apiKey } = await this.getClientSearchApiConfig();

    const size = 100;
    const maxPages = 10;
    const allItems = [];

    for (let page = 0; page < maxPages; page += 1) {
      const from = page * size;
      const url =
        `${apiBase}/schemes?lang=${encodeURIComponent(this.locale)}` +
        `&q=%5B%5D&keyword=&from=${from}&size=${size}`;

      const response = await axios.get(url, {
        timeout: this.timeoutMs,
        headers: this.getBrowserHeaders("application/json, text/plain, */*", {
          "x-api-key": apiKey,
          Origin: this.baseUrl,
          Referer: `${this.baseUrl}/`,
          "sec-fetch-site": "same-site",
          "sec-fetch-mode": "cors",
          "sec-fetch-dest": "empty",
        }),
        responseType: "json",
        validateStatus: () => true,
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Client search API failed with status ${response.status}`);
      }

      const items = response.data?.data?.hits?.items || [];
      if (!Array.isArray(items) || items.length === 0) {
        break;
      }

      allItems.push(...items);
      if (items.length < size) {
        break;
      }
    }

    return allItems.filter((item) => this.matchesState(item, normalizedState));
  }

  async syncState(state) {
    const normalizedState = this.sanitizeState(state);
    if (!normalizedState) {
      throw new Error("State parameter is required");
    }

    let fetchedSchemes = [];
    let fromFallback = false;
    let fallbackMessage = null;

    try {
      const jsonResult = await this.fetchSchemesJsonWithRetry(normalizedState);
      fetchedSchemes = jsonResult.schemes;
    } catch (error) {
      // Requirement: only true buildId extraction failures are hard errors.
      // If Next.js data endpoint returns HTML, we should continue to fallback APIs.
      if (/buildid/i.test(error.message || "")) {
        throw error;
      }

      logger.error("JSON API sync failed after retries, trying HTML fallback parser", {
        state: normalizedState,
        error: error.message,
      });

      try {
        fetchedSchemes = await this.fetchSchemesFromClientSearchApi(normalizedState);
        fromFallback = true;
        fallbackMessage = "Next.js JSON endpoint failed; synced schemes via client search API fallback.";
      } catch (clientApiError) {
        logger.error("Client search API fallback failed, trying HTML title parser", {
          state: normalizedState,
          error: clientApiError.message || clientApiError.code || "unknown",
        });

        fromFallback = true;
        fallbackMessage = "JSON APIs unavailable after retries; used HTML title parser fallback.";
        fetchedSchemes = await this.fallbackParseSchemeTitles(normalizedState);
      }
    }

    const normalizedSchemes = fetchedSchemes
      .map((item) => this.normalizeScheme(item, normalizedState))
      .filter(Boolean);

    const enrichedSchemes = await this.enrichSchemeDetailsWithBrowser(normalizedSchemes);
    const { added, updated, skipped } = await this.saveSchemes(enrichedSchemes);

    logger.info("myScheme sync completed", {
      state: normalizedState,
      fetched: enrichedSchemes.length,
      added,
      updated,
      skipped,
      fromFallback,
    });

    return {
      state: normalizedState,
      fetched: enrichedSchemes.length,
      added,
      updated,
      skipped,
      fromFallback,
      fallbackMessage,
    };
  }
}

module.exports = new MyschemeSyncService();
