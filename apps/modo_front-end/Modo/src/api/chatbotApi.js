export async function sendChatMessage(messages, systemContext) {
  const endpoint = 'https://api.iaedu.pt/agent-chat//api/v1/agent/cmor5objoex9gfp01vm7p95jh/stream'

  const formData = new FormData()

  // Required Fields
  formData.append('channel_id', 'cmq0r4old15tinr01ki1zxzuk')
  formData.append('thread_id', 'dwXpG9MVwwArE25tB108b') // In production, generate a unique thread_id per user session
  
  // Pass the systemContext into the user_info or user_context
  formData.append('user_info', JSON.stringify({ context: systemContext })) 
  
  // The API expects a 'message' string, so we grab the latest user message
  const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : 'Hello'
  formData.append('message', lastMessage)

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': 'sk-usr-k5mhlpztihb5wigy7web8tz893mn2yyk0y',
    },
    body: formData,
  })
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  // The endpoint is /stream, so it likely returns Server-Sent Events (SSE).
  // For simplicity since Chatbot.vue expects a final string, we read the full text,
  // parse the SSE 'data:' lines, and concatenate them.
  const rawText = await response.text()
  
  try {
    // Parse SSE lines. Assumes format: data: {"text":"..."} 
    // or simply data: text
    let fullReply = ''
    const lines = rawText.split('\n')
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.replace('data: ', '').trim()
        if (dataStr === '[DONE]') continue
        try {
          const parsed = JSON.parse(dataStr)
          // Some APIs return the delta in parsed.text, parsed.content, or similar
          fullReply += parsed.text || parsed.content || dataStr
        } catch (e) {
          // If not JSON, just append the raw string
          fullReply += dataStr
        }
      }
    }
    
    // Fallback if no SSE 'data:' prefix was found
    if (!fullReply) {
      return rawText
    }
    return fullReply
  } catch (e) {
    return rawText
  }
}
