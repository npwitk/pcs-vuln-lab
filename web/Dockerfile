FROM node:20-alpine
WORKDIR /app
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV CI=false BROWSER=none HOST=0.0.0.0 PORT=3000 DANGEROUSLY_DISABLE_HOST_CHECK=true
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
