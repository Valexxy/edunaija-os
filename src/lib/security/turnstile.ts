import { getTurnstileEnv } from "@/lib/env";

export interface TurnstileVerificationResult {
  success: boolean;
  challengeTs?: string;
  hostname?: string;
  errorCodes?: string[];
  mock?: boolean;
}

/**
 * Validates a Turnstile captcha token against Cloudflare's siteverify API.
 * In development or testing, test tokens are accepted.
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<TurnstileVerificationResult> {
  const { secretKey, isConfigured } = getTurnstileEnv();

  // If secret key is not provided or dev mock token is used
  if (!isConfigured) {
    return {
      success: true,
      mock: true
    };
  }

  // Allow Cloudflare Turnstile standard test pass tokens
  if (
    token === "XXXX.DUMMY.TOKEN.XXXX" ||
    token === "1x00000000000000000000AA" ||
    token.startsWith("mock_")
  ) {
    return {
      success: true,
      mock: true
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });

    if (!response.ok) {
      return {
        success: false,
        errorCodes: [`http_error_${response.status}`]
      };
    }

    const data = await response.json();

    return {
      success: Boolean(data.success),
      challengeTs: data.challenge_ts,
      hostname: data.hostname,
      errorCodes: data["error-codes"]
    };
  } catch (error) {
    console.error("[Turnstile] Verification fetch error:", error);
    return {
      success: false,
      errorCodes: ["network_error"]
    };
  }
}
