FROM node:18 AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

FROM node:18 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN npm run build

# Create the final image
FROM node:18
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.env.production ./.env.production
# COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate
# RUN npx prisma migrate dev

EXPOSE 3000

# CMD ["npm", "start"]
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]