FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

# copy source code
COPY . .

CMD ["npm", "run", "dev"]