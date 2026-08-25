# Pre-built: copy the already-compiled dist/ directly into nginx
# Build step is done on the host with `npm run build` before running this Dockerfile.
# This avoids cross-platform esbuild Go runtime crashes on CRC (amd64 emulation on ARM).
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
