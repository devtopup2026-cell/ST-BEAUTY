import crypto from "crypto";

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  role: string;
  exp: number;
};

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }

  return secret;
}

export function createAdminSessionToken(
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
  }
) {
  const payload: AdminSession = {
    ...admin,

    // 8 ชั่วโมง
    exp: Date.now() + 1000 * 60 * 60 * 8,
  };

  const encodedPayload = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string
): AdminSession | null {
  try {
    const [encodedPayload, signature] =
      token.split(".");

    if (!encodedPayload || !signature) {
      return null;
    }

    const expectedSignature = crypto
      .createHmac("sha256", getSecret())
      .update(encodedPayload)
      .digest("base64url");

    const signatureBuffer =
      Buffer.from(signature);

    const expectedBuffer =
      Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !==
      expectedBuffer.length
    ) {
      return null;
    }

    const validSignature =
      crypto.timingSafeEqual(
        signatureBuffer,
        expectedBuffer
      );

    if (!validSignature) {
      return null;
    }

    const session = JSON.parse(
      Buffer.from(
        encodedPayload,
        "base64url"
      ).toString("utf8")
    ) as AdminSession;

    if (Date.now() > session.exp) {
      return null;
    }

    return session;

  } catch {
    return null;
  }
}
