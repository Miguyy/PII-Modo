export async function chatWithBot(message) {
  const endpoint = 'https://api.iaedu.pt/agent-chat//api/v1/agent/cmor5objoex9gfp01vm7p95jh/stream'

  const formData = new FormData()

  // Required Fields
  formData.append('channel_id', 'cmq0r4old15tinr01ki1zxzuk')
  formData.append('thread_id', 'dwXpG9MVwwArE25tB108b')
  formData.append('user_info', '{}') // Mandatory field, where you can enter user information
  formData.append('message', message || 'What is the value of X?')

  // Optionally you can add these fields:
  // user_id: string
  // user_context: string object with any key-value pairs
  // image: File
  // Check documentation for more examples.

  // Note: For fetch with FormData, you should NOT manually set 'Content-Type': 'multipart/form-data'. 
  // The browser automatically sets it with the correct boundary boundary string.
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': 'sk-usr-k5mhlpztihb5wigy7web8tz893mn2yyk0y',
    },
    body: formData,
  })
  
  return response
}
