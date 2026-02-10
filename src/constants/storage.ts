export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  SAVED_ID: 'savedId',
  SIGNUP_NAME_BY_LOGIN_ID: 'signupNameByLoginId',
  NOTIFICATIONS: 'notifications-storage',
  ASSIGNMENTS: 'assignments-storage',
  PLANNER_FEEDBACK: 'planner-feedback',
  MENTOR_FEEDBACK: 'mentor-feedback',
  PERSONAL_SCHEDULES: 'personal-schedules',
  // mentee badges / activity
  MENTEE_ATTENDANCE_DATES: 'mentee-attendance-dates',
  MENTEE_QNA_COUNT: 'mentee-qna-count',
  MENTEE_ASSIGNMENT_SUBMISSIONS: 'mentee-assignment-submissions',
  /** 사용자별 할 일 로컬 저장. 실제 키는 getMenteeTodosStorageKey(userId) 사용 */
  MENTEE_TODOS_BY_DATE_PREFIX: 'mentee-todos-by-date_',
  TIMETABLE_COLOR_PALETTE: 'mentee-timetable-color-palette',
  MENTEE_LAST_SEEN_BADGE_IDS: 'mentee-last-seen-badge-ids',
  GLOBAL_THEME: 'mentee-global-theme',
  MENTEE_PROFILE_IMAGE_LOCAL: 'mentee-profile-image-local',
  CUSTOM_BRAND_COLOR: 'mentee-custom-brand-color',
  REPRESENTATIVE_BADGE_ID: 'mentee-representative-badge-id',
} as const;
