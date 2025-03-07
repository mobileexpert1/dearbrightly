from dearbrightly.celery import app
from utils.logger_utils import logger
from users.models import User
from copy import copy
from payment.services.services import Service
from rest_framework.exceptions import APIException

@app.task(name="subscriptions.migrate_existing_shipping_details_and_payment_details", rate_limit="10/s", soft_time_limit=10, time_limit=20)
def migrate_existing_shipping_details_and_payment_details(customer_id: int) -> None:
    try:
        customer = User.objects.get(id=customer_id)
    except User.DoesNotExist:
        raise Exception(f"Customer ID: {customer_id} does not exist")
    
    subscriptions = customer.subscriptions.filter(
        shipping_details__isnull=True,
        payment_processor_card_id__isnull=True,
    )

    if not subscriptions:
        return

    logger.info(
        f"[migrate_existing_shipping_details_and_payment_details] "
        f"Updating subscriptions: {subscriptions}."
    )

    subscription_shipping_details = copy(customer.shipping_details)
    subscription_shipping_details.pk = None
    subscription_shipping_details.save()
    logger.info(
        f"[migrate_existing_shipping_details_and_payment_details] "
        f"New shipping_details created: {subscription_shipping_details.pk}."
    )

    card_id = None
    if customer.payment_processor_customer_id:
        try:
            default_payment_method = Service().get_customer_default_payment_method(
                customer_id=customer.payment_processor_customer_id
            )
        except APIException as error:
            logger.error(
                f"Unable to retrieve stripe payment method with error: {error} "
                f"for Customer ID: {customer.pk}"    
            )
        else:
            card_id = default_payment_method.get("id") if default_payment_method else None

    subscriptions.update(
        shipping_details=subscription_shipping_details,
        payment_processor_card_id=card_id,
    )
    logger.info(
        f"[migrate_existing_shipping_details_and_payment_details] "
        f"Subscriptions updated for customer ID: {customer.pk}."
    )
