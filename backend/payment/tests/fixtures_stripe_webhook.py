invoice_payment_success_webhook = {
  "created": 1326853478,
  "livemode": False,
  "id": "evt_00000000000000",
  "type": "invoice.payment_succeeded",
  "object": "event",
  "request": None,
  "pending_webhooks": 1,
  "api_version": "2018-07-27",
  "data": {
    "object": {
      "id": "in_00000000000001",
      "object": "invoice",
      "account_country": "US",
      "account_name": "DearBrightly, Inc.",
      "account_tax_ids": None,
      "amount_due": 9712,
      "amount_paid": 0,
      "amount_remaining": 9712,
      "application_fee": None,
      "attempt_count": 0,
      "attempted": True,
      "auto_advance": True,
      "billing": "charge_automatically",
      "billing_reason": "manual",
      "charge": "_00000000000000",
      "closed": True,
      "collection_method": "charge_automatically",
      "created": 1618377184,
      "currency": "usd",
      "custom_fields": None,
      "customer": "cus_JIHLwlWraQYZqM",
      "customer_address": None,
      "customer_email": "test1@testemail.com",
      "customer_name": None,
      "customer_phone": None,
      "customer_shipping": {
        "address": {
          "city": "san francisco",
          "country": "US",
          "line1": "123 test st",
          "line2": "#123",
          "postal_code": "94107",
          "state": "CA"
        },
        "name": "Test1 User1",
        "phone": "4159065937"
      },
      "customer_tax_exempt": "none",
      "customer_tax_ids": [
      ],
      "date": 1618377184,
      "default_payment_method": None,
      "default_source": None,
      "default_tax_rates": [
      ],
      "description": None,
      "discount": None,
      "discounts": [
      ],
      "due_date": None,
      "ending_balance": None,
      "finalized_at": None,
      "footer": None,
      "forgiven": False,
      "hosted_invoice_url": None,
      "invoice_pdf": None,
      "last_finalization_error": None,
      "lines": {
        "object": "list",
        "data": [
          {
            "id": "ii_00000000000000",
            "object": "line_item",
            "amount": 9712,
            "currency": "usd",
            "description": "My First Invoice Item (created for API docs)",
            "discount_amounts": [
            ],
            "discountable": True,
            "discounts": [
            ],
            "invoice_item": "ii_1Ig12CIhgBIGcWAxhjhalMhY",
            "livemode": False,
            "metadata": {
            },
            "period": {
              "end": 1618377184,
              "start": 1618377184
            },
            "price": {
              "id": "price_00000000000000",
              "object": "price",
              "active": True,
              "billing_scheme": "per_unit",
              "created": 1614307122,
              "currency": "usd",
              "livemode": False,
              "lookup_key": None,
              "metadata": {
              },
              "nickname": None,
              "product": "PROD_00000000000000",
              "recurring": None,
              "tiers_mode": None,
              "transform_quantity": None,
              "type": "one_time",
              "unit_amount": 9712,
              "unit_amount_decimal": "9712"
            },
            "proration": False,
            "quantity": 1,
            "subscription": None,
            "tax_amounts": [
            ],
            "tax_rates": [
            ],
            "type": "invoiceitem",
            "unique_id": "il_1Ig12CIhgBIGcWAxQmSwN1Eu"
          }
        ],
        "has_more": False,
        "url": "/v1/invoices/in_1Ig12CIhgBIGcWAxgUQIgmU4/lines"
      },
      "livemode": False,
      "metadata": {
      },
      "next_payment_attempt": 1618380784,
      "number": "4C256F4-DRAFT",
      "on_behalf_of": None,
      "paid": True,
      "payment_intent": None,
      "payment_settings": {
        "payment_method_options": None,
        "payment_method_types": None
      },
      "period_end": 1618377184,
      "period_start": 1618377184,
      "post_payment_credit_notes_amount": 0,
      "pre_payment_credit_notes_amount": 0,
      "receipt_number": None,
      "starting_balance": 0,
      "statement_descriptor": None,
      "status": "draft",
      "status_transitions": {
        "finalized_at": None,
        "marked_uncollectible_at": None,
        "paid_at": None,
        "voided_at": None
      },
      "subscription": None,
      "subtotal": 9712,
      "tax": None,
      "tax_percent": None,
      "total": 9712,
      "total_discount_amounts": [
      ],
      "total_tax_amounts": [
      ],
      "transfer_data": None,
      "webhooks_delivered_at": None
    }
  }
}

