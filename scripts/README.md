# Git 백업 스크립트

## push 전 백업 (로컬 변경사항 보존)

### 방법 1: 스크립트 실행

**PowerShell (Windows):**
```powershell
.\scripts\backup-before-push.ps1
```

**Git Bash / 터미널:**
```bash
bash scripts/backup-before-push.sh
```

### 방법 2: 직접 명령어

```bash
# 1. 현재 상태를 백업 브랜치로 저장
git branch backup-$(date +%Y%m%d-%H%M)

# 2. push
git push origin main
```

### 복구 (문제 발생 시)

```bash
git checkout backup-20260209-1500   # 백업 브랜치 이름으로
```
