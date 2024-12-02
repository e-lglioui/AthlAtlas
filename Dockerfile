FROM node:20-alpine AS build

WORKDIR /app/

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build


#prod stage
FROM node:20-alpine

WORKDIR /app/

ARG NODE_ENV=production
ARG JWT_SECRET
ARG MONGODB_URI
ENV NODE_ENV=${NODE_ENV}
ENV JWT_SECRET=${JWT_SECRET}
ENV MONGODB_URI=${MONGODB_URI}

COPY --from=build /app/dist ./dist

COPY --from=build /app/package.json ./

# COPY --from=build /app/.env ./.env

RUN npm install --only=production

EXPOSE 3001

CMD ["node", "dist/main.js"]