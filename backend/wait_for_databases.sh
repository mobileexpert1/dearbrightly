#!/bin/sh

until nc -z $DB_HOST $DB_PORT
do
  echo Waiting...
  sleep 1
done

echo "*-*-*-*-*-*-*-*-*-*-*-*- Connected -*-*-*-*-*-*-*-*-*-*-*-*"
