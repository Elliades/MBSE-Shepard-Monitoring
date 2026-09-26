---
name: deploy-mbse-shepard-monitoring
description: Deploy MBSE Shepard Monitoring to apps (port 3130). Use after app or Docker changes, when shipping code, or as the final step of implementation tasks unless read-only or the user opts out.
---

# Deploy MBSE Shepard Monitoring

Static Vite SPA on **apps** port **3130** (`mbse-shepard-monitoring:latest`).

## When to redeploy

Redeploy after changes under `src/`, `public/`, `index.html`, `vite.config.js`, `Dockerfile`, `docker-compose.yml`, or `nginx/`.

**Skip** for read-only work or if the user explicitly refuses deploy.

## Command

```powershell
cd C:\workspace\Apps-server
./provision/deploy-mbse-shepard-monitoring.ps1
```

Image already on the server:

```powershell
./provision/deploy-mbse-shepard-monitoring.ps1 -RedeployOnly
```

Override local repo path: `$env:MBSE_SHEPARD_MONITORING_ROOT = 'C:\workspace\mbse-shepard\MBSE-Shepard-Monitoring'`

## Verify

```powershell
./provision/apps.ps1 -Bash "curl -sf http://127.0.0.1:3130/api/health"
```

## Catalog (apps health)

Register in `c:\workspace\apps-directory\extras.yaml` (same pattern as SysML Spec QA), then redeploy the catalog:

```powershell
cd C:\workspace\Apps-server
./provision/deploy-apps-directory.ps1
```

Confirm: `curl -sf http://127.0.0.1:3070/api/services` lists **MBSE Shepard Monitoring** with health **up**.

Report:

- LAN: `http://apps:3130/`
- Tailscale: `http://100.93.92.42:3130/`
- Catalog: `http://apps:3070/` · `http://dir.apps.chaos-art.fr`
