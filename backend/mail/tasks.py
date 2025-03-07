
from dearbrightly.celery import app
from django.core.mail import send_mail, EmailMultiAlternatives
from utils.logger_utils import logger

@app.task(name="mail.send_error_notification_task", rate_limit="6/s")
def send_error_notification_task(subject, message, from_email, to_email, html_message) -> None:
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[to_email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info("Email sent successfully.")
    except Exception as e:
        logger.error("Failed to send email: %s", str(e))

def on_failure(self, exc, task_id, args, kwargs, einfo) -> None:
    from mail.services import MailService
    error_msg = f"Failed to send email. Task ID: {task_id} failed with exception: {exc}."
    logger.error(error_msg)
    MailService.send_error_notification_email(notification='SEND EMAIL ERROR', data=error_msg)

@app.task(bind=True, name="mail.send_email_task", rate_limit="6/s", max_retries=2, on_failure=on_failure)
def send_email_task(self, subject, message, from_email, to_email, html_message) -> None:
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[to_email],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as e:
        logger.error("[send_email_task] Failed to send email to user: {to_email} with error: %s", str(e))
        raise self.retry(exc=e, countdown=60 * 10)

@app.task(bind=True, name="mail.send_multipart_email_task", rate_limit="6/s", max_retries=2, on_failure=on_failure)
def send_multipart_email_task(
    self, subject, text_content, html_content, from_email, to_email, bcc_email, headers
) -> None:
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[to_email],
            bcc=[bcc_email],
            headers=headers,
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()
    except Exception as e:
        logger.error("[send_multipart_email_task] Failed to send email to user: {to_email} with error: %s", str(e))
        raise self.retry(exc=e, countdown=60 * 10)
