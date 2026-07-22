"use server"

export async function verifyAdminSecret(secret: string): Promise<boolean> {
  const adminSecret = process.env.LINEUP_ADMIN_SECRET
  
  if (!adminSecret) {
    console.error("[v0] LINEUP_ADMIN_SECRET not set")
    return false
  }

  // Use constant-time comparison to prevent timing attacks
  const secretBuffer = Buffer.from(secret)
  const adminBuffer = Buffer.from(adminSecret)
  
  if (secretBuffer.length !== adminBuffer.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < secretBuffer.length; i++) {
    result |= secretBuffer[i] ^ adminBuffer[i]
  }

  return result === 0
}
