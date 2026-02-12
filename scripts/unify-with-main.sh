#!/usr/bin/env bash
set -euo pipefail

main_branch="${1:-main}"
mode="${2:-merge}" # merge | rebase

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not inside a git repository." >&2
  exit 1
fi

if ! git show-ref --verify --quiet "refs/heads/${main_branch}"; then
  echo "Main branch '${main_branch}' does not exist locally." >&2
  echo "Tip: create it with 'git branch ${main_branch}' or fetch it from remote." >&2
  exit 1
fi

current_branch="$(git branch --show-current)"

mapfile -t diverged < <(
  git for-each-ref --format='%(refname:short)' refs/heads \
    | grep -v "^${main_branch}$" \
    | while read -r branch; do
        read -r ahead behind < <(git rev-list --left-right --count "${main_branch}...${branch}")
        # rev-list outputs: left(main ahead) right(branch ahead)
        if [[ "${ahead}" -gt 0 && "${behind}" -gt 0 ]]; then
          echo "${branch} ${behind} ${ahead}"
        fi
      done
)

if [[ ${#diverged[@]} -eq 0 ]]; then
  echo "No branches are both ahead of and behind ${main_branch}."
  exit 0
fi

echo "Diverged branches vs ${main_branch}:"
for line in "${diverged[@]}"; do
  branch="$(awk '{print $1}' <<<"${line}")"
  ahead="$(awk '{print $2}' <<<"${line}")"
  behind="$(awk '{print $3}' <<<"${line}")"
  echo "- ${branch}: ${ahead} commit(s) ahead, ${behind} commit(s) behind"
done

for line in "${diverged[@]}"; do
  branch="$(awk '{print $1}' <<<"${line}")"

  git checkout "${branch}" >/dev/null

  if [[ "${mode}" == "rebase" ]]; then
    git rebase "${main_branch}"
  else
    git merge --no-edit "${main_branch}"
  fi
done

git checkout "${current_branch}" >/dev/null

echo "Done. Updated ${#diverged[@]} branch(es) using '${mode}' strategy."
