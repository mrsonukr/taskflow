import mongoose, { Schema, model, Model } from 'mongoose';
import { Task } from '@/types';

const taskSchema: Schema<Task> = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['To Do', 'In Process', 'Completed'],
    default: 'To Do',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference the User model
    required: true,
  },
  assignedTo: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference the User model
    },
  ],
});

// Export the Task model, ensuring it's only registered once
const TaskModel = (mongoose.models.Task || model<Task>('Task', taskSchema)) as Model<Task>;
export default TaskModel;