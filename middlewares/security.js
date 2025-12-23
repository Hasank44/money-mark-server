import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";
import compression from "compression";

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
    },
  },
  frameguard: { action: "deny" },
  noSniff: true,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. try-again!",
});
export const compressionSecurity = compression({ level: 6 });

export const corsSecurity = cors({
  origin: [process.env.FRONT_URL, process.env.ADMIN_URL],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
});

export const preventHPP = hpp();
export const blockMongoOperators = (req, res, next) => {
  const hasUnsafeKey = obj =>
    obj &&
    typeof obj === "object" &&
    Object.keys(obj).some(key => key.startsWith("$") || key.includes("."));

  if (
    hasUnsafeKey(req.body) ||
    hasUnsafeKey(req.params) ||
    hasUnsafeKey(req.query)
  ) {
    return res.status(400).json({
      success: false,
      message: "Unsafe MongoDB operator detected!",
    });
  }
  next();
};
export const securityMiddlewares = [
  securityHeaders,
  apiLimiter,
  compressionSecurity,
  corsSecurity,
  preventHPP,
  blockMongoOperators,
];
