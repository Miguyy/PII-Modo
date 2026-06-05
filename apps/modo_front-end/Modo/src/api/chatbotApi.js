const ENDPOINT =
  '/api/chatbot/agent-chat/api/v1/agent/cmor5objoex9gfp01vm7p95jh/stream'
const API_KEY = 'sk-usr-k5mhlpztihb5wigy7web8tz893mn2yyk0y'
const CHANNEL_ID = 'cmq0r4old15tinr01ki1zxzuk'

/**
 * Sends a message to the IAedu agent and returns the full reply as a string.
 *
 * @param {string} message              - The user's current message
 * @param {string} threadId             - Stable conversation thread ID (one per chat session)
 * @param {object} userInfo             - Live user data (points, level, username, role…)
 * @param {object} userContext          - Project knowledge base context
 * @param {boolean} isFirstMessage      - If true, forcefully inject context into the message prompt
 * @returns {Promise<string>}           - The assistant's full reply
 */
export async function sendChatMessage(message, threadId, userInfo = {}, userContext = {}, isFirstMessage = false) {
  const formData = new FormData()

  formData.append('channel_id', CHANNEL_ID)
  formData.append('thread_id', threadId)

  // Combine userInfo and userContext. The API might only be injecting user_info into the system prompt!
  const enrichedUserInfo = {
    ...userInfo,
    project_context: JSON.stringify(userContext)
  }

  // user_info: who the user is (the API requires this field)
  formData.append('user_info', JSON.stringify(enrichedUserInfo))

  // user_context: inject the project knowledge base here so the agent
  // knows about Modo's features, rules, glossary, etc.
  formData.append('user_context', JSON.stringify(userContext))

  // HARD INJECTION: If the API agent ignores the user_context fields, 
  // we force the context into the actual text prompt on the very first message!
  let finalMessage = message
  if (isFirstMessage) {
    const contextPayload = JSON.stringify(userContext, null, 2)
    finalMessage = `[INSTRUÇÕES DO SISTEMA E CONTEXTO DO PROJETO]\nEstás a atuar como o assistente virtual deste projeto. Usa a base de conhecimento abaixo para responder à pergunta do utilizador. Não inventes funcionalidades fora deste contexto.\n\n[BASE DE CONHECIMENTO]\n${contextPayload}\n\n[DADOS DO UTILIZADOR]\n${JSON.stringify(userInfo)}\n\n[PERGUNTA DO UTILIZADOR]\n${message}`
  }

  formData.append('message', finalMessage)

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      // Do NOT set Content-Type manually with FormData — the browser sets it
      // automatically with the correct multipart boundary.
      'x-api-key': API_KEY,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`IAedu API error: ${response.status} ${response.statusText}`)
  }

  // The endpoint streams NDJSON lines like:
  // {"run_id":"...","type":"token","content":"A"}
  // {"run_id":"...","type":"message","content":{...}}
  // {"run_id":"...","type":"done","content":"..."}
  // We read the stream and concatenate all "token" payloads.
  return readStream(response)
}

/**
 * Reads the NDJSON stream and returns the full assembled reply.
 * Falls back to the final "message" block if token streaming fails.
 *
 * @param {Response} response
 * @returns {Promise<string>}
 */
async function readStream(response) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let assembled = ''
  let fallbackMessage = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    // Keep the last (possibly incomplete) line in the buffer
    buffer = lines.pop()

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      try {
        const event = JSON.parse(trimmed)

        if (event.type === 'token') {
          assembled += event.content ?? ''
        }

        if (event.type === 'message' && event.content?.content) {
          // Full message as fallback (already the complete reply)
          fallbackMessage = event.content.content
        }
      } catch {
        // Ignore malformed lines
      }
    }
  }

  // Prefer the streamed tokens; fall back to the message block
  return assembled.trim() || fallbackMessage.trim()
}