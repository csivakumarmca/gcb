/* GCB Central Debug Bridge v1.0.0 */
(function (global) {
  "use strict";

  const STORAGE_KEY = "GCB_CENTRAL_DEBUG_EVENTS";
  const MAX_EVENTS = 500;
  const SENSITIVE_PARAMS = new Set([
    "access_token", "id_token", "refresh_token", "token", "code", "state", "oauth_token", "authorization"
  ]);

  function now() { return new Date().toISOString(); }
  function safeString(value) {
    if (value === null || value === undefined) return "";
    try { return String(value); } catch (_) { return "[unprintable]"; }
  }
  function truncate(value, max) {
    const text = safeString(value);
    return text.length > max ? text.substring(0, max - 3) + "..." : text;
  }
  function getModuleName() {
    try {
      const params = new URLSearchParams(global.location.search || "");
      return params.get("module") || (global.location.pathname || "").split("/").pop() || "index";
    } catch (_) {
      return "unknown";
    }
  }
  function maskValue(key, value) {
    const text = safeString(value);
    if (!text) return "";
    const lower = safeString(key).toLowerCase();
    if (SENSITIVE_PARAMS.has(lower)) return "***masked***";
    if (lower === "clientid" && text.length > 10) return text.substring(0, 4) + "..." + text.substring(text.length - 4);
    if (lower.includes("token")) return "***masked***";
    return text;
  }
  function maskUrl(url) {
    const input = safeString(url);
    if (!input) return "";
    try {
      const u = new URL(input, global.location.origin);
      u.searchParams.forEach(function (value, key) {
        u.searchParams.set(key, maskValue(key, value));
      });
      return u.toString();
    } catch (_) {
      return truncate(input.replace(/(access_token|id_token|refresh_token|token|code)=([^&\s]+)/ig, "$1=***masked***"), 1200);
    }
  }
  function readEvents() {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }
  function writeEvents(events) {
    try { global.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS))); } catch (_) {}
  }
  function log(level, step, message, data) {
    const event = {
      time: now(),
      level: safeString(level || "INFO").toUpperCase(),
      module: getModuleName(),
      page: (global.location.pathname || "").split("/").pop() || "index.html",
      step: truncate(step || "GENERAL", 80),
      message: truncate(message, 1800),
      url: maskUrl(global.location.href)
    };
    if (data !== undefined) {
      try { event.data = truncate(typeof data === "string" ? data : JSON.stringify(data), 1800); }
      catch (_) { event.data = "[unserializable]"; }
    }
    const events = readEvents();
    events.push(event);
    writeEvents(events);
    try { global.dispatchEvent(new CustomEvent("gcb-debug-event", { detail: event })); } catch (_) {}
    return event;
  }
  function clear() { writeEvents([]); }
  function exportText() {
    return readEvents().map(function (e) {
      return [e.time, e.level, e.module, e.page, e.step, e.message, e.data || ""].join(" | ");
    }).join("\n");
  }

  if (!global.GcbDebug) {
    global.GcbDebug = { log, getEvents: readEvents, clear, exportText, maskUrl, storageKey: STORAGE_KEY };
  }

  if (!global.__GCB_DEBUG_CONSOLE_WRAPPED__) {
    global.__GCB_DEBUG_CONSOLE_WRAPPED__ = true;
    const original = {
      log: global.console && global.console.log ? global.console.log.bind(global.console) : function () {},
      warn: global.console && global.console.warn ? global.console.warn.bind(global.console) : function () {},
      error: global.console && global.console.error ? global.console.error.bind(global.console) : function () {},
      debug: global.console && global.console.debug ? global.console.debug.bind(global.console) : function () {}
    };
    function wrap(name, level) {
      if (!global.console || !global.console[name]) return;
      global.console[name] = function () {
        try {
          const args = Array.prototype.slice.call(arguments).map(function (x) {
            if (x instanceof Error) return x.stack || x.message;
            if (typeof x === "object") { try { return JSON.stringify(x); } catch (_) { return "[object]"; } }
            return safeString(x);
          });
          log(level, "CONSOLE_" + name.toUpperCase(), args.join(" "));
        } catch (_) {}
        return original[name].apply(null, arguments);
      };
    }
    wrap("log", "INFO");
    wrap("debug", "DEBUG");
    wrap("warn", "WARN");
    wrap("error", "ERROR");
  }

  if (!global.__GCB_DEBUG_ERROR_WRAPPED__) {
    global.__GCB_DEBUG_ERROR_WRAPPED__ = true;
    global.addEventListener("error", function (event) {
      log("ERROR", "WINDOW_ERROR", (event.message || "Script error") + " at " + (event.filename || "") + ":" + (event.lineno || ""));
    });
    global.addEventListener("unhandledrejection", function (event) {
      const reason = event.reason;
      log("ERROR", "UNHANDLED_REJECTION", reason && (reason.stack || reason.message) ? (reason.stack || reason.message) : safeString(reason));
    });
  }

  if (!global.__GCB_DEBUG_FETCH_WRAPPED__ && typeof global.fetch === "function") {
    global.__GCB_DEBUG_FETCH_WRAPPED__ = true;
    const originalFetch = global.fetch.bind(global);
    global.fetch = function (input, init) {
      const start = Date.now();
      const method = (init && init.method) || (input && input.method) || "GET";
      const url = typeof input === "string" ? input : (input && input.url) || "";
      log("DEBUG", "FETCH_START", method + " " + maskUrl(url));
      return originalFetch(input, init).then(function (response) {
        log(response.ok ? "DEBUG" : "WARN", "FETCH_DONE", method + " " + maskUrl(url) + " -> HTTP " + response.status + " (" + (Date.now() - start) + "ms)");
        return response;
      }).catch(function (error) {
        log("ERROR", "FETCH_FAILED", method + " " + maskUrl(url) + " -> " + (error && error.message ? error.message : safeString(error)));
        throw error;
      });
    };
  }

  log("INFO", "PAGE_LOAD", "Loaded " + ((global.location.pathname || "").split("/").pop() || "index.html"));
})(window);
