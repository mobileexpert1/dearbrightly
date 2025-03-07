FROM nginx:latest

WORKDIR /

ARG nginx_file

RUN rm /etc/nginx/conf.d/*

COPY ${nginx_file} /etc/nginx/conf.d/
COPY ./robots.txt /etc/nginx/html/robots.txt
COPY apple-developer-merchantid-domain-association /etc/nginx/html/.well-known/