import os

# broker_url = os.environ.get('CELERY_BROKER_URL', 'redis://redis:6379/0')
# result_backend = os.environ.get('CELERY_BROKER_URL', 'redis://redis:6379/0')

broker_url = "redis://prod-app-dearbrightly-redis-cluster.uubndn.ng.0001.usw2.cache.amazonaws.com:6379"
result_backend = "redis://prod-app-dearbrightly-redis-cluster.uubndn.ng.0001.usw2.cache.amazonaws.com:6379"

timezone = 'UTC'
s3_region = 'us-west-2'
