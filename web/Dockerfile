FROM node:22-alpine AS application

WORKDIR /usr/src/app

FROM application AS application-dev

RUN yarn install --dev

ENTRYPOINT yarn run dev

FROM application AS application-prod

COPY package.json yarn.lock ./

RUN yarn install --prod

COPY . .

RUN yarn run build

FROM nginx:alpine AS nginx-prod

RUN find /usr/share/nginx/html -delete

COPY --from=application-prod /usr/src/app/public /usr/share/nginx/html
