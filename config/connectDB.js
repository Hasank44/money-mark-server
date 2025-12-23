import mongoose from "mongoose";
const db_url = process.env.DB_URL;

const connectDB = () => {
    mongoose.connect(db_url, {})
        .then(() => {
            console.log('Database is Connected');
        }).catch((err) => {
            console.log(err)
            console.log('Database connect failed');
        });
};

export default connectDB;