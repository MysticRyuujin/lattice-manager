FROM node:24-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS builder
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Vite bakes this into the bundle. Empty keeps the upstream default relay.
ARG VITE_BASE_SIGNING_URL=
ENV VITE_BASE_SIGNING_URL=$VITE_BASE_SIGNING_URL
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.30.6-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build/build /usr/share/nginx/html
EXPOSE 3001
