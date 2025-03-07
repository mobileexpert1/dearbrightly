containers-tool := docker-compose
dev-dockerfile = -f docker-compose.yml -f docker-compose.dev.yml
staging-dockerfile = -f docker-compose.staging.yml
FIXTURES-FILES = $(addprefix fixtures/, groups.json shipping_details.json customers.json medical_provider_user.json emr_pharmacies.json emr_prescriptions.json products.json set_products.json emr_question_ids.json emr_questionnaire_answers.json emr_visits.json emr_patient_prescriptions.json orders.json order_products.json order_items.json subscriptions_order_product_subscriptions.json subscriptions_order_item_subscriptions.json emr_snippets.json)  $(addprefix fixtures/questionnaires/, $(notdir $(wildcard ./backend/fixtures/questionnaires/*.json)))
copy-env-files := cp .env gatsby/.env

.PHONY: build
build:
	# We need to have the backend container ready before anything else so that we can emit the schema.json
 	# file for the frontend container to generate its relay artifacts.
	$(containers-tool) $(dev-dockerfile) build backend

	# Make the expected frontend schema dir if it's not already there.
	mkdir -p frontend/schema

	# Generate the GraphQL schema to STDOUT and emit it to the expected place for the frontend.
	$(containers-tool) $(dev-dockerfile) build
	$(MAKE) dev

.PHONY: dev
dev:
	$(containers-tool) $(dev-dockerfile) up

.PHONY: build-staging
build-staging:
	# We need to have the backend container ready before anything else so that we can emit the schema.json
 	# file for the frontend container to generate its relay artifacts.
	$(containers-tool) $(staging-dockerfile) build backend

	# Make the expected frontend schema dir if it's not already there.
	mkdir -p frontend/schema

	# Generate the GraphQL schema to STDOUT and emit it to the expected place for the frontend.
	#$(containers-tool) $(staging-dockerfile) run --rm backend bash -c "./manage.py graphql_schema --out -" > frontend/schema/schema.json
	$(containers-tool) $(staging-dockerfile) build
	$(MAKE) run-staging

.PHONY: run-staging
run-staging:
	$(containers-tool) $(staging-dockerfile) up -d

.PHONY: makemigrations
makemigrations:
	$(containers-tool) run --rm backend bash -c 'python manage.py makemigrations && python manage.py migrate'

.PHONY: makemigrations-dev
makemigrations-dev:
	$(containers-tool) $(dev-dockerfile) run --rm backend bash -c 'python manage.py makemigrations && python manage.py migrate'

.PHONY: load-fixtures
load-fixtures:
	$(containers-tool) exec -T backend bash -c "./manage.py migrate && ./manage.py loaddata $(FIXTURES-FILES)"

.PHONY: django-shell
django-shell:
	$(containers-tool) exec backend bash -c "./manage.py shell"

# .PHONY: build-graphql
# build-graphql:
# 	docker exec -it backend bash -c "./manage.py graphql_schema --out -" > frontend/schema/schema.json && docker exec -it frontend bash -c "yarn relay"

.PHONY: test
test:
	docker-compose run --rm $(filter-out $@,$(MAKECMDGOALS)) backend bash -c 'python manage.py test'

.PHONY: webpack-stats
webpack-stats:
	docker exec -ti frontend /bin/bash -c 'yarn generate-stats && yarn stats'
