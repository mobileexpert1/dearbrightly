from django import template

register = template.Library()

@register.filter(is_safe=True)
def href_key_value(dict, key):
    return dict.get(key, None)

@register.filter(is_safe=True)
def is_href_index(dict, index):
    for (k1, k2) in dict.keys():
        if index >= k1 and index <= k2:
            return True
    return False

@register.filter(is_safe=True)
def href_key_value_url(dict, start_index):
    url_value = None
    values = [v for (k1, _), v in dict.items() if k1 == start_index]
    if len(values) > 0:
        url_value = values[0][1]
    return url_value

@register.filter(is_safe=True)
def href_key_value_end_index(dict, start_index):
    for (k1, k2) in dict.keys():
        if k1 == start_index:
            return k2
    return start_index

@register.filter(is_safe=True)
def href_key_value_anchor(dict, start_index):
    anchor_value = None
    values = [v for (k1, _), v in dict.items() if k1 == start_index]
    if len(values) > 0:
        anchor_value = values[0][0]
    return anchor_value

@register.filter(is_safe=True)
def is_highlighted_index(dict, index):
    for (k1, k2) in dict.keys():
        if index >= k1 and index <= k2:
            return True
    return False

@register.filter(is_safe=True)
def highlighted_text(dict, index):
    text = list(dict.values())[0]
    if len(text) >= index:
        word = text[index]
    return word