FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache make gcc g++ python3 py3-pip

COPY package*.json ./

RUN npm ci

# copy source code
COPY . .

# EXPOSE ${SERVER_PORT}

CMD ["npm", "run", "dev"]