invoice_payment_success_webhook_expired_rx = {
  "created": 1326853478,
  "livemode": False,
  "id": "evt_00000000000000",
  "type": "invoice.payment_succeeded",
  "object": "event",
  "request": None,
  "pending_webhooks": 1,
  "api_version": "2018-07-27",
  "data": {
    "object": {
      "id": "in_00000000000003",
      "object": "invoice",
      "account_country": "US",
      "account_name": "DearBrightly, Inc.",
      "account_tax_ids": None,
      "amount_due": 9712,
      "amount_paid": 0,
      "amount_remaining": 9712,
      "application_fee": None,
      "attempt_count": 0,
      "attempted": True,
      "auto_advance": True,
      "billing": "charge_automatically",
      "billing_reason": "manual",
      "charge": "_00000000000000",
      "closed": True,
      "collection_method": "charge_automatically",
      "created": 1618377184,
      "currency": "usd",
      "custom_fields": None,
      "customer": "cus_JIG4U9gdVnEjs8",
      "customer_address": None,
      "customer_email": "dearbrightly.test+yearly_visit_required@gmail.com",
      "customer_name": None,
      "customer_phone": None,
      "customer_shipping": {
        "address": {
          "city": "san francisco",
          "country": "US",
          "line1": "123 test st",
          "line2": "#123",
          "postal_code": "94107",
          "state": "CA"
        },
        "name": "Test1 User1",
        "phone": "4159065937"
      },
      "customer_tax_exempt": "none",
      "customer_tax_ids": [
      ],
      "date": 1618377184,
      "default_payment_method": None,
      "default_source": None,
      "default_tax_rates": [
      ],
      "description": None,
      "discount": None,
      "discounts": [
      ],
      "due_date": None,
      "ending_balance": None,
      "finalized_at": None,
      "footer": None,
      "forgiven": False,
      "hosted_invoice_url": None,
      "invoice_pdf": None,
      "last_finalization_error": None,
      "lines": {
        "object": "list",
        "data": [
          {
            "id": "ii_00000000000000",
            "object": "line_item",
            "amount": 9712,
            "currency": "usd",
            "description": "My First Invoice Item (created for API docs)",
            "discount_amounts": [
            ],
            "discountable": True,
            "discounts": [
            ],
            "invoice_item": "ii_1Ig12CIhgBIGcWAxhjhalMhY",
            "livemode": False,
            "metadata": {
            },
            "period": {
              "end": 1618377184,
              "start": 1618377184
            },
            "price": {
              "id": "price_00000000000000",
              "object": "price",
              "active": True,
              "billing_scheme": "per_unit",
              "created": 1614307122,
              "currency": "usd",
              "livemode": False,
              "lookup_key": None,
              "metadata": {
              },
              "nickname": None,
              "product": "PROD_00000000000000",
              "recurring": None,
              "tiers_mode": None,
              "transform_quantity": None,
              "type": "one_time",
              "unit_amount": 9712,
              "unit_amount_decimal": "9712"
            },
            "proration": False,
            "quantity": 1,
            "subscription": None,
            "tax_amounts": [
            ],
            "tax_rates": [
            ],
            "type": "invoiceitem",
            "unique_id": "il_1Ig12CIhgBIGcWAxQmSwN1Eu"
          }
        ],
        "has_more": False,
        "url": "/v1/invoices/in_1Ig12CIhgBIGcWAxgUQIgmU4/lines"
      },
      "livemode": False,
      "metadata": {
      },
      "next_payment_attempt": 1618380784,
      "number": "4C256F4-DRAFT",
      "on_behalf_of": None,
      "paid": True,
      "payment_intent": None,
      "payment_settings": {
        "payment_method_options": None,
        "payment_method_types": None
      },
      "period_end": 1618377184,
      "period_start": 1618377184,
      "post_payment_credit_notes_amount": 0,
      "pre_payment_credit_notes_amount": 0,
      "receipt_number": None,
      "starting_balance": 0,
      "statement_descriptor": None,
      "status": "draft",
      "status_transitions": {
        "finalized_at": None,
        "marked_uncollectible_at": None,
        "paid_at": None,
        "voided_at": None
      },
      "subscription": None,
      "subtotal": 9712,
      "tax": None,
      "tax_percent": None,
      "total": 9712,
      "total_discount_amounts": [
      ],
      "total_tax_amounts": [
      ],
      "transfer_data": None,
      "webhooks_delivered_at": None
    }
  }
}

