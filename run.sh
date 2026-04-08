#!/bin/bash

# 단위 변환 웹 서비스 실행 스크립트
# 사용법: ./run.sh
# 포트 지정: PORT=3000 ./run.sh

# 기본 포트 설정 (환경변수 PORT로 오버라이드 가능)
PORT=${PORT:-8080}

# Python3 설치 여부 확인
if ! command -v python3 &>/dev/null; then
    echo "[오류] Python3가 설치되어 있지 않습니다."
    echo "  - macOS:  brew install python3"
    echo "  - Ubuntu: sudo apt install python3"
    exit 1
fi

# 접속 URL 출력
echo "========================================"
echo "  단위 변환 웹 서비스를 시작합니다."
echo "  접속 URL: http://localhost:${PORT}"
echo "  종료하려면 Ctrl+C 를 누르세요."
echo "========================================"

# OS를 감지하여 브라우저 자동 열기 시도
# 브라우저 실행은 서버 시작 직후 백그라운드에서 수행
open_browser() {
    local url="http://localhost:${PORT}"

    # macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$url" &
    # Windows (Git Bash / WSL)
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        start "$url" &
    # Linux
    elif command -v xdg-open &>/dev/null; then
        xdg-open "$url" &
    else
        echo "[안내] 브라우저를 자동으로 열 수 없습니다. 직접 접속해 주세요: http://localhost:${PORT}"
    fi
}

# 서버 시작 후 잠시 대기하고 브라우저 열기
# (sleep 1 && open_browser) &

# Python3 내장 HTTP 서버로 현재 디렉토리를 서빙
python3 -m http.server "${PORT}"
