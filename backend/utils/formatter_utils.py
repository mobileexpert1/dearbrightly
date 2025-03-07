def convert_cents_to_dollars_string(cents):
    return "{:.2f}".format(cents/100)

def convert_cents_to_dollars_string_with_symbol(cents):
    return '${:.2f}'.format(cents/100)

# assuming that cents wont add up to 100 and if everything has 0 cents then display prices without cents
def convert_cents_to_dollars_string_with_symbol_rounded(cents, order):
    if (cents % 100 == 0) and not order.contains_decimal_values:
      return '${:.0f}'.format(cents/100)
    return '${:.2f}'.format(cents/100)

def capitalize_sentence(sentence):
    sentence = sentence.lower()
    return " ".join([word.capitalize() for word in sentence.split(" ")])
