/**
 * API 학년 코드(FIRST, SECOND, THIRD 등) → 화면 표시 라벨
 * 멘티 대시보드, /mentor, 멘티 상세 등에서 사용
 */
export function getGradeLabel(grade: string): string {
  const g = (grade || '').toUpperCase().trim();
  if (g === 'FIRST') return '고1';
  if (g === 'SECOND') return '고2';
  if (g === 'THIRD') return '고3';
  if (g === '') return '';
  return 'N수';
}
