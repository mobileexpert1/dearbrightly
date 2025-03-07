from functools import wraps


def skip_signal():
    def _skip_signal(signal_func):
        @wraps(signal_func)
        def _decorator(*args, **kwargs):
            return None

        return _decorator

    return _skip_signal