invoice_payment_success_webhook_expired_rx_pending_visit = {
  "created": 1326853478,
  "livemode": False,
  "id": "evt_00000000000000",
  "type": "invoice.payment_succeeded",
  "object": "event",
  "request": None,
  "pending_webhooks": 1,
  "api_version": "2018-07-27",
  "data": {
    "object": {
      "id": "in_00000000000002",
      "object": "invoice",
      "account_country": "US",
      "account_name": "DearBrightly, Inc.",
      "account_tax_ids": None,
      "amount_due": 9712,
      "amount_paid": 0,
      "amount_remaining": 9712,
      "application_fee": None,
      "attempt_count": 0,
      "attempted": True,
      "auto_advance": True,
      "billing": "charge_automatically",
      "billing_reason": "manual",
      "charge": "_00000000000000",
      "closed": True,
      "collection_method": "charge_automatically",
      "created": 1618377184,
      "currency": "usd",
      "custom_fields": None,
      "customer": "cus_JHqane1XF3brPd",
      "customer_address": None,
      "customer_email": "dearbrightly.test+incomplete_yearly_visit@gmail.com",
      "customer_name": None,
      "customer_phone": None,
      "customer_shipping": {
        "address": {
          "city": "san francisco",
          "country": "US",
          "line1": "123 test st",
          "line2": "#123",
          "postal_code": "94107",
          "state": "CA"
        },
        "name": "Test1 User1",
        "phone": "4159065937"
      },
      "customer_tax_exempt": "none",
      "customer_tax_ids": [
      ],
      "date": 1618377184,
      "default_payment_method": None,
      "default_source": None,
      "default_tax_rates": [
      ],
      "description": None,
      "discount": None,
      "discounts": [
      ],
      "due_date": None,
      "ending_balance": None,
      "finalized_at": None,
      "footer": None,
      "forgiven": False,
      "hosted_invoice_url": None,
      "invoice_pdf": None,
      "last_finalization_error": None,
      "lines": {
        "object": "list",
        "data": [
          {
            "id": "ii_00000000000000",
            "object": "line_item",
            "amount": 9712,
            "currency": "usd",
            "description": "My First Invoice Item (created for API docs)",
            "discount_amounts": [
            ],
            "discountable": True,
            "discounts": [
            ],
            "invoice_item": "ii_1Ig12CIhgBIGcWAxhjhalMhY",
            "livemode": False,
            "metadata": {
            },
            "period": {
              "end": 1618377184,
              "start": 1618377184
            },
            "price": {
              "id": "price_00000000000000",
              "object": "price",
              "active": True,
              "billing_scheme": "per_unit",
              "created": 1614307122,
              "currency": "usd",
              "livemode": False,
              "lookup_key": None,
              "metadata": {
              },
              "nickname": None,
              "product": "PROD_00000000000000",
              "recurring": None,
              "tiers_mode": None,
              "transform_quantity": None,
              "type": "one_time",
              "unit_amount": 9712,
              "unit_amount_decimal": "9712"
            },
            "proration": False,
            "quantity": 1,
            "subscription": None,
            "tax_amounts": [
            ],
            "tax_rates": [
            ],
            "type": "invoiceitem",
            "unique_id": "il_1Ig12CIhgBIGcWAxQmSwN1Eu"
          }
        ],
        "has_more": False,
        "url": "/v1/invoices/in_1Ig12CIhgBIGcWAxgUQIgmU4/lines"
      },
      "livemode": False,
      "metadata": {
      },
      "next_payment_attempt": 1618380784,
      "number": "4C256F4-DRAFT",
      "on_behalf_of": None,
      "paid": True,
      "payment_intent": None,
      "payment_settings": {
        "payment_method_options": None,
        "payment_method_types": None
      },
      "period_end": 1618377184,
      "period_start": 1618377184,
      "post_payment_credit_notes_amount": 0,
      "pre_payment_credit_notes_amount": 0,
      "receipt_number": None,
      "starting_balance": 0,
      "statement_descriptor": None,
      "status": "draft",
      "status_transitions": {
        "finalized_at": None,
        "marked_uncollectible_at": None,
        "paid_at": None,
        "voided_at": None
      },
      "subscription": None,
      "subtotal": 9712,
      "tax": None,
      "tax_percent": None,
      "total": 9712,
      "total_discount_amounts": [
      ],
      "total_tax_amounts": [
      ],
      "transfer_data": None,
      "webhooks_delivered_at": None
    }
  }
}

