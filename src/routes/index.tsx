import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { MenteeLayout } from '@/components/layouts/MenteeLayout';
import { MentorLayout } from '@/components/layouts/MentorLayout';
import { ProtectedRoute } from '@/components/layouts/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import {
  AssignmentDetailPage,
  AssignmentListPage,
  FeedbackDetailPage,
  FeedbackListPage,
  MenteeMainPage,
  MyPage,
  NotificationPage,
  SettingsPage,
} from '@/pages/mentee';
import {
  AssignmentManagePage,
  AssignmentRegisterPage,
  FeedbackManagePage,
  FeedbackWritePage,
  MenteeDetailPage,
  MentorMainPage,
  PlannerManagePage,
  TemplatesPage,
} from '@/pages/mentor';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ------ 멘토 라우트 ------ */}
        <Route element={<ProtectedRoute allowedRole="mentor" />}>
          <Route element={<MentorLayout />}>
            <Route path="/mentor" element={<MentorMainPage />} />
            <Route path="/mentor/mentees/:menteeId" element={<MenteeDetailPage />} />
            <Route path="/mentor/assignments/new" element={<AssignmentRegisterPage />} />
            <Route
              path="/mentor/mentees/:menteeId/assignments/new"
              element={<AssignmentRegisterPage />}
            />
            <Route
              path="/mentor/mentees/:menteeId/feedback/:assignmentId"
              element={<FeedbackWritePage />}
            />
            <Route path="/mentor/feedback/:assignmentId" element={<FeedbackWritePage />} />
            <Route path="/mentor/assignments" element={<AssignmentManagePage />} />
            <Route path="/mentor/planner" element={<PlannerManagePage />} />
            <Route path="/mentor/feedback" element={<FeedbackManagePage />} />
            <Route path="/mentor/templates" element={<TemplatesPage />} />
          </Route>
        </Route>

        {/* ------ 멘티 라우트 ------ */}
        <Route element={<ProtectedRoute allowedRole="mentee" />}>
          <Route element={<MenteeLayout />}>
            <Route path="/mentee" element={<MenteeMainPage />} />
            <Route path="/mentee/assignments" element={<AssignmentListPage />} />
            <Route path="/mentee/assignments/:assignmentId" element={<AssignmentDetailPage />} />
            <Route path="/mentee/feedback" element={<FeedbackListPage />} />
            <Route path="/mentee/feedback/:feedbackId" element={<FeedbackDetailPage />} />
            <Route path="/mentee/notifications" element={<NotificationPage />} />
            <Route path="/mentee/mypage" element={<MyPage />} />
            <Route path="/mentee/mypage/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
