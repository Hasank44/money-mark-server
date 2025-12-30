import { Schema, model } from 'mongoose';

const taskAdminSchema = new Schema({
    setBy: {
        type: String,
        trim: true
    },
    limit: {
        type: Number,
        default: 1
    },
    used: {
        type: Number,
        default: 0
    },
    reward: {
        type: Number,
        default: 1
    },
    title: {
        type: String
    },
    work: {
        type: String
    },
    link: {
        type: String
    }
}, {
    timestamps: true
});

const TaskAdmin = model('TaskAdmin', taskAdminSchema);
export default TaskAdmin;