#!/bin/sh -e
set -x

isort --recursive  --force-single-line-imports --apply ./
autoflake --remove-all-unused-imports --recursive --remove-unused-variables --in-place ./ --exclude=__init__.py
isort --recursive --apply ./
black ./
flake8 ./
