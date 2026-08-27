# Pre-built: copy the already-compiled dist/ directly into nginx
# Build step is done on the host with `npm run build` before running this Dockerfile.
# This avoids cross-platform esbuild Go runtime crashes on CRC (amd64 emulation on ARM).
FROM nginxinc/nginx-unprivileged:1.27-alpine

USER root

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html

# Ensure the config file and html files are owned by the root group (0) and writable/readable by it.
# Under OpenShift, arbitrary user IDs are assigned, but they are always part of the root group (0).
RUN chown -R 101:0 /etc/nginx/conf.d/default.conf /usr/share/nginx/html && \
    chmod g+rw /etc/nginx/conf.d/default.conf && \
    chmod -R g+rwX /usr/share/nginx/html

USER 101

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
