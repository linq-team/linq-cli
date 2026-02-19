#!/bin/sh
# Linq CLI installer
# Usage: curl -fsSL https://raw.githubusercontent.com/linq-team/linq-cli/main/install.sh | sh

set -e

REPO="linq-team/linq-cli"
INSTALL_DIR="/usr/local/bin"

main() {
  need_cmd curl
  need_cmd uname

  os=$(detect_os)
  arch=$(detect_arch)

  if [ "$os" = "windows" ]; then
    err "Windows is not supported by this installer. Download the .exe from https://github.com/${REPO}/releases/latest"
  fi

  tag=$(get_latest_tag)
  version="${tag#v}"

  asset=$(get_asset_name "$os" "$arch" "$version")
  url="https://github.com/${REPO}/releases/download/${tag}/${asset}"

  tmp_dir=$(mktemp -d)
  trap 'rm -rf "$tmp_dir"' EXIT

  info "Downloading linq ${version} for ${os}/${arch}..."
  curl -fSL --progress-bar "$url" -o "${tmp_dir}/${asset}"

  install_asset "$os" "${tmp_dir}/${asset}"

  info "Linq CLI ${version} installed successfully!"
  info "Run 'linq --help' to get started."
}

detect_os() {
  case "$(uname -s)" in
    Darwin*)  echo "mac" ;;
    Linux*)   echo "linux" ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
    *)        err "Unsupported operating system: $(uname -s)" ;;
  esac
}

detect_arch() {
  case "$(uname -m)" in
    x86_64|amd64)   echo "x64" ;;
    arm64|aarch64)   echo "arm64" ;;
    *)               err "Unsupported architecture: $(uname -m)" ;;
  esac
}

get_latest_tag() {
  tag=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/')
  if [ -z "$tag" ]; then
    err "Could not determine latest release. Check https://github.com/${REPO}/releases"
  fi
  echo "$tag"
}

get_asset_name() {
  os="$1"
  arch="$2"
  version="$3"

  case "${os}-${arch}" in
    mac-arm64)    echo "linq-${version}-mac-apple-silicon.pkg" ;;
    mac-x64)      echo "linq-${version}-mac-intel.pkg" ;;
    linux-x64)    echo "linq-${version}-linux-x64.deb" ;;
    linux-arm64)  echo "linq-${version}-linux-arm64.deb" ;;
    *)            err "No installer available for ${os}/${arch}" ;;
  esac
}

install_asset() {
  os="$1"
  file="$2"

  case "$os" in
    mac)
      info "Installing (you may be prompted for your password)..."
      sudo installer -pkg "$file" -target /
      ;;
    linux)
      info "Installing (you may be prompted for your password)..."
      sudo dpkg -i "$file"
      ;;
  esac
}

info() {
  printf '\033[1;32m%s\033[0m\n' "$1"
}

err() {
  printf '\033[1;31merror: %s\033[0m\n' "$1" >&2
  exit 1
}

need_cmd() {
  if ! command -v "$1" > /dev/null 2>&1; then
    err "need '$1' (command not found)"
  fi
}

main
