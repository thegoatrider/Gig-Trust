#!/bin/bash
set -e

WORKSPACE_DIR="/Users/ananyapandey/Documents/GigTrust"
NODE_VERSION="v20.15.0"
NODE_DIR="${WORKSPACE_DIR}/.node-dist"

echo "Setting up local Node.js environment..."
echo "Target directory: ${NODE_DIR}"

# Create directory
mkdir -p "${NODE_DIR}"

# Download Node.js macOS ARM64 tarball
URL="https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-darwin-arm64.tar.gz"
echo "Downloading Node.js from ${URL}..."
curl -L "${URL}" -o "${WORKSPACE_DIR}/node-temp.tar.gz"

echo "Extracting archive..."
tar -xzf "${WORKSPACE_DIR}/node-temp.tar.gz" -C "${NODE_DIR}" --strip-components=1

echo "Cleaning up temp files..."
rm "${WORKSPACE_DIR}/node-temp.tar.gz"

echo "Verifying local Node.js installation..."
"${NODE_DIR}/bin/node" -v
"${NODE_DIR}/bin/npm" -v

echo "Node.js successfully installed locally."
