import DOMPurify from "isomorphic-dompurify";

export const xssSanitizer = (req, res, next) => {
  const sanitize = (data) => {
    if (typeof data === "string") {
      return DOMPurify.sanitize(data);
    }
    if (typeof data === "object" && data !== null) {
      for (let key in data) {
        data[key] = sanitize(data[key]);
      }
    }
    return data;
  };

  req.body = sanitize(req.body);
  req.params = sanitize(req.params);
  
  next();
};
