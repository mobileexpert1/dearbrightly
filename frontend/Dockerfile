FROM node:carbon

WORKDIR /frontend

EXPOSE 8001

ARG BACKEND_SCHEME
ARG BACKEND_HOST
ARG BACKEND_PORT
ARG DEBUG
ARG STRIPE_KEY_PUBLISHABLE
ARG STRIPE_CLIENT_ID
ARG FACEBOOK_APP_ID
ARG FACEBOOK_PIXEL_ID
ARG FACEBOOK_API_VERSION
ARG OPTIMIZELY_PROJECT_ID
ARG GOOGLE_PLACES_API_KEY
ARG GOOGLE_TAG_MANAGER_ID
ARG GOOGLE_TAG_MANAGER_DEV_PARAMS
ARG KLAVIYO_PUBLIC_API_TOKEN
ARG MANUAL_TEST_MODE
ARG HIGHLIGHT_ACCOUNT_ID

ENV BACKEND_SCHEME=$BACKEND_SCHEME
ENV BACKEND_HOST=$BACKEND_HOST
ENV BACKEND_PORT=$BACKEND_PORT
ENV DEBUG=$DEBUG
ENV STRIPE_KEY_PUBLISHABLE=$STRIPE_KEY_PUBLISHABLE
ENV STRIPE_CLIENT_ID=$STRIPE_CLIENT_ID
ENV FACEBOOK_APP_ID=$FACEBOOK_APP_ID
ENV FACEBOOK_PIXEL_ID=$FACEBOOK_PIXEL_ID
ENV FACEBOOK_API_VERSION=$FACEBOOK_API_VERSION
ENV OPTIMIZELY_PROJECT_ID=$OPTIMIZELY_PROJECT_ID
ENV GOOGLE_PLACES_API_KEY=$GOOGLE_PLACES_API_KEY
ENV GOOGLE_TAG_MANAGER_ID=$GOOGLE_TAG_MANAGER_ID
ENV GOOGLE_TAG_MANAGER_DEV_PARAMS=$GOOGLE_TAG_MANAGER_DEV_PARAMS
ENV KLAVIYO_PUBLIC_API_TOKEN=$KLAVIYO_PUBLIC_API_TOKEN
ENV HIGHLIGHT_ACCOUNT_ID=$HIGHLIGHT_ACCOUNT_ID

RUN printf "deb http://archive.debian.org/debian/ jessie main\ndeb-src http://archive.debian.org/debian/ jessie main\ndeb http://archive.debian.org/debian-security jessie/updates main\ndeb-src http://archive.debian.org/debian-security jessie/updates main" > /etc/apt/sources.list

RUN apt-get update -q
RUN apt-get install -yq nginx apt-transport-https --allow-unauthenticated

# Yarn already present
# RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
# RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
# RUN apt-get update && apt-get install -y --force-yes yarn

COPY ./frontend/package.json ./frontend/yarn.lock ./
RUN yarn && yarn cache clean

COPY ./frontend/package.json ./frontend/yarn.lock ./
RUN yarn && yarn cache clean

COPY ./frontend .
COPY ./frontend/nginx.conf /etc/nginx/conf.d/nginx.conf

RUN yarn relay
RUN yarn build

CMD chmod 755 /frontend && chmod 755 /frontend/build -R && nginx -g "daemon off;"
