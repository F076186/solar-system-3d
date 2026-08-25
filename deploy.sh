#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  deploy.sh – Build, push, and deploy the Solar System 3D app to OpenShift
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PROJECT="solar-system"
APP="solar-system-3d"
REGISTRY="image-registry.openshift-image-registry.svc:5000"
IMAGE="${REGISTRY}/${PROJECT}/${APP}:latest"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🪐 Solar System 3D — OpenShift Deployment"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ── 1. Verify oc login ────────────────────────────────────────────────────────
echo "[1/6] Checking OpenShift login..."
oc whoami || { echo "❌  Not logged in. Run: oc login <cluster-url>"; exit 1; }

# ── 2. Create / switch project ────────────────────────────────────────────────
echo "[2/6] Setting up project '${PROJECT}'..."
oc get project "${PROJECT}" &>/dev/null \
  && echo "  → Project exists, switching..." \
  || oc new-project "${PROJECT}" --description="Solar System 3D App" --display-name="Solar System 3D"
oc project "${PROJECT}"

# ── 3. Build image with OpenShift S2I / Docker strategy ──────────────────────
echo "[3/6] Building image on OpenShift (binary build)..."
# Create BuildConfig if it doesn't exist
oc get bc "${APP}" &>/dev/null || oc new-build \
  --strategy=docker \
  --name="${APP}" \
  --binary \
  --to="${APP}:latest"

# Pipe the build context from local directory
oc start-build "${APP}" --from-dir="${SCRIPT_DIR}" --follow --wait

# ── 4. Apply manifests ────────────────────────────────────────────────────────
echo "[4/6] Applying Kubernetes manifests..."
oc apply -f "${SCRIPT_DIR}/k8s/deployment.yaml"
oc apply -f "${SCRIPT_DIR}/k8s/service.yaml"
oc apply -f "${SCRIPT_DIR}/k8s/route.yaml"

# ── 5. Rollout ────────────────────────────────────────────────────────────────
echo "[5/6] Waiting for rollout..."
oc rollout status deployment/"${APP}" --timeout=120s

# ── 6. Print URL ──────────────────────────────────────────────────────────────
echo "[6/6] Retrieving application URL..."
ROUTE=$(oc get route "${APP}" -o jsonpath='{.spec.host}' 2>/dev/null || echo "")
if [ -n "${ROUTE}" ]; then
  echo ""
  echo "  ✅  Deployment successful!"
  echo ""
  echo "  🌐  Application URL: https://${ROUTE}"
  echo ""
else
  echo "  ⚠️   Route not found — check: oc get routes"
fi
echo "═══════════════════════════════════════════════════════════"
