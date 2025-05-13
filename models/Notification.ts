import mongoose, { Schema, model, Model } from 'mongoose';
import { Notification } from '@/types';

const notificationSchema: Schema<Notification> = new Schema({
  type: {
    type: String,
    enum: ['task_assigned', 'task_updated'],
    required: true,
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default (mongoose.models.Notification || model<Notification>('Notification', notificationSchema)) as Model<Notification>;