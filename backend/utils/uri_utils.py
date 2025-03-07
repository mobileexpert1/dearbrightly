from django.conf import settings

def generate_absolute_url(request, path):

    if settings.DEBUG:
        HTTP_HOST = 'localhost:8080'
        BACKEND_SCHEME = 'http'
    else:
        HTTP_HOST = 'app.dearbrightly.com'
        BACKEND_SCHEME = 'https'

    if request:
        HTTP_HOST = request.META.get('HTTP_HOST', 'app.dearbrightly.com')
        BACKEND_SCHEME = request.META.get('BACKEND_SCHEME', 'https')

    url = f'{BACKEND_SCHEME}://{HTTP_HOST}/{path}'
    return url