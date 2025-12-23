export const mongoInjectionBlock = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    for (const key in obj) {
      if (key.startsWith("$")) {
        delete obj[key];
      }
      if (key.includes(".")) {
        delete obj[key];
      }
      if (typeof obj[key] === "object") {
        sanitize(obj[key]);
      }
    }
    return obj;
  };

  sanitize(req.body);
  sanitize(req.params);

  const queryCopy = JSON.parse(JSON.stringify(req.query));
  sanitize(queryCopy);
  req._sanitizedQuery = queryCopy;
  next();
};
