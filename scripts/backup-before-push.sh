#!/bin/bash
# 로컬 변경사항 백업 후 push
# 사용법: bash scripts/backup-before-push.sh

TIMESTAMP=$(date +%Y%m%d-%H%M)
BACKUP_BRANCH="backup-$TIMESTAMP"

echo "=== 백업 브랜치 생성: $BACKUP_BRANCH ==="
git branch $BACKUP_BRANCH

echo ""
echo "=== 현재 브랜치 확인 ==="
git branch -v

echo ""
echo "=== push 진행 ==="
git push origin main

echo ""
echo "=== 완료 ==="
echo "백업 브랜치 '$BACKUP_BRANCH' 에 현재 상태가 저장되었습니다."
echo "문제 발생 시: git checkout $BACKUP_BRANCH"