invoice_payment_failed_webhook = {
  "created": 1326853478,
  "livemode": False,
  "id": "evt_00000000000000",
  "type": "invoice.payment_failed",
  "object": "event",
  "request": None,
  "pending_webhooks": 1,
  "api_version": "2018-07-27",
  "data": {
    "object": {
      "id": "in_00000000000001",
      "object": "invoice",
      "account_country": "US",
      "account_name": "DearBrightly, Inc.",
      "account_tax_ids": None,
      "amount_due": 9712,
      "amount_paid": 0,
      "amount_remaining": 9712,
      "application_fee": None,
      "attempt_count": 0,
      "attempted": True,
      "auto_advance": True,
      "billing": "charge_automatically",
      "billing_reason": "manual",
      "charge": None,
      "closed": False,
      "collection_method": "charge_automatically",
      "created": 1618380935,
      "currency": "usd",
      "custom_fields": None,
      "customer": "cus_JIHLwlWraQYZqM",
      "customer_address": None,
      "customer_email": "test1@testemail.com",
      "customer_name": None,
      "customer_phone": None,
      "customer_shipping": {
        "address": {
          "city": "san francisco",
          "country": "US",
          "line1": "123 test st",
          "line2": "#123",
          "postal_code": "94107",
          "state": "CA"
        },
        "name": "Test2 User2",
        "phone": "4159065937"
      },
      "customer_tax_exempt": "none",
      "customer_tax_ids": [
      ],
      "date": 1618380935,
      "default_payment_method": None,
      "default_source": None,
      "default_tax_rates": [
      ],
      "description": None,
      "discount": None,
      "discounts": [
      ],
      "due_date": None,
      "ending_balance": None,
      "finalized_at": None,
      "footer": None,
      "forgiven": False,
      "hosted_invoice_url": None,
      "invoice_pdf": None,
      "last_finalization_error": None,
      "lines": {
        "object": "list",
        "data": [
          {
            "id": "ii_00000000000000",
            "object": "line_item",
            "amount": 9712,
            "currency": "usd",
            "description": "My First Invoice Item (created for API docs)",
            "discount_amounts": [
            ],
            "discountable": True,
            "discounts": [
            ],
            "invoice_item": "ii_1Ig20hIhgBIGcWAxca9tnJGT",
            "livemode": False,
            "metadata": {
            },
            "period": {
              "end": 1618380935,
              "start": 1618380935
            },
            "price": {
              "id": "price_00000000000000",
              "object": "price",
              "active": True,
              "billing_scheme": "per_unit",
              "created": 1614307122,
              "currency": "usd",
              "livemode": False,
              "lookup_key": None,
              "metadata": {
              },
              "nickname": None,
              "product": "PROD_00000000000000",
              "recurring": None,
              "tiers_mode": None,
              "transform_quantity": None,
              "type": "one_time",
              "unit_amount": 9712,
              "unit_amount_decimal": "9712"
            },
            "proration": False,
            "quantity": 1,
            "subscription": None,
            "tax_amounts": [
            ],
            "tax_rates": [
            ],
            "type": "invoiceitem",
            "unique_id": "il_1Ig20hIhgBIGcWAxOqGgCesq"
          }
        ],
        "has_more": False,
        "url": "/v1/invoices/in_1Ig20hIhgBIGcWAxnvhspNxe/lines"
      },
      "livemode": False,
      "metadata": {
      },
      "next_payment_attempt": 1618384535,
      "number": "4C256F4-DRAFT",
      "on_behalf_of": None,
      "paid": False,
      "payment_intent": None,
      "payment_settings": {
        "payment_method_options": None,
        "payment_method_types": None
      },
      "period_end": 1618380935,
      "period_start": 1618380935,
      "post_payment_credit_notes_amount": 0,
      "pre_payment_credit_notes_amount": 0,
      "receipt_number": None,
      "starting_balance": 0,
      "statement_descriptor": None,
      "status": "draft",
      "status_transitions": {
        "finalized_at": None,
        "marked_uncollectible_at": None,
        "paid_at": None,
        "voided_at": None
      },
      "subscription": None,
      "subtotal": 9712,
      "tax": None,
      "tax_percent": None,
      "total": 9712,
      "total_discount_amounts": [
      ],
      "total_tax_amounts": [
      ],
      "transfer_data": None,
      "webhooks_delivered_at": None
    }
  }
}

