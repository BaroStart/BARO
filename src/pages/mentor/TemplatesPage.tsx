import { Navigate } from 'react-router-dom';

/** 템플릿 관리는 피드백 관리 페이지로 통합됨 */
export function TemplatesPage() {
  return <Navigate to="/mentor/feedback?tab=templates" replace />;
}
