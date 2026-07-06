/* GCB Genesys API Helpers v1.1.1 - script-first connected communication resolver */
(function (global) {
  "use strict";

  const C = global.RakCommon;
  const Auth = global.RakAuth;

  async function genesysFetch(path, options) {
    options = options || {};
    const token = options.token || Auth.getAccessToken();
    if (!token) throw new Error("OAuth token missing.");

    const response = await fetch(Auth.getApiBase() + path, {
      method: options.method || "GET",
      headers: Object.assign({
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }, options.headers || {}),
      body: options.body !== undefined ? options.body : undefined
    });

    const text = await response.text();
    const data = C.parseJson(text);
    if (!response.ok) {
      const error = new Error((data && (data.message || data.error)) || ("Genesys API failed. HTTP " + response.status + " - " + text));
      error.status = response.status;
      error.payload = data;
      error.rawText = text;
      if (response.status === 401) Auth.clearToken();
      throw error;
    }

    return data;
  }

  async function getMessageConversation(token, conversationId) {
    return genesysFetch("/api/v2/conversations/messages/" + encodeURIComponent(conversationId), { token });
  }

  async function getCurrentUser(token) {
    return genesysFetch("/api/v2/users/me?expand=authorization", { token });
  }

  function getCommunicationArrays(participant) {
    if (!participant) return [];
    return [participant.messages, participant.message, participant.communications, participant.chats].filter(Array.isArray);
  }

  function isConnectedState(state) {
    return C.safeString(state).toLowerCase() === "connected";
  }

  function isUsableSendState(state) {
    // Message send must be connected. Keep this strict to avoid HTTP 400 "only connected communications".
    return isConnectedState(state);
  }

  function getParticipantUserId(participant) {
    if (!participant) return "";
    return C.safeString(
      participant.userId ||
      participant.user && participant.user.id ||
      participant.user && participant.user.userId ||
      participant.userUri && String(participant.userUri).split("/").pop() ||
      ""
    );
  }

  function isAgentParticipant(participant) {
    const purpose = C.safeString(participant && participant.purpose).toLowerCase();
    return purpose === "agent" || purpose === "acd" || purpose === "user" || purpose === "internal";
  }

  function extractCommunicationFromParticipant(participant, options) {
    options = options || {};
    const preferredId = C.safeString(options.preferredId);
    const connectedOnly = options.connectedOnly === true;
    const arrays = getCommunicationArrays(participant);

    if (preferredId) {
      for (const arr of arrays) {
        const item = arr.find(x => x && C.safeString(x.id) === preferredId);
        if (item && item.id && (!connectedOnly || isUsableSendState(item.state))) return item;
      }
    }

    for (const arr of arrays) {
      const connected = arr.find(x => x && x.id && isUsableSendState(x.state));
      if (connected) return connected;
    }

    if (!connectedOnly) {
      for (const arr of arrays) {
        const firstWithId = arr.find(x => x && x.id);
        if (firstWithId) return firstWithId;
      }
    }

    return null;
  }

  function extractCommunicationIdFromParticipant(participant) {
    const item = extractCommunicationFromParticipant(participant, { connectedOnly: false });
    return item && item.id ? item.id : "";
  }

  function extractConnectedCommunicationIdFromParticipant(participant, preferredId) {
    const item = extractCommunicationFromParticipant(participant, { connectedOnly: true, preferredId });
    return item && item.id ? item.id : "";
  }

  function extractBestCommunicationId(conversation, preferredPurpose) {
    const participants = Array.isArray(conversation && conversation.participants) ? conversation.participants : [];
    const purposes = preferredPurpose ? [preferredPurpose] : ["customer", "external", "agent"];
    for (const purpose of purposes) {
      for (const p of participants) {
        if (C.safeString(p && p.purpose).toLowerCase() !== purpose) continue;
        const id = extractCommunicationIdFromParticipant(p);
        if (id) return id;
      }
    }
    for (const p of participants) {
      const id = extractCommunicationIdFromParticipant(p);
      if (id) return id;
    }
    return "";
  }

  function findParticipantByCommunicationId(conversation, communicationId) {
    const participants = Array.isArray(conversation && conversation.participants) ? conversation.participants : [];
    const target = C.safeString(communicationId);
    if (!target) return null;
    return participants.find(function (p) {
      return getCommunicationArrays(p).some(function (arr) {
        return arr.some(x => x && C.safeString(x.id) === target);
      });
    }) || null;
  }

  function findParticipantById(conversation, participantId) {
    const participants = Array.isArray(conversation && conversation.participants) ? conversation.participants : [];
    const target = C.safeString(participantId);
    if (!target) return null;
    return participants.find(p => C.safeString(p && p.id) === target) || null;
  }

  function findOwnedConnectedAgentParticipant(conversation, currentUserId, options) {
    options = options || {};
    const participants = Array.isArray(conversation && conversation.participants) ? conversation.participants : [];
    const userId = C.safeString(currentUserId);
    const preferredParticipantId = C.safeString(options.agentParticipantId || options.participantId);
    const preferredCommunicationId = C.safeString(options.agentCommunicationId || options.communicationId);

    function isOwned(p) {
      return !!p && isAgentParticipant(p) && (!!userId && getParticipantUserId(p) === userId);
    }

    // 1. v1.7.5: Prefer Agent Script communication values first.
    // Some Genesys message conversation payloads do not expose user ownership clearly,
    // so do not block if the URL communication is present under an agent-like participant and connected.
    if (preferredCommunicationId) {
      const p = findParticipantByCommunicationId(conversation, preferredCommunicationId);
      if (p && isAgentParticipant(p)) {
        const id = extractConnectedCommunicationIdFromParticipant(p, preferredCommunicationId);
        if (id) return { participant: p, communicationId: id, source: "URL_COMM_SCRIPT_CONNECTED" };
      }
    }

    // 2. Prefer the URL participant id when it has a connected agent-like communication.
    if (preferredParticipantId) {
      const p = findParticipantById(conversation, preferredParticipantId);
      if (p && isAgentParticipant(p)) {
        const id = extractConnectedCommunicationIdFromParticipant(p, preferredCommunicationId);
        if (id) return { participant: p, communicationId: id, source: "URL_PARTICIPANT_SCRIPT_CONNECTED" };
      }
    }

    // 3. Find any connected agent participant owned by logged-in user.
    for (const p of participants) {
      if (!isOwned(p)) continue;
      const id = extractConnectedCommunicationIdFromParticipant(p, "");
      if (id) return { participant: p, communicationId: id, source: "CURRENT_USER_CONNECTED_AGENT" };
    }

    return null;
  }

  async function resolveCommunicationContext(token, conversationId, options) {
    options = options || {};
    const conversation = await getMessageConversation(token, conversationId);

    let customerCommunicationId = C.safeString(options.customerCommunicationId);
    if (!customerCommunicationId) {
      customerCommunicationId = extractBestCommunicationId(conversation, "customer") || extractBestCommunicationId(conversation, "external") || extractBestCommunicationId(conversation);
    }

    let agentCommunicationId = C.safeString(options.agentCommunicationId);
    let agentParticipantId = C.safeString(options.agentParticipantId || options.participantId);

    if (agentCommunicationId) {
      const agentParticipant = findParticipantByCommunicationId(conversation, agentCommunicationId);
      if (agentParticipant && !agentParticipantId) agentParticipantId = C.safeString(agentParticipant.id);
    }

    if (!agentCommunicationId && agentParticipantId) {
      const agentParticipant = findParticipantById(conversation, agentParticipantId);
      agentCommunicationId = extractCommunicationIdFromParticipant(agentParticipant);
    }

    return {
      conversation,
      customerCommunicationId,
      agentCommunicationId,
      agentParticipantId
    };
  }

  async function resolveOwnedAgentCommunicationContext(token, conversationId, options) {
    options = options || {};
    const user = await getCurrentUser(token);
    const conversation = await getMessageConversation(token, conversationId);
    const owned = findOwnedConnectedAgentParticipant(conversation, user && user.id, options);

    let customerCommunicationId = C.safeString(options.customerCommunicationId);
    if (!customerCommunicationId) {
      customerCommunicationId = extractBestCommunicationId(conversation, "customer") || extractBestCommunicationId(conversation, "external") || extractBestCommunicationId(conversation);
    }

    if (!owned || !owned.communicationId) {
      const userText = C.safeString(user && (user.name || user.email || user.id)) || "current user";
      throw new Error("No connected agent communication could be resolved for this conversation. Script values may be stale/disconnected, and no owned connected fallback was found for " + userText + ".");
    }

    return {
      conversation,
      user,
      customerCommunicationId,
      agentCommunicationId: owned.communicationId,
      agentParticipantId: C.safeString(owned.participant && owned.participant.id),
      source: owned.source
    };
  }

  async function sendMessage(token, conversationId, communicationId, textBody) {
    return genesysFetch(
      "/api/v2/conversations/messages/" + encodeURIComponent(conversationId) +
      "/communications/" + encodeURIComponent(communicationId) + "/messages",
      {
        token,
        method: "POST",
        body: JSON.stringify({ textBody: textBody })
      }
    );
  }

  async function setParticipantAttributes(token, conversationId, participantId, attributes) {
    return genesysFetch(
      "/api/v2/conversations/messages/" + encodeURIComponent(conversationId) +
      "/participants/" + encodeURIComponent(participantId) + "/attributes",
      {
        token,
        method: "PATCH",
        body: JSON.stringify({ attributes: attributes || {} })
      }
    );
  }

  global.GenesysApi = {
    genesysFetch,
    getMessageConversation,
    extractCommunicationIdFromParticipant,
    extractConnectedCommunicationIdFromParticipant,
    extractBestCommunicationId,
    findParticipantByCommunicationId,
    findOwnedConnectedAgentParticipant,
    resolveCommunicationContext,
    resolveOwnedAgentCommunicationContext,
    sendMessage,
    setParticipantAttributes,
    getCurrentUser
  };
})(window);
