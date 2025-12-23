import express from 'express';
import 'dotenv/config';
import morgan from 'morgan';
import connectDB from './config/connectDB.js';
import setRoute from './routes/routes.js';
import { securityMiddlewares } from './middlewares/security.js';
import { mongoInjectionBlock } from './middlewares/mongoInjectionBlock.js';
import { xssSanitizer } from './middlewares/xssSanitizer.js'

const app = express()
const port = process.env.PORT || 3000;

const middlewares = [
    morgan("dev"),
    express.json(),
    express.urlencoded({ extended: true }),
    mongoInjectionBlock,
    xssSanitizer,
];
app.use(...middlewares);
app.use(securityMiddlewares);

setRoute(app);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Page not found" });
});
// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(port, () => {
    try {
        console.log(`Server is running on port ${port}`);
        connectDB();
    } catch (error) {
        console.log(error.message);
    };
});