/* GCB Send Message - Mandatory Joined + Optional Greeting v5.2.0 */
(function (global) {
  "use strict";

  const C = global.RakCommon;
  const Auth = global.RakAuth;
  const Api = global.GenesysApi;

  const VERSION = "v5.2.2-fast";
  const LOCAL_REQUEST_DONE_PREFIX = "Bank_GCB_GREETING_DONE_";
  const LOCAL_REQUEST_LOCK_PREFIX = "Bank_GCB_GREETING_LOCK_";
  const REQUEST_LOCK_TTL_MS = 15000;
  const GREETING_START_DELAY_MS = 0;
  const CONTEXT_RETRY_COUNT = 3;
  const CONTEXT_RETRY_DELAY_MS = 1000;
  const JOINED_TO_GREETING_DELAY_MS = 250;
  const RESERVATION_RECHECK_DELAY_MS = 250;
  const RESERVATION_STALE_MS = 30000;

  const GREETING_SENT_KEYS_ATTRIBUTE = "AFT_GCB_GREETING_SENT_KEYS";
  const GREETING_LAST_KEY_ATTRIBUTE = "AFT_GCB_GREETING_LAST_KEY";
  const GREETING_LAST_STATUS_ATTRIBUTE = "AFT_GCB_GREETING_LAST_STATUS";
  const GREETING_LAST_TIME_ATTRIBUTE = "AFT_GCB_GREETING_LAST_TIME";
  const GREETING_LOCK_KEY_ATTRIBUTE = "AFT_GCB_GREETING_LOCK_KEY";
  const GREETING_LOCK_OWNER_ATTRIBUTE = "AFT_GCB_GREETING_LOCK_OWNER";
  const GREETING_LOCK_TIME_ATTRIBUTE = "AFT_GCB_GREETING_LOCK_TIME";
  const GREETING_LOG_ATTRIBUTE = "AFT_GCB_GREETING_LOG";

  const SUPERVISOR_ROLE_NAMES = [
    "Protego Supervisor",
    "RAK Communicate Supervisor",
    "RAK Inbound Supervisor",
    "RAK Supervisor",
    "RAK WEM Supervisor",
    "Supervisor",
    "Testing Supervisor"
  ];

  const DEFAULT_SUPERVISOR_JOINED_TEXT_EN = "Supervisor has joined the chat";
  const DEFAULT_SUPERVISOR_JOINED_TEXT_AR = "انضم المشرف إلى المحادثة";

  // Joined message is mandatory for business logic.
  // Greeting message is optional and controlled by greetingEnabled/sendGreeting URL parameter.
  const DEFAULT_GREETING_ENABLED = true;

  const params = C.getParams();
  const request = buildRequest();
  let debugLines = [];
  let processing = false;

  function $(id) {
    return document.getElementById(id);
  }

  function setStatus(message, type) {
    const el = $("status");
    if (!el) return;
    el.className = "status " + (type || "info");
    el.textContent = message || "";
  }

  function setPill(text, mode) {
    const el = $("processorPill");
    if (!el) return;
    el.className = "pill " + (mode === "on" ? "pill-on" : mode === "warn" ? "pill-warn" : "pill-off");
    el.textContent = text || "Processor: Idle";
  }

  function addDebug(step, message) {
    const line = "[" + new Date().toLocaleString() + "] " + step + " ==> " + C.safeString(message);
    debugLines.push(line);
    if (debugLines.length > 250) debugLines.shift();
    try { console.log(line); } catch (_) {}
    if (request.pageDebug) renderDebug();
  }

  function centralStatus(key, state, reason) {
    try { if (global.GcbDebug && global.GcbDebug.setStatus) global.GcbDebug.setStatus(key, state, reason); } catch (_) {}
  }

  function renderDebug() {
    const el = $("debugPanel");
    if (!el || !request.pageDebug) return;
    el.hidden = false;
    el.textContent = debugLines.join("\n");
  }

  function hasParam(name) {
    return new URLSearchParams(global.location.search).has(name);
  }

  function getOptionalBoolParam(primaryName, secondaryName, defaultValue) {
    if (hasParam(primaryName)) return C.getBoolParam(primaryName, defaultValue);
    if (secondaryName && hasParam(secondaryName)) return C.getBoolParam(secondaryName, defaultValue);
    return defaultValue;
  }

  function buildRequest() {
    const requestId = C.getParam("requestId");
    const urlUuids = C.extractUuids(requestId);
    const conversationFromRequestId = urlUuids[0] || "";
    const agentCommunicationFromRequestId = urlUuids.length > 1 ? urlUuids[urlUuids.length - 1] : "";

    const action = C.safeString(C.getParam("action")).toUpperCase();
    const requestType = C.safeString(C.getParam("requestType")).toUpperCase();
    const conversationId = C.getParam("conversationId") || conversationFromRequestId;
    const customerCommunicationId = C.getParam("customerCommunicationId") || C.getParam("customerCommId");
    const agentCommunicationId = C.getParam("agentCommunicationId") || C.getParam("agentCommId") || agentCommunicationFromRequestId;
    const participantId = C.getParam("participantId") || C.getParam("agentParticipantId");
    const agentName = C.getParam("agentName");
    const customerName = C.getParam("customerName");
    const subject = C.getParam("subject");
    const language = (C.getParam("language") || C.getParam("customerLanguage") || "EN").toUpperCase();

    const replacements = {
      AgentName: agentName,
      CustomerName: customerName,
      Subject: subject
    };

    return {
      action,
      requestType,
      conversationId,
      customerCommunicationId,
      agentCommunicationId,
      participantId,
      requestId,
      agentName,
      customerName,
      subject,
      language,
      joinedMessageText: C.applyMessageTemplate(C.getParam("joinedMessageText"), replacements),
      messageText: C.applyMessageTemplate(C.getParam("messageText"), replacements),
      greetingEnabled: getOptionalBoolParam("greetingEnabled", "sendGreeting", DEFAULT_GREETING_ENABLED),
      debug: C.getBoolParam("debug", false) || C.getBoolParam("showDebug", false),
      pageDebug: C.getBoolParam("pageDebug", false) || C.getBoolParam("showPageDebug", false),
      dryRun: C.getBoolParam("dryRun", false) || C.getBoolParam("diagnosticOnly", false)
    };
  }

  function isGreetingRequest() {
    return request.action === "GREETING" || request.requestType === "GREETING";
  }

  function validateRequest() {
    const missing = [];
    if (!isGreetingRequest()) missing.push("action/requestType must be GREETING");
    if (!request.conversationId) missing.push("conversationId");
    if (!request.requestId) missing.push("requestId");
    if (!request.joinedMessageText) missing.push("joinedMessageText is mandatory");
    if (!Auth.getClientId()) missing.push("clientId");
    if (!Auth.getRegion()) missing.push("region");
    return missing;
  }

  function getDubaiGreetingPrefix() {
    const hourText = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Dubai",
      hour: "2-digit",
      hour12: false
    });
    const hour = Number(hourText);
    const language = C.safeString(request.language).toUpperCase();
    if (language === "AR" || language === "ARABIC") return hour < 12 ? "صباح الخير" : "مساء الخير";
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }

  function buildGreetingText(agentDisplayName) {
    const replacements = {
      AgentName: agentDisplayName || request.agentName,
      CustomerName: request.customerName,
      Subject: request.subject
    };
    const raw = C.applyMessageTemplate(C.getParam("messageText"), replacements);
    if (!raw) return "";
    return getDubaiGreetingPrefix() + " " + raw;
  }

  function isArabicLanguage() {
    const language = C.safeString(request.language).toUpperCase();
    return language === "AR" || language === "ARABIC";
  }

  function normalizeRoleName(value) {
    return C.safeString(value).toLowerCase().replace(/\s+/g, " ");
  }

  function isSupervisorRole(roleName) {
    const normalized = normalizeRoleName(roleName);
    return !!normalized && SUPERVISOR_ROLE_NAMES.some(x => normalizeRoleName(x) === normalized);
  }

  function addRoleName(list, value) {
    const roleName = C.safeString(value);
    if (roleName && !list.includes(roleName)) list.push(roleName);
  }

  function extractRoleNames(user) {
    const roles = [];
    if (!user || typeof user !== "object") return roles;

    function readRole(role) {
      if (typeof role === "string") addRoleName(roles, role);
      else if (role && typeof role === "object") addRoleName(roles, role.name || role.roleName);
    }

    if (Array.isArray(user.roles)) user.roles.forEach(readRole);
    if (user.authorization && Array.isArray(user.authorization.roles)) user.authorization.roles.forEach(readRole);
    if (user.authorization && Array.isArray(user.authorization.grants)) {
      user.authorization.grants.forEach(function (grant) {
        if (!grant) return;
        readRole(grant.role);
        addRoleName(roles, grant.roleName);
      });
    }
    if (Array.isArray(user.grants)) {
      user.grants.forEach(function (grant) {
        if (!grant) return;
        readRole(grant.role);
        addRoleName(roles, grant.roleName);
      });
    }

    return roles;
  }

  async function getCurrentUserGreetingContext(token) {
    const fallbackName = request.agentName;
    try {
      const user = await Api.getCurrentUser(token);
      const roleNames = extractRoleNames(user);
      const isSupervisor = roleNames.some(isSupervisorRole);
      const finalName = C.safeString(user.preferredName) || C.safeString(user.name) || C.safeString(user.email) || fallbackName;
      addDebug("USER_CONTEXT", "name=" + finalName + " | supervisor=" + (isSupervisor ? "YES" : "NO"));
      return {
        userId: C.safeString(user.id),
        agentDisplayName: finalName,
        roleNames,
        isSupervisor
      };
    } catch (error) {
      addDebug("USER_CONTEXT_FALLBACK", error.message || String(error));
      return {
        userId: "",
        agentDisplayName: fallbackName,
        roleNames: [],
        isSupervisor: false
      };
    }
  }

  function buildJoinedMessage(joinedMessageText, userContext) {
    let text = C.safeString(joinedMessageText);
    if (!text) return "";
    if (!userContext || !userContext.isSupervisor) return text;
    return isArabicLanguage() ? DEFAULT_SUPERVISOR_JOINED_TEXT_AR : DEFAULT_SUPERVISOR_JOINED_TEXT_EN;
  }

  function acquireLocalLock(key) {
    const lockKey = LOCAL_REQUEST_LOCK_PREFIX + C.sanitizeKey(key);
    const now = Date.now();
    const raw = localStorage.getItem(lockKey);
    if (raw) {
      try {
        const lock = JSON.parse(raw);
        if (now - Number(lock.time || 0) < REQUEST_LOCK_TTL_MS) return false;
      } catch (_) {}
    }
    localStorage.setItem(lockKey, JSON.stringify({ key, time: now }));
    return true;
  }

  function releaseLocalLock(key) {
    try { localStorage.removeItem(LOCAL_REQUEST_LOCK_PREFIX + C.sanitizeKey(key)); } catch (_) {}
  }

  function localDoneExists(key) {
    return localStorage.getItem(LOCAL_REQUEST_DONE_PREFIX + C.sanitizeKey(key)) === "YES";
  }

  function markLocalDone(key) {
    localStorage.setItem(LOCAL_REQUEST_DONE_PREFIX + C.sanitizeKey(key), "YES");
  }

  function normalizeKeyList(value) {
    const text = C.safeString(value);
    if (!text) return "|";
    if (text.startsWith("|") && text.endsWith("|")) return text;
    return "|" + text.replace(/^\|+|\|+$/g, "") + "|";
  }

  function keyExists(existingKeys, key) {
    return normalizeKeyList(existingKeys).includes("|" + C.safeString(key) + "|");
  }

  function appendKey(existingKeys, key) {
    let keys = normalizeKeyList(existingKeys);
    const safeKey = C.safeString(key);
    if (safeKey && !keyExists(keys, safeKey)) keys += safeKey + "|";
    if (keys.length > 1800) {
      keys = "|" + keys.substring(Math.max(0, keys.length - 1750));
      if (!keys.endsWith("|")) keys += "|";
    }
    return keys;
  }

  function getParticipantAttributes(conversation, participantId) {
    const participants = Array.isArray(conversation && conversation.participants) ? conversation.participants : [];
    const p = participants.find(x => C.safeString(x && x.id) === C.safeString(participantId));
    return (p && p.attributes) || {};
  }

  function buildSessionMessageKey(context) {
    return [
      context.conversationId,
      "JOINED",
      context.customerCommunicationId || "NO_CUSTOMER_COMM",
      context.agentParticipantId || "NO_AGENT_PARTICIPANT",
      context.agentCommunicationId || "NO_AGENT_COMM"
    ].map(C.sanitizeKey).join("-");
  }

  async function readParticipantAttributes(token, conversationId, participantId) {
    const conversation = await Api.getMessageConversation(token, conversationId);
    return getParticipantAttributes(conversation, participantId);
  }

  function parseNumber(value) {
    const n = Number(C.safeString(value));
    return Number.isFinite(n) ? n : 0;
  }

  async function reserveGreeting(token, context, greetingKey) {
    // Fast mode: do not call conversation/read attributes before sending.
    // Duplicate protection is handled by local browser lock/done key immediately.
    // Remote participant attributes are updated after successful send.
    addDebug("FAST_RESERVE", "Remote pre-check skipped. Local lock is active. key=" + greetingKey);
    return { allow: true, reason: "FAST_LOCAL_LOCK", owner: "LOCAL_FAST", existingKeys: "" };
  }

  async function markGreetingSent(token, context, greetingKey, existingKeys) {
    await Api.setParticipantAttributes(token, context.conversationId, context.agentParticipantId, {
      [GREETING_SENT_KEYS_ATTRIBUTE]: appendKey(existingKeys, greetingKey),
      [GREETING_LAST_KEY_ATTRIBUTE]: greetingKey,
      [GREETING_LAST_STATUS_ATTRIBUTE]: "SENT",
      [GREETING_LAST_TIME_ATTRIBUTE]: new Date().toISOString(),
      [GREETING_LOCK_KEY_ATTRIBUTE]: greetingKey,
      [GREETING_LOCK_OWNER_ATTRIBUTE]: "SENT",
      [GREETING_LOCK_TIME_ATTRIBUTE]: String(Date.now())
    });
  }

  async function markGreetingFailed(token, context, greetingKey, errorText) {
    try {
      await Api.setParticipantAttributes(token, context.conversationId, context.agentParticipantId, {
        [GREETING_LAST_KEY_ATTRIBUTE]: greetingKey,
        [GREETING_LAST_STATUS_ATTRIBUTE]: "FAILED",
        [GREETING_LAST_TIME_ATTRIBUTE]: new Date().toISOString(),
        [GREETING_LOG_ATTRIBUTE]: C.truncate(errorText, 480)
      });
    } catch (_) {}
  }

  async function writeGreetingLog(token, context, status, result, detail) {
    if (!context.agentParticipantId) return;
    try {
      const value = [
        "STATUS=" + status,
        "RESULT=" + result,
        "CID=" + context.conversationId,
        "CUSTCOMM=" + context.customerCommunicationId,
        "AGENTPID=" + context.agentParticipantId,
        "AGENTCOMM=" + context.agentCommunicationId,
        "RID=" + request.requestId,
        "DETAIL=" + C.truncate(detail, 160),
        "TIME=" + new Date().toISOString()
      ].join("|");
      await Api.setParticipantAttributes(token, context.conversationId, context.agentParticipantId, {
        [GREETING_LOG_ATTRIBUTE]: C.truncate(value, 500)
      });
    } catch (_) {}
  }

  function isUsableContext(context) {
    return !!(context && context.conversationId && context.agentCommunicationId && context.sendCommunicationId && context.agentParticipantId);
  }

  async function resolveContext(token) {
    // Fast mode: use the values already passed by Genesys Agent Script.
    // No upfront GET conversation/users API is required to resolve communication.
    const context = {
      conversationId: request.conversationId,
      customerCommunicationId: request.customerCommunicationId,
      agentCommunicationId: request.agentCommunicationId,
      agentParticipantId: request.participantId,
      sendCommunicationId: request.agentCommunicationId || request.communicationId
    };
    addDebug("COMM_URL_CONTEXT", "sendComm=" + (context.sendCommunicationId || "") + " | agentParticipant=" + (context.agentParticipantId || "") + " | customerComm=" + (context.customerCommunicationId || ""));
    if (!isUsableContext(context)) {
      throw new Error("Required SendMsg URL values are missing. Pass conversationId, agentCommunicationId, agentParticipantId/participantId, and customerCommunicationId from Agent Script.");
    }
    return context;
  }

  function shouldRetrySendError(error) {
    const text = C.safeString((error && error.message) || String(error)).toLowerCase();
    return text.includes("connected") || text.includes("owner") || text.includes("communication") || text.includes("not found") || text.includes("400") || text.includes("409");
  }

  async function sendMessageWithRetry(token, context, text, label) {
    let lastError = null;
    for (let attempt = 1; attempt <= CONTEXT_RETRY_COUNT; attempt++) {
      try {
        addDebug("SEND_REQUEST", label + " | attempt=" + attempt + " | comm=" + context.sendCommunicationId);
        const result = await Api.sendMessage(token, context.conversationId, context.sendCommunicationId, text);
        return result;
      } catch (error) {
        lastError = error;
        const message = error && error.message ? error.message : String(error);
        addDebug("SEND_RETRY", label + " | attempt=" + attempt + " failed: " + message);
        if (attempt >= CONTEXT_RETRY_COUNT || !shouldRetrySendError(error)) break;
        setStatus("Send " + label + " failed because communication may not be ready. Retrying " + attempt + "/" + CONTEXT_RETRY_COUNT + "...", "info");
        await C.sleep(CONTEXT_RETRY_DELAY_MS);
      }
    }
    throw lastError || new Error("Send " + label + " failed.");
  }

  async function sendGreetingSequence(token, context, joinedText, greetingText) {
    if (!joinedText) throw new Error("Joined message text is mandatory but empty.");

    await sendMessageWithRetry(token, context, joinedText, "JOINED");
    addDebug("SEND_JOINED_OK", "Mandatory joined message sent.");
    centralStatus("sendGreeting", "success", "Mandatory joined message sent.");

    if (greetingText) {
      await C.sleep(JOINED_TO_GREETING_DELAY_MS);
      await sendMessageWithRetry(token, context, greetingText, "GREETING");
      addDebug("SEND_GREETING_OK", "Optional greeting message sent.");
      centralStatus("sendGreeting", "success", "Joined and greeting message sent.");
    } else {
      addDebug("SEND_GREETING_SKIPPED", request.greetingEnabled ? "Greeting enabled but messageText is empty." : "greetingEnabled=false/sendGreeting=false.");
      centralStatus("sendGreeting", "success", request.greetingEnabled ? "Joined sent. Greeting skipped because messageText is empty." : "Joined sent. Greeting disabled by URL.");
    }
  }

  async function processGreeting() {
    if (processing) return;
    processing = true;
    setPill("Processor: Validating", "on");

    try {
      addDebug("INIT", "Send Message Mandatory Joined + Optional Greeting " + VERSION);

      if (await Auth.handleOAuthRedirectIfPresent()) return;

      const missing = validateRequest();
      if (missing.length) {
        setPill("Processor: Idle", "off");
        setStatus("Missing/invalid parameter(s): " + missing.join(", "), "error");
        addDebug("VALIDATION_FAILED", missing.join(", "));
        centralStatus("sendGreeting", "failed", missing.join(", "));
        return;
      }

      let token = Auth.getAccessToken();
      if (!token) {
        setStatus("OAuth token missing. Redirecting to Genesys login/MFA...", "info");
        addDebug("AUTH_START", "Token missing. Starting PKCE login.");
        await Auth.startPKCELogin({ restoreUrl: global.location.href });
        return;
      }

      setStatus("Resolving conversation context...", "info");
      const context = await resolveContext(token);

      if (!context.customerCommunicationId) throw new Error("customerCommunicationId could not be resolved.");
      if (!context.sendCommunicationId) throw new Error("send communicationId could not be resolved.");
      if (!context.agentParticipantId) throw new Error("agentParticipantId/participantId could not be resolved. Pass participantId from Agent Script.");
      if (!context.agentCommunicationId) throw new Error("agentCommunicationId could not be resolved. Pass agentCommunicationId from Agent Script.");

      const messageKey = buildSessionMessageKey(context);
      const localKey = messageKey;
      addDebug("MESSAGE_KEY", messageKey);

      if (localDoneExists(localKey)) {
        setPill("Processor: Skipped", "warn");
        setStatus("Joined/greeting skipped. Already sent in this browser/session.\nKey: " + messageKey, "warning");
        centralStatus("sendGreeting", "success", "Skipped duplicate: already sent in this browser/session.");
        await writeGreetingLog(token, context, "SKIPPED", "LOCAL_DONE", messageKey);
        return;
      }

      if (!acquireLocalLock(localKey)) {
        setPill("Processor: Skipped", "warn");
        setStatus("Joined/greeting skipped. Local duplicate lock is active.\nKey: " + messageKey, "warning");
        centralStatus("sendGreeting", "success", "Skipped duplicate: local lock active.");
        await writeGreetingLog(token, context, "SKIPPED", "LOCAL_LOCK", messageKey);
        return;
      }

      await C.sleep(GREETING_START_DELAY_MS);

      const reservation = await reserveGreeting(token, context, messageKey);
      if (!reservation.allow) {
        markLocalDone(localKey);
        setPill("Processor: Skipped", "warn");
        setStatus("Joined/greeting skipped. Already reserved/sent for this customer session and agent session.\nReason: " + reservation.reason + "\nKey: " + messageKey, "warning");
        centralStatus("sendGreeting", "success", "Skipped duplicate: " + reservation.reason);
        await writeGreetingLog(token, context, "SKIPPED", reservation.reason, messageKey);
        releaseLocalLock(localKey);
        return;
      }

      const userContext = await getCurrentUserGreetingContext(token);
      const joinedText = buildJoinedMessage(request.joinedMessageText, userContext);
      const greetingText = request.greetingEnabled ? buildGreetingText(userContext.agentDisplayName) : "";

      if (request.dryRun) {
        setPill("Processor: Dry Run", "warn");
        setStatus(
          "DRY RUN - No message sent.\n" +
          "Key: " + messageKey + "\n" +
          "Customer Communication: " + context.customerCommunicationId + "\n" +
          "Agent Participant: " + context.agentParticipantId + "\n" +
          "Agent Communication: " + context.agentCommunicationId + "\n" +
          "Joined Message: " + (joinedText || "[empty]") + "\n" +
          "Greeting Enabled: " + (request.greetingEnabled ? "true" : "false") + "\n" +
          "Greeting Message: " + (greetingText || "[empty]"),
          "success"
        );
        releaseLocalLock(localKey);
        return;
      }

      setPill("Processor: Sending", "on");
      setStatus("Sending mandatory joined message" + (greetingText ? " and optional greeting message..." : "..."), "info");
      await sendGreetingSequence(token, context, joinedText, greetingText);
      await markGreetingSent(token, context, messageKey, reservation.existingKeys);
      await writeGreetingLog(token, context, "SUCCESS", request.greetingEnabled ? "JOINED_GREETING_SENT" : "JOINED_SENT", messageKey);
      markLocalDone(localKey);
      releaseLocalLock(localKey);

      setPill("Processor: Done", "on");
      setStatus(
        "Message sent successfully.\n" +
        "Joined Message: SENT\n" +
        "Greeting Message: " + (greetingText ? "SENT" : "SKIPPED") + "\n" +
        "Key: " + messageKey + "\n" +
        "Conversation: " + context.conversationId + "\n" +
        "Customer Communication: " + context.customerCommunicationId + "\n" +
        "Agent Participant: " + context.agentParticipantId + "\n" +
        "Agent Communication: " + context.agentCommunicationId,
        "success"
      );

    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      addDebug("PROCESS_FAILED", message);
      centralStatus("sendGreeting", "failed", message);
      setPill("Processor: Error", "off");
      setStatus("Send Message failed:\n" + message, "error");
    } finally {
      processing = false;
      renderDebug();
    }
  }

  global.RakSendMessage = {
    init: processGreeting
  };

  document.addEventListener("DOMContentLoaded", processGreeting);
})(window);
