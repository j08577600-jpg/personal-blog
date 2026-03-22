#!/usr/bin/env bash
set -euo pipefail

mkdir -p certs

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout certs/localhost-key.pem \
  -out certs/localhost.pem \
  -days 365 \
  -subj "/CN=localhost"

echo "Self-signed certs generated in ./certs"
