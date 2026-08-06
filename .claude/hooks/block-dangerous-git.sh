#!/bin/bash
# Chặn cứng các lệnh git nguy hiểm TRƯỚC KHI chạy (PreToolUse hook cho tool Bash).
# Nguồn tham khảo: mattpocock/skills (skills/misc/git-guardrails-claude-code).
# Không dùng "--no-verify" để né hook này — hook nằm ngoài git, không liên quan commit hook.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

DANGEROUS_PATTERNS=(
  "git reset --hard"
  "git clean -fd"
  "git clean -f"
  "git branch -D"
  "git checkout \."
  "git restore \."
  "push --force"
  "reset --hard"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: lệnh '$COMMAND' khớp mẫu nguy hiểm '$pattern'. Người dùng chưa cho phép chạy lệnh này — hỏi trực tiếp người dùng trước." >&2
    exit 2
  fi
done

exit 0
