import fs from 'fs'

async function test() {
  console.log("Attempting login...")
  const res = await fetch("http://localhost:3000/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@admin.com", password: "admin" })
  })
  
  console.log("Login status:", res.status)
  const data = await res.json()
  console.log("Login response:", data)

  if (data.token) {
    console.log("Fetching user...")
    const userRes = await fetch(`http://localhost:3000/users/${data.id_utilizador}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${data.token}` }
    })
    console.log("User fetch status:", userRes.status)
    const userData = await userRes.json()
    console.log("User data:", userData)
  }
}

test().catch(console.error)