invoice_finalization_failed_webhook = {
  "created": 1326853478,
  "livemode": False,
  "id": "evt_00000000000000",
  "type": "invoice.finalization_failed",
  "object": "event",
  "request": None,
  "pending_webhooks": 1,
  "api_version": "2018-07-27",
  "data": {
    "object": {
      "id": "in_00000000000001",
      "object": "invoice",
      "account_country": "US",
      "account_name": "DearBrightly, Inc.",
      "account_tax_ids": None,
      "amount_due": 9712,
      "amount_paid": 0,
      "amount_remaining": 9712,
      "application_fee": None,
      "attempt_count": 0,
      "attempted": False,
      "auto_advance": True,
      "billing": "charge_automatically",
      "billing_reason": "manual",
      "charge": None,
      "closed": False,
      "collection_method": "charge_automatically",
      "created": 1618381574,
      "currency": "usd",
      "custom_fields": None,
      "customer": "cus_JIHLwlWraQYZqM",
      "customer_address": None,
      "customer_email": "test1@testemail.com",
      "customer_name": None,
      "customer_phone": None,
      "customer_shipping": {
        "address": {
          "city": "san francisco",
          "country": "US",
          "line1": "123 test st",
          "line2": "#123",
          "postal_code": "94107",
          "state": "CA"
        },
        "name": "Test3 User3",
        "phone": "4159065937"
      },
      "customer_tax_exempt": "none",
      "customer_tax_ids": [
      ],
      "date": 1618381574,
      "default_payment_method": None,
      "default_source": None,
      "default_tax_rates": [
      ],
      "description": None,
      "discount": None,
      "discounts": [
      ],
      "due_date": None,
      "ending_balance": None,
      "finalized_at": None,
      "footer": None,
      "forgiven": False,
      "hosted_invoice_url": None,
      "invoice_pdf": None,
      "last_finalization_error": None,
      "lines": {
        "object": "list",
        "data": [
          {
            "id": "ii_00000000000000",
            "object": "line_item",
            "amount": 9712,
            "currency": "usd",
            "description": "My First Invoice Item (created for API docs)",
            "discount_amounts": [
            ],
            "discountable": True,
            "discounts": [
            ],
            "invoice_item": "ii_1Ig2B0IhgBIGcWAxtfsQJOB3",
            "livemode": False,
            "metadata": {
            },
            "period": {
              "end": 1618381574,
              "start": 1618381574
            },
            "price": {
              "id": "price_00000000000000",
              "object": "price",
              "active": True,
              "billing_scheme": "per_unit",
              "created": 1614307122,
              "currency": "usd",
              "livemode": False,
              "lookup_key": None,
              "metadata": {
              },
              "nickname": None,
              "product": "PROD_00000000000000",
              "recurring": None,
              "tiers_mode": None,
              "transform_quantity": None,
              "type": "one_time",
              "unit_amount": 9712,
              "unit_amount_decimal": "9712"
            },
            "proration": False,
            "quantity": 1,
            "subscription": None,
            "tax_amounts": [
            ],
            "tax_rates": [
            ],
            "type": "invoiceitem",
            "unique_id": "il_1Ig2B0IhgBIGcWAxEPJNPxul"
          }
        ],
        "has_more": False,
        "url": "/v1/invoices/in_1Ig2B0IhgBIGcWAxegxRMZR9/lines"
      },
      "livemode": False,
      "metadata": {
      },
      "next_payment_attempt": 1618385174,
      "number": "4C256F4-DRAFT",
      "on_behalf_of": None,
      "paid": False,
      "payment_intent": None,
      "payment_settings": {
        "payment_method_options": None,
        "payment_method_types": None
      },
      "period_end": 1618381574,
      "period_start": 1618381574,
      "post_payment_credit_notes_amount": 0,
      "pre_payment_credit_notes_amount": 0,
      "receipt_number": None,
      "starting_balance": 0,
      "statement_descriptor": None,
      "status": "draft",
      "status_transitions": {
        "finalized_at": None,
        "marked_uncollectible_at": None,
        "paid_at": None,
        "voided_at": None
      },
      "subscription": None,
      "subtotal": 9712,
      "tax": None,
      "tax_percent": None,
      "total": 9712,
      "total_discount_amounts": [
      ],
      "total_tax_amounts": [
      ],
      "transfer_data": None,
      "webhooks_delivered_at": None
    }
  }
}

