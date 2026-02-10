# 로컬 변경사항 백업 후 push
# 사용법: .\scripts\backup-before-push.ps1

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$backupBranch = "backup-$timestamp"

Write-Host "=== 백업 브랜치 생성: $backupBranch ===" -ForegroundColor Cyan
git branch $backupBranch

Write-Host "`n=== 현재 브랜치 확인 ===" -ForegroundColor Cyan
git branch -v

Write-Host "`n=== push 진행 (`git push origin main`) ===" -ForegroundColor Cyan
git push origin main

Write-Host "`n=== 완료 ===" -ForegroundColor Green
Write-Host "백업 브랜치 '$backupBranch' 에 현재 상태가 저장되었습니다."
Write-Host "문제 발생 시: git checkout $backupBranch"
