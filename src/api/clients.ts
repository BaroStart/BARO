import {
  AdminControllerApi,
  AssignmentAPIApi,
  AssignmentTemplateAPIApi,
  AuthAPIApi,
  BadgeAPIApi,
  CommentAPIApi,
  Configuration,
  ExampleAPIApi,
  FeedbackAPIApi,
  FeedbackTemplateAPIApi,
  LearningResourceAPIApi,
  NotificationAPIApi,
  MenteeAPIApi,
  ObjectStorageAPIApi,
  ToDoAPIApi,
} from '@/generated';

import axiosInstance from './axiosInstance';

const config = new Configuration();

export const adminApi = new AdminControllerApi(config, '', axiosInstance);
export const assignmentsApi = new AssignmentAPIApi(config, '', axiosInstance);
export const authApi = new AuthAPIApi(config, '', axiosInstance);
export const badgeApi = new BadgeAPIApi(config, '', axiosInstance);
export const commentsApi = new CommentAPIApi(config, '', axiosInstance);
export const examplesApi = new ExampleAPIApi(config, '', axiosInstance);
export const menteeApi = new MenteeAPIApi(config, '', axiosInstance);
export const storagesApi = new ObjectStorageAPIApi(config, '', axiosInstance);
export const todosApi = new ToDoAPIApi(config, '', axiosInstance);
export const assignmentTemplatesApi = new AssignmentTemplateAPIApi(config, '', axiosInstance);
export const feedbacksApi = new FeedbackAPIApi(config, '', axiosInstance);
export const feedbackTemplatesApi = new FeedbackTemplateAPIApi(config, '', axiosInstance);
export const notificationsApi = new NotificationAPIApi(config, '', axiosInstance);
export const learningResourcesApi = new LearningResourceAPIApi(config, '', axiosInstance);
