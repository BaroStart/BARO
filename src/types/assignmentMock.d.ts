export {};

declare global {
  interface Assignment {
    // 멘티 과제 라우팅/목데이터는 "a1" 같은 string id를 사용
    id: string;
    subject: string;
    title: string;
    description: string;
    submissionDate: string;
    status: string;
  }
}
