## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

#### Prerequisites

- [docker-ce](https://docs.docker.com/install/)
- [docker-compose](https://docs.docker.com/compose/install/)

#### Installing

1. Clone or download repository

```
$ git clone https://github.com/dearbrightly/dearbrightly.git
```

2. Build all the services and run the containers

##### local development version

```
$ make build
```

##### staging version

```
$ make build-staging
```

#### Configuration/Environments

Create `.env` file if you don't already have one. Below you can see all needed variables which should be included in the file. All required values you can find on: https://redmine.skygate.io/projects/project-dearbrightly/wiki/

```
# Django configuration
DEBUG
SECRET_KEY

# The frontend uses these env vars when webpacking to know how to talk to Brightly API
BACKEND_SCHEME
BACKEND_HOST
BACKEND_PORT

# Database configuration
DB_HOST
DB_PORT
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_PORTS

NGINX_PORTS
NODE_ENV

# Email configuration
SENDGRID_USERNAME
SENDGRID_PASSWORD
DEFAULT_FROM_EMAIL

# Stripe API configuration
STRIPE_KEY_SECRET
STRIPE_KEY_PUBLISHABLE

TAX_JAR_API_KEY
TAX_JAR_URI


PAYMENT_PROCESSOR
```

#### Making migrations and migrating the database

Because environment vars are required for the app, be sure to have them loaded in your shell:

    export `cat .env`

After you make changes to DearBrightly API models, you have to update the database to match the schema. Django gives this to us via migrations. You can create a migration with:

##### on local development version

```
$ make makemigrations-dev
```

##### on staging version

```
$ make makemigrations
```

#### Loading fixtures

```
$ make load-fixtures
```

#### load one fixture in the container
```
$ .manage.py loaddata ./fixtures/products.json
```

To add images for products from fixtures you need to download them from: https://drive.google.com/drive/folders/1DO7nRMIJfPiJGCmps2srm_PNgXpxnKDd?usp=sharing. Create `media` catalog in the back-end root path, if you don't have one already and place images there.

#### Running tests on back-end

```
$ make test backend
```

#### Built with

##### Back-end

- [django-rest-framework](https://www.django-rest-framework.org/)

##### Front-end

- [ReactJS](https://reactjs.org/)