invoice_invoice_marked_uncollectible_webhook = {
  "created": 1326853478,
  "livemode": False,
  "id": "evt_00000000000000",
  "type": "invoice.marked_uncollectible",
  "object": "event",
  "request": None,
  "pending_webhooks": 1,
  "api_version": "2018-07-27",
  "data": {
    "object": {
      "id": "in_00000000000001",
      "object": "invoice",
      "account_country": "US",
      "account_name": "DearBrightly, Inc.",
      "account_tax_ids": None,
      "amount_due": 9712,
      "amount_paid": 0,
      "amount_remaining": 9712,
      "application_fee": None,
      "attempt_count": 0,
      "attempted": False,
      "auto_advance": True,
      "billing": "charge_automatically",
      "billing_reason": "manual",
      "charge": None,
      "closed": False,
      "collection_method": "charge_automatically",
      "created": 1618382061,
      "currency": "usd",
      "custom_fields": None,
      "customer": "cus_JIHLwlWraQYZqM",
      "customer_address": None,
      "customer_email": "test1@testemail.com",
      "customer_name": None,
      "customer_phone": None,
      "customer_shipping": {
        "address": {
          "city": "san francisco",
          "country": "US",
          "line1": "123 test st",
          "line2": "#123",
          "postal_code": "94107",
          "state": "CA"
        },
        "name": "Test4 User4",
        "phone": "4159065937"
      },
      "customer_tax_exempt": "none",
      "customer_tax_ids": [
      ],
      "date": 1618382061,
      "default_payment_method": None,
      "default_source": None,
      "default_tax_rates": [
      ],
      "description": None,
      "discount": None,
      "discounts": [
      ],
      "due_date": None,
      "ending_balance": None,
      "finalized_at": None,
      "footer": None,
      "forgiven": False,
      "hosted_invoice_url": None,
      "invoice_pdf": None,
      "last_finalization_error": None,
      "lines": {
        "object": "list",
        "data": [
          {
            "id": "ii_00000000000000",
            "object": "line_item",
            "amount": 9712,
            "currency": "usd",
            "description": "My First Invoice Item (created for API docs)",
            "discount_amounts": [
            ],
            "discountable": True,
            "discounts": [
            ],
            "invoice_item": "ii_1Ig2IrIhgBIGcWAxV6xCHrbS",
            "livemode": False,
            "metadata": {
            },
            "period": {
              "end": 1618382061,
              "start": 1618382061
            },
            "price": {
              "id": "price_00000000000000",
              "object": "price",
              "active": True,
              "billing_scheme": "per_unit",
              "created": 1614307122,
              "currency": "usd",
              "livemode": False,
              "lookup_key": None,
              "metadata": {
              },
              "nickname": None,
              "product": "PROD_00000000000000",
              "recurring": None,
              "tiers_mode": None,
              "transform_quantity": None,
              "type": "one_time",
              "unit_amount": 9712,
              "unit_amount_decimal": "9712"
            },
            "proration": False,
            "quantity": 1,
            "subscription": None,
            "tax_amounts": [
            ],
            "tax_rates": [
            ],
            "type": "invoiceitem",
            "unique_id": "il_1Ig2IrIhgBIGcWAxHXlgBCWS"
          }
        ],
        "has_more": False,
        "url": "/v1/invoices/in_1Ig2IrIhgBIGcWAxrPtvfy41/lines"
      },
      "livemode": False,
      "metadata": {
      },
      "next_payment_attempt": 1618385661,
      "number": "4C256F4-DRAFT",
      "on_behalf_of": None,
      "paid": False,
      "payment_intent": None,
      "payment_settings": {
        "payment_method_options": None,
        "payment_method_types": None
      },
      "period_end": 1618382061,
      "period_start": 1618382061,
      "post_payment_credit_notes_amount": 0,
      "pre_payment_credit_notes_amount": 0,
      "receipt_number": None,
      "starting_balance": 0,
      "statement_descriptor": None,
      "status": "draft",
      "status_transitions": {
        "finalized_at": None,
        "marked_uncollectible_at": None,
        "paid_at": None,
        "voided_at": None
      },
      "subscription": None,
      "subtotal": 9712,
      "tax": None,
      "tax_percent": None,
      "total": 9712,
      "total_discount_amounts": [
      ],
      "total_tax_amounts": [
      ],
      "transfer_data": None,
      "webhooks_delivered_at": None
    }
  }
}