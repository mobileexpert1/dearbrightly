FROM python:3.6.5

ENV BACKEND_PATH /backend

WORKDIR ${BACKEND_PATH}

EXPOSE 3000

COPY requirements.txt ${BACKEND_PATH}
RUN pip install -r requirements.txt

RUN printf "deb http://archive.debian.org/debian/ jessie main\ndeb-src http://archive.debian.org/debian/ jessie main\ndeb http://archive.debian.org/debian-security jessie/updates main\ndeb-src http://archive.debian.org/debian-security jessie/updates main" > /etc/apt/sources.list

RUN apt-get update -q
RUN apt-get upgrade -qy
RUN apt-get install -yq netcat --allow-unauthenticated

COPY . .
