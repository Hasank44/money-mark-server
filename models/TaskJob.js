import { Schema, model } from 'mongoose';

const taskJobSchema = new Schema({
    userId: {
        type: String
    },
    taskId: {
        type: String,
    },
    title: {
        type: String,
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    description: {
        type: String,
        default: ''
    },
    reward: {
        type: Number
    },
    status: {
        type: String,
        default: 'Pending'
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const TaskJob = model('TaskJob', taskJobSchema);
export default TaskJob;