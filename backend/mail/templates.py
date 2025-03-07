import html2text
from django.template import Context
from django.template import loader
from django.template import Template
from django.conf import settings
from mail.tasks import send_email_task, send_multipart_email_task, send_error_notification_task
from django.shortcuts import get_object_or_404
from django.conf import settings

import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)


class Mail:
    template = None
    topic = None

    def __init__(self, **kwargs):
        self.parameters = kwargs

    def send(self, to_email, from_email=settings.DEFAULT_FROM_EMAIL, request=None):
        host = None
        if request:
            host = request.META['HTTP_HOST']
        content = self.template.format(**self.parameters, host=host)
        topic = self.topic.format(**self.parameters)
        send_email_task.delay(subject=topic, message='', from_email=from_email, to_email=to_email, html_message=content)

    def send_error_notification(self, to_email=settings.ERRORS_EMAIL, from_email=settings.DEFAULT_FROM_EMAIL):
        content = self.template.format(**self.parameters)
        topic = self.topic.format(**self.parameters)
        send_error_notification_task.delay(subject=topic, message='', from_email=from_email, to_email=to_email, html_message=content)

    def send_multipart(self, user, from_name=None, from_email=settings.DEFAULT_FROM_EMAIL, to_email=None, bcc_email=None, email_type=None, **kwargs):
        if settings.TEST_MODE:
            return

        opt_out_tag = None
        from_name = 'Dear Brightly' if not from_name else f'{from_name} via Dear Brightly'

        headers = {'Reply-To': from_email, 'From': f'{from_name} <{from_email}>'}

        if kwargs:
            opt_out_tag = kwargs.get('opt_out_tag', None)
            unsubscribe_url = kwargs.get('unsubscribe_url', None)

            if opt_out_tag:
                headers['List-Unsubscribe'] = f'<{unsubscribe_url}>, <mailto:unsubscribe@dearbrightly.com?subject=unsubscribe>'
                logger.debug(f'[send_multipart] headers: {headers}')

        if user:
            if not user.is_active or opt_out_tag and user.opt_out_marketing_emails:
                logger.debug(f'[send_multipart] Sending {email_type} email disabled for {user.email}.')
                return

        if not to_email:
            to_email = user.email

        html_message = self.template.render({**self.parameters})
        plain_text_message = html2text.html2text(html_message)
        topic = self.topic.render(Context({**self.parameters}))
        send_multipart_email_task.delay(
            subject=topic,
            text_content=plain_text_message,
            html_content=html_message,
            from_email=from_email,
            to_email=to_email,
            bcc_email=bcc_email,
            headers=headers,
        )

class PasswordResetRequestMail(Mail):
    template = """
    <html>
        <body>
            <p>To change your customer account password at Dear Brightly please click the link below or copy and paste it into your browser:</p>
            <a href="{scheme}://{host}/reset-password/{token}">Reset Password</a>
        </body>
    </html>
    """
    topic = 'Password change request for Dear Brightly'

class UserEmail(Mail):
    html_file_name = 'user_email_template.html'
    template = loader.get_template(html_file_name)
    topic = Template("{{ subject_line | safe }}")

# Notification for orders that require special handling:
class OrderUpdateMail(Mail):
    template = """
    <html>
        <body>
            <table>
                <tr>
                    <th align="left">Date of Purchase:</th>
                    <td>{date}</td>
                </tr>
                <tr>                    
                    <th align="left">Order #:</th>
                    <td>{order_id}</td>
                </tr> 
                <tr>                   
                    <th align="left">Customer ID:</th>
                    <td>{customer_id}</td>
                </tr>                                              
            </table>
            <p>{notes}</p>
        </body>
    </html>
    """
    topic = "====== Order {order_id} Notification: {notification} ======"

# Notification about users
class UserNotificationMail(Mail):
    template = """
    <html>
        <body>
            <p>{notes}</p>
        </body>
    </html>
    """
    topic = "====== Notification: {notification}. User: {user_email} [{user_id}] ======"

# Notification for errors
class ErrorNotificationMail(Mail):
    template = """
    <html>
        <body>
            <p>{notes}</p>
        </body>
    </html>
    """
    topic = "!!!! Error Notification: {notification} !!!!"


class GenericMail(Mail):
    template = """
    <html>
        <body>
            <p>{message_body}</p>
        </body>
    </html>
    """
    topic = "{topic}"
