from django.conf import settings
from djchoices import DjangoChoices, ChoiceItem

class EmailType(DjangoChoices):
    none = ChoiceItem(0, 'none')
    unknown = ChoiceItem(1, 'unknown')
    sign_up = ChoiceItem(2, 'sign up')
    empty_cart = ChoiceItem(3, 'empty cart')
    abandoned_cart = ChoiceItem(4, 'abandoned cart')
    incomplete_questionnaire = ChoiceItem(5, 'incomplete questionnaire')
    incomplete_photos = ChoiceItem(6, 'incomplete photos')
    incomplete_photo_id = ChoiceItem(7, 'incomplete photo id')
    order_cancellation_skin_profile_expired = ChoiceItem(8, 'order cancellation skin profile expired')
    skin_profile_completion_new_user = ChoiceItem(9, 'skin profile completion new user')
    skin_profile_completion_returning_user = ChoiceItem(10, 'skin profile completion returning user')
    order_shipped_trial = ChoiceItem(11, 'order shipped trial')
    order_shipped = ChoiceItem(12, 'order shipped')
    order_tracking_update = ChoiceItem(13, 'order tracking update')
    order_arrived = ChoiceItem(14, 'order arrived')
    provider_message = ChoiceItem(15, 'provider message')
    user_check_in = ChoiceItem(16, 'user check in')
    upcoming_subscription_order_rx_update_new_user = ChoiceItem(17, 'upcoming subscription order rx updated new user')
    upcoming_subscription_order_rx_unchanged_new_user = ChoiceItem(18, 'upcoming subscription order rx unchanged new user')
    upcoming_subscription_order_rx_update_returning_user = ChoiceItem(19, 'upcoming subscription order rx updated returning user')
    upcoming_subscription_order_rx_unchanged_returning_user = ChoiceItem(20, 'upcoming subscription order rx unchanged returning user')
    user_annual_visit = ChoiceItem(21, 'user annual visit')
    payment_failure = ChoiceItem(22, 'payment failure')
    order_confirmation_ship_now = ChoiceItem(23, 'order confirmation ship now')
    order_confirmation_resume = ChoiceItem(24, 'order confirmation resume')
    order_confirmation = ChoiceItem(25, 'order confirmation')
    sharing_program = ChoiceItem(26, 'sharing program')
    skin_profile_completion_returning_user_no_change = ChoiceItem(27, 'skin profile completion returning user no change')
    skin_profile_completion_returning_user_no_change_no_response = ChoiceItem(28,
                                                                              'skin profile completion returning user no change no response')
    skin_profile_completion_returning_user_incomplete_response = ChoiceItem(29,
                                                                              'skin profile completion returning user incomplete response')
    terms_of_use_update = ChoiceItem(30, 'terms_of_use_update')
    subscription_payment_failure = ChoiceItem(31, 'subscription payment failure')
    subscription_cancel_payment_failure = ChoiceItem(32, 'subscription cancel payment failure')
    order_confirmation_payment_detail_updated = ChoiceItem(33, 'order confirmation payment detail updated')
    upcoming_order_payment_detail_updated = ChoiceItem(34, 'upcoming order payment detail updated')
    privacy_policy_update = ChoiceItem(35, 'privacy_policy_update')

# User sign up/welcome
USER_EMAIL_INFO_SIGN_UP = {
    'email_type': EmailType.sign_up,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Welcome to Dear Brightly!",
            'LEAD_IN_TEXT': "Welcome to Dear Brightly! Ready for your best skin possible?",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Our service makes it happen using the cleanest derm-grade retinoid and made-for-you formulas. "
                                      "It’ll feel incredible, and the results will reveal the best version of you. "
                                      "We say this all with confidence—because it works! Here’s proof:",
                },
                {
                    'HREF_BODY': "Retinoids vs. Retinol".split(),
                    'HREF_DATA': {(0, 2): ("Retinoids vs. Retinol", "https://www.dearbrightly.com/blog/retinol-vs-retinoid-everything-you-need-to-know")}
                },
                {
                    'HREF_BODY': "Before & After".split(),
                    'HREF_DATA': {(0, 2): ("Before & After", "https://www.dearbrightly.com/blog/tretinoin-before-and-after/")}
                },
                {
                    'HREF_BODY': "What to Expect".split(),
                    'HREF_DATA': {(0, 2): ("What to expect", "https://www.dearbrightly.com/blog/what-to-expect-with-tretinoin-benefits-and-side-effects/")}
                },
                {
                    'BODY_PARAGRAPH': "Retinoid has completely changed our skin, but we knew there had to be an easier and better way to access it."
                },
                {
                    'BODY_PARAGRAPH': "We're that better way."
                },
                {
                    'BODY_PARAGRAPH': "Ready to get started? We’ll be with you every step of the way."
                },
                {
                    'CTA_BUTTON_TEXT': "Get Started",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/products",
                },
            ]
        }
    }
}

# User sign up, empty cart
USER_EMAIL_INFO_EMPTY_CART = {
    'email_type': EmailType.empty_cart,
    'time_intervals_in_days': {
        1: {
            'SUBJECT_LINE': "Why Retinoids?",
            'LEAD_IN_TEXT': "Welcome to Dear Brightly!",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "You’re curious about derm-grade retinoids—we get it, it’s game-changing but also complex stuff! "
                                      "You’ve come to the right place. "
                                      "We’re changing the way you access derm-grade skincare, and making it easier than ever.",
                },
                {
                    'BODY_PARAGRAPH': "The results speak for themselves, or rather, exclaim in excitement! Check out our bestseller:",
                    'IMAGE_HREF_URL': "https://www.dearbrightly.com/products/night-shift",
                    'IMAGE_ALT': "bestseller",
                    'IMAGE_URL': "https://d17yyftwrkmnyz.cloudfront.net/night_shift_products_page.jpg",
                    # 'IMAGE_CAPTION': "Tailored Retinoid"
                },
                {
                    'CTA_BUTTON_TEXT': "Get Started",
                    'CTA_BUTON_URL': 'https://www.dearbrightly.com/products/night-shift',
                },
                {
                    'HREF_BODY': "Seriously, a derm-grade retinoid has been life changing for many, including us founders. "
                                 "That’s why it’s our mission to bring this not-so-little industry secret directly to you.".split(),
                    'HREF_DATA': {(12, 12): ("founders.", "https://www.dearbrightly.com/about-us")}
                },
                {
                    'BODY_PARAGRAPH': "Questions? Send ’em our way, anytime. We’re always here for you."
                }
            ]
        },
        2: {
            'SUBJECT_LINE': "You + retinoid = power duo",
            'LEAD_IN_TEXT': "Retinoid is blowing our minds, and safely changing our skin.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Here’s what makes it so impressive:",
                },
                {
                    'LIST': ["If it were in the skincare olympics, it’d win gold. Tretinoin (derm-grade retinoid) is 20x times more potent than retinol. ",
                             "It multi-tasks better than us on our third cup of coffee. It prevents and treats photoaging, acne, and more.",
                             "It’s the VIP in skincare because Tretinoin, the only FDA-approved derm-grade retinoid for photoaging, can’t be found over the counter."],
                },
                {
                    'BODY_PARAGRAPH': "The results speak for themselves, or rather, exclaim in excitement! Check out our bestseller:",
                    'IMAGE_HREF_URL': "https://www.dearbrightly.com/products/night-shift",
                    'IMAGE_ALT': "bestseller",
                    'IMAGE_URL': "https://d17yyftwrkmnyz.cloudfront.net/night_shift_products_page.jpg"
                },
                {
                    'CTA_BUTTON_TEXT': "Get Started",
                    'CTA_BUTON_URL': 'https://www.dearbrightly.com/products/night-shift',
                },
                {
                    'BODY_PARAGRAPH': "Questions? Send ’em our way, anytime. We’re always here for you."
                }
            ]
        }
    }
}

# Abandoned Cart
USER_EMAIL_INFO_ABANDONED_CART = {
    'email_type': EmailType.abandoned_cart,
    'time_intervals_in_days': {
        1: {
            'SUBJECT_LINE': "Friends don’t let friends quit on skincare",
            'LEAD_IN_TEXT': "Are you ready to take your skincare to the next level? ",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "A few clicks here, another there, and *BAM* get ready to receive your two-month trial of "
                                      "tailored-to-you, derm-grade retinoid, made with only the most premium ingredients."
                },
                {
                    'CTA_BUTTON_TEXT': "Complete Purchase",
                    'CTA_BUTON_URL': 'https://www.dearbrightly.com/checkout',
                },
            ]
        },
        2: {
            'SUBJECT_LINE': "You’re onto something here…",
            'LEAD_IN_TEXT': "Don’t leave your skin hangin’.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Think of derm-grade retinoid as the ultimate form of self care (sorry, clay masks, but you only do so much)."
                },
                {
                    'CTA_BUTTON_TEXT': "Complete Purchase",
                    'CTA_BUTON_URL': 'https://www.dearbrightly.com/checkout',
                },
                {
                    'BODY_PARAGRAPH': "Questions? Send ’em our way, anytime. We’re always here for you.",
                },
            ]
        },
    }
}

# Incomplete Questionnaire
USER_EMAIL_INFO_INCOMPLETE_SKIN_PROFILE = {
    'email_type': EmailType.incomplete_questionnaire,
    'time_intervals_in_days': {
        1: {
            'SUBJECT_LINE': "Action needed: Complete your Skin Profile",
            'LEAD_IN_TEXT': "We already like you—but let’s get a little more acquainted.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "We’re not talking moon signs, but something a little more scientific: your Skin Profile. "
                                      "It’s designed to provide expert care to you, and in-depth details for your provider.",
                },
                {
                    'BODY_PARAGRAPH': "To complete yours, all you have to do is answer a few questions and upload some photos—like a dating profile, but way less cringey. "
                                      "Oh, and it can lead to next-level skin, no big deal.",
                },
                {
                    'CTA_BUTTON_TEXT': "Finish Skin Profile",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard",
                },
            ]
        },
        2: {
            'SUBJECT_LINE': "2nd reminder: Complete your Skin Profile",
            'LEAD_IN_TEXT': "Dear Brightly here, you know, the company that’s bringing derm-grade formulas to the mainstream.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "But enough about us! We want to hear about YOU! "
                                      "Complete your Skin Profile, so we can take this to the next level. And by 'this' we mean skincare made just for you.",
                },
                {
                    'CTA_BUTTON_TEXT': "Finish Skin Profile",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard",
                },
            ]
        },
        # TODO (Amy) - This is my filler text. We need copy.
        9: {
            'SUBJECT_LINE': "Last call to complete your Skin Profile",
            'LEAD_IN_TEXT': "Please complete your Skin Profile to complete your order.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Your order will be canceled in a week.",
                },
                {
                    'CTA_BUTTON_TEXT': "Finish Skin Profile",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard",
                },
            ]
        },
        # TODO (Amy) - This is my filler text. We need copy.
        # 14: {
        #     'SUBJECT_LINE': "Your order has been canceled",
        #     'LEAD_IN_TEXT': "We haven't heard from you in awhile, so your order and visit has been canceled.",
        #     'BODY': [
        #         {
        #             'BODY_PARAGRAPH': "Please come back to place a new order.",
        #         },
        #         {
        #             'CTA_BUTTON_TEXT': "Start New Order",
        #             'CTA_BUTON_URL': "https://www.dearbrightly.com/products",
        #         },
        #     ]
        # },
    }
}

# Incomplete Photos
USER_EMAIL_INFO_INCOMPLETE_PHOTOS = {
    'email_type': EmailType.incomplete_photos,
    'time_intervals_in_days': {
        1: {
            'SUBJECT_LINE': "Action needed: Send us your selfies. #NoFilter 📸 required.",
            'LEAD_IN_TEXT': "We know you’ve got some selfies on your phone because, well, it’s 2020.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Upload it filter free to your Skin Profile, and you’re almost ready for your tailored formula.",
                },
                {
                    'CTA_BUTTON_TEXT': "Upload Photos",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard",
                },
            ]
        },
        2: {
            'SUBJECT_LINE': "Action needed: Upload your selfies. It's picture day 📸",
            'LEAD_IN_TEXT': "We bet you already know your best angles.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Have a mini photo shoot, and send us a filter-free pic to finish your Skin Profile.",
                },
                {
                    'CTA_BUTTON_TEXT': "Upload Photos",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard",
                },
            ]
        },
        # TODO (Amy) - This is my filler text. We need copy.
        9: {
            'SUBJECT_LINE': "Last call to submit your photos",
            'LEAD_IN_TEXT': "Please complete uploading your photos to complete your order.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Your order will be canceled in a week.",
                },
                {
                    'CTA_BUTTON_TEXT': "Upload Photos",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard",
                },
            ]
        },
        # TODO (Amy) - This is my filler text. We need copy.
        # 14: {
        #     'SUBJECT_LINE': "Your order has been canceled",
        #     'LEAD_IN_TEXT': "We haven't heard from you in awhile, so your order has been canceled.",
        #     'BODY': [
        #         {
        #             'BODY_PARAGRAPH': "Please come back to place a new order.",
        #         },
        #         {
        #             'CTA_BUTTON_TEXT': "Start New Order",
        #             'CTA_BUTON_URL': "https://www.dearbrightly.com/products",
        #         },
        #     ]
        # },
    }
}

# Incomplete Photo ID
USER_EMAIL_INFO_INCOMPLETE_PHOTO_ID = {
    'email_type': EmailType.incomplete_photo_id,
    'time_intervals_in_days': {
        1: {
            'SUBJECT_LINE': "Action needed: Let's verify it's you.",
            'LEAD_IN_TEXT': "We use Photo ID. We fancy like that.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Unless you have an evil twin, Photo ID is the best way to verify your identity. "
                                      "Upload yours now, and make sure your routine is yours and yours alone.",
                },
                {
                    'CTA_BUTTON_TEXT': "Set Up Photo ID",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard",
                },
            ]
        },
        2: {
            'SUBJECT_LINE': "2nd reminder: Let's verify it's you.",
            'LEAD_IN_TEXT': "Dimples, freckles, beauty marks—they’re what makes you, YOU! 🤩 ",
            'BODY': [
                {
                    'BODY_PARAGRAPH':  "That’s why we use Photo ID to verify your identity. "
                                       "Upload your photo for personalized expert care.",
                },
                {
                    'CTA_BUTTON_TEXT': "Set Up Photo ID",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard",
                },
            ]
        },
        # TODO (Amy) - This is my filler text. We need copy.
        9: {
            'SUBJECT_LINE': "Last call: Let's verify it's you.",
            'LEAD_IN_TEXT': "Please complete uploading your photos to complete your order.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Your order will be canceled in a week. ",
                },
                {
                    'CTA_BUTTON_TEXT': "Set Up Photo ID",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard",
                },
            ]
        },
        # TODO (Amy) - This is my filler text. We need copy.
        # 14: {
        #     'SUBJECT_LINE': "Your order has been canceled",
        #     'LEAD_IN_TEXT': "We haven't heard from you in awhile, so your order has been canceled.",
        #     'BODY': [
        #         {
        #             'BODY_PARAGRAPH': "Please come back to place a new order.",
        #         },
        #         {
        #             'CTA_BUTTON_TEXT': "Start New Order",
        #             'CTA_BUTON_URL': "https://www.dearbrightly.com/products",
        #         },
        #     ]
        # },
    }
}

USER_EMAIL_INFO_ORDER_CANCELATION_SKIN_PROFILE_EXPIRED = {
    'email_type': EmailType.order_cancellation_skin_profile_expired,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Your order has been canceled",
            'LEAD_IN_TEXT': "We haven't heard from you in awhile, so your order has been canceled.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Please come back to place a new order.",
                },
                {
                    'CTA_BUTTON_TEXT': "Start New Order",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/products",
                },
            ]
        },
    }
}

# Completed Skin Profile (New User)
USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_NEW_USER = {
    'email_type': EmailType.skin_profile_completion_new_user,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "You're all set. Skin Profile, check! ✔️",
            'LEAD_IN_TEXT': "Thanks for completing your Skin Profile. We get what makes you so unique! "
                            "Right now, your provider is getting a little nerdy with your formula.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Soon, you’ll receive a two-month trial. "
                                      "It’s just enough time to let your skin get used to the extra boost in cell production. "
                                      "We think you’ll love what you see. "
                                      "After this shipment, you’ll start receiving your new bottle every three months.",
                },
                {
                    'HREF_BODY': "Review your order summary here, and keep an eye out for a shipping confirmation email. "
                                 "Heads up: If you ordered any non-Rx products, they are shipped separately.".split(),
                    'HREF_DATA': {(4, 4): ("here", "https://www.dearbrightly.com/user-dashboard/my-plan")}
                },
                {
                    'BODY_PARAGRAPH': "To ensure delivery of important order-related emails, please add support@dearbrightly.com to your contacts."
                },
                {
                    'INSERT_SHARING_COMPONENT': True,
                }
            ]
        },
    }
}

# TODO (Amy) - Better copy (encouraging, benefits, etc.)
# Completed Skin Profile (Returning User)
USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_RETURNING_USER = {
    'email_type': EmailType.skin_profile_completion_returning_user,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "You’re all set for the year! Skin Profile, check! ✔ ",
            'LEAD_IN_TEXT': "Thanks for completing your yearly Skin Profile. "
                            "We get what makes you so unique! Right now, your provider is getting a little nerdy and re-evaluating your formula.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Soon, you’ll receive your three-month bottle."
                },
                {
                    'HREF_BODY': "You can review your plan here.".split(),
                    'HREF_DATA': {(5, 5): ("here.", "https://www.dearbrightly.com/user-dashboard/my-plan")}
                },
                {
                    'BODY_PARAGRAPH': "To ensure delivery of important order-related emails, please add support@dearbrightly.com to your contacts."
                },
                {
                    'BODY_PARAGRAPH': "Let us know if you have any questions. We’re always here for you."
                },
            ],
            'INSERT_SHARING_COMPONENT': True
        },
    }
}

# TODO (Amy) - Better copy (encouraging, benefits, etc.)
# Completed Skin Profile No Changes (Returning User)
USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_RETURNING_USER_NO_CHANGE = {
    'email_type': EmailType.skin_profile_completion_returning_user_no_change,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "You’re all set for the year! Skin Profile, check! ✔ ",
            'LEAD_IN_TEXT': "Thanks for letting us know that there have been no changes to your Skin Profile. "
                            "Your provider will be re-evaluating your formula.",
            'BODY': [
                {
                    'HREF_BODY': "Soon, you’ll receive your three-month bottle. You can review your plan here.".split(),
                    'HREF_DATA': {(11, 11): ("here.", "https://www.dearbrightly.com/user-dashboard/my-plan")}
                },
                {
                    'BODY_PARAGRAPH': "To ensure delivery of important order-related emails, please add support@dearbrightly.com to your contacts."
                },
                {
                    'BODY_PARAGRAPH': "Let us know if you have any questions. We’re always here for you."
                },
            ],
            'INSERT_SHARING_COMPONENT': True
        },
    }
}

# Completed Skin Profile No Changes (Returning User)
USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_RETURNING_USER_NO_CHANGE_NO_RESPONSE = {
    'email_type': EmailType.skin_profile_completion_returning_user_no_change_no_response,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "No changes submitted for your yearly Skin Profile",
            'LEAD_IN_TEXT': "We haven't heard from you regarding updates to your Skin Profile.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Just wanted to let you know that we will notify your medical provider to use your most recent information on file "
                                      "for your next formula update for the year."
                },
                {
                    'HREF_BODY': "Soon, you’ll receive your three-month bottle. You can review your plan here.".split(),
                    'HREF_DATA': {(11, 11): ("here.", "https://www.dearbrightly.com/user-dashboard/my-plan")}
                },
                {
                    'BODY_PARAGRAPH': "To ensure delivery of important order-related emails, please add support@dearbrightly.com to your contacts."
                },
                {
                    'BODY_PARAGRAPH': "Let us know if you have any questions. We’re always here for you."
                },
            ],
            'INSERT_SHARING_COMPONENT': True
        },
    }
}

# Completed Skin Profile Incomplete Changes (Returning User)
USER_EMAIL_INFO_SKIN_PROFILE_COMPLETION_RETURNING_USER_INCOMPLETE_RESPONSE = {
    'email_type': EmailType.skin_profile_completion_returning_user_incomplete_response,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Incomplete changes submitted for your yearly Skin Profile",
            'LEAD_IN_TEXT': "We haven't received the rest of your updates to your Skin Profile.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Just wanted to let you know that we will notify your medical provider to use your most recent information on file "
                                      "for your next formula update for the year."
                },
                {
                    'HREF_BODY': "Soon, you’ll receive your three-month bottle. You can review your plan here.".split(),
                    'HREF_DATA': {(11, 11): ("here.", "https://www.dearbrightly.com/user-dashboard/my-plan")}
                },
                {
                    'BODY_PARAGRAPH': "To ensure delivery of important order-related emails, please add support@dearbrightly.com to your contacts."
                },
                {
                    'BODY_PARAGRAPH': "Let us know if you have any questions. We’re always here for you."
                },
            ],
            'INSERT_SHARING_COMPONENT': True
        },
    }
}

# Order Shipped (First-time trial)
USER_EMAIL_INFO_ORDER_SHIPPED_TRIAL = {
    'email_type': EmailType.order_shipped_trial,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Here we come! Your trial bottle has shipped",
            'LEAD_IN_TEXT': "It’s happening! Your derm-grade formula is on its way. We like to consider it a love letter to your skin.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "We know you’re excited to receive your first-ever bottle, so here are the details to track your package in real time."
                },
                {
                    'BODY_PARAGRAPH': "Note: If you ordered any non-Rx products, they are shipped separately."
                },
                {
                    'INSERT_ADDRESS_COMPONENT': True,
                    'SHIP_TO_HEADER': "We've shipped your order to:"
                },
                {
                    'HREF_BODY': "In the meantime, view your formula in your Treatment Plan and take a look at our guide before you get started.".split(),
                    'HREF_DATA': {
                        (8, 9): ("Treatment Plan", "https://www.dearbrightly.com/user-dashboard/treatment"),
                        (16, 16): ("guide", "https://www.dearbrightly.com/blog/what-is-tretinoin-the-ultimate-guide-to-this-topical-retinoid/")
                    }
                },
                {
                    'CTA_BUTTON_TEXT': "View formula",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard/treatment-plan",
                },
            ],
            'INSERT_SHARING_COMPONENT': True,
        },
    }
}

# Order Shipped (general)
USER_EMAIL_INFO_ORDER_SHIPPED = {
    'email_type': EmailType.order_shipped,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Special delivery! 💌 Your order has shipped",
            'LEAD_IN_TEXT': "Looks like you’re on track with your routine—you deserve a fist bump from our whole team, but you’ll just have to settle for great skin instead ;)",
            'BODY': [
                {
                    'INSERT_ADDRESS_COMPONENT': True,
                    'SHIP_TO_HEADER': "We've shipped your order to:"
                }
            ],
            'INSERT_SHARING_COMPONENT': True,
        },

    }
}

# Order Tracking Info Update
# TODO (Amy) - Better copy? I just put something down for now.
USER_EMAIL_INFO_ORDER_TRACKING_UPDATE = {
    'email_type': EmailType.order_tracking_update,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "FYI, we've updated your order tracking number",
            'LEAD_IN_TEXT': "We'll keep it short and sweet. Here is your updated tracking info:",
            'BODY': [
                {
                    'INSERT_ADDRESS_COMPONENT': True,
                    'SHIP_TO_HEADER': "We've shipped your order to:"
                },
            ],
            'INSERT_SHARING_COMPONENT': True,
        },
    }
}

# Order Arrived
USER_EMAIL_INFO_ORDER_ARRIVED = {
    'email_type': EmailType.order_arrived,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Check your doorstep, your order has arrived!",
            'LEAD_IN_TEXT': "If you need an excuse to leave where you are, and go home: this is it.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Your order has been delivered! "
                                      "We can’t wait for you to try it out."
                },
                {
                    'HREF_BODY': "Remember, you can always tap your provider with any questions about your treatment.".split(),
                    'HREF_DATA': {(4, 6): ("tap your provider", "https://www.dearbrightly.com/user-dashboard/messages")}
                },
            ],
            'INSERT_SHARING_COMPONENT': True,
        },
    }
}

# Provider Message
USER_EMAIL_INFO_PROVIDER_MESSAGE = {
    'email_type': EmailType.provider_message,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "You’ve got a message!",
            'LEAD_IN_TEXT': "Expert care is coming your way! Your provider has a special message for you.",
            'BODY': [
                {
                    'CTA_BUTTON_TEXT': "Check Message",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard/messages",
                }
            ]
        },
    }
}


# User Check-Ins
USER_EMAIL_INFO_CHECK_IN = {
    'email_type': EmailType.user_check_in,
    'time_intervals_in_days': {
        14: {
            'SUBJECT_LINE': "It’s been 2 whole weeks! How's it going?",
            'LEAD_IN_TEXT': "You can’t see us, but we’re doing a little celebratory dance—because you’re officially two weeks into your trial!",
            'BODY': [
                {
                    'HREF_BODY': "That means, you *might* be experiencing some totally normal changes. "
                                 "Here’s a breakdown of what to look out for.".split(),
                    'HREF_DATA': {(12, 12): ("breakdown", "https://www.dearbrightly.com/blog/what-to-expect-with-tretinoin-benefits-and-side-effects/")}
                },
                {
                    'HREF_BODY': "For the rest of your trial, check out our guide to create the ultimate routine.".split(),
                    'HREF_DATA': {(9, 9): ("guide", "https://www.dearbrightly.com/blog/what-is-tretinoin-the-ultimate-guide-to-this-topical-retinoid/")}
                },
                {
                    'BODY_PARAGRAPH': "Got questions? Your provider is always here for you."
                },
            ],
            'INSERT_EMPHATIC_SHARING_COMPONENT': True,
        },
        35: {
            'SUBJECT_LINE': "How's it going?",
            'LEAD_IN_TEXT': "We'd love to hear your thoughts on how it's going so far with our 1-minute survey.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "We listen to each feedback and have implemented some already :-).",
                },
                {
                    'CTA_BUTTON_TEXT': "Take 1-min Survey",
                    'CTA_BUTON_URL': "https://dearbrightly.typeform.com/to/j07MV9",
                },
                {
                    'BODY_PARAGRAPH': 'Thanks! We really appreciate it.'
                },
            ],
            'INSERT_SHARING_COMPONENT': True,
        },
        42: {
            'SUBJECT_LINE': "How's it going? We wanted to see how you're doing.",
            'LEAD_IN_TEXT': "This calls for confetti: You’re six weeks into your trial!",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Maybe you’re not seeing results right away, but that doesn’t mean change isn’t happening at the cellular level. "
                                      "Good things are happening beyond the naked eye. "
                                      "Soon, you won’t need a lab coat and microscope to see results.",
                },
                {
                    'BODY_PARAGRAPH': "Got questions? Just reply to this email. Given our own skin journey, we love talking about this stuff. "
                                      "We’re always here for you."
                },
            ],
            'INSERT_EMPHATIC_SHARING_COMPONENT': True,
        }
    }
}

# Upcoming subscription order - Update in Rx (new user)
USER_EMAIL_INFO_UPCOMING_SUBSCRIPTION_ORDER_RX_UPDATED_NEW_USER = {
    'email_type': EmailType.upcoming_subscription_order_rx_update_new_user,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Reminder re: your upcoming bottle",
            'LEAD_IN_TEXT': "It’s official! Your derm-grade formula is now a part of your nighttime routine (and the star of it).",
            'BODY': [
                {
                    'BODY_PARAGRAPH' : "Your trial is over and your provider has ramped you up to your highest strength for your remaining upcoming bottles. "
                                       "It's a bit stronger, but your provider thinks you're ready for it. "
                },
                {
                    'HREF_BODY': "Your new bottle will be on its way—view your upcoming formula in your Treatment Plan and "
                                 "keep an eye out for a shipping confirmation.".split(),
                    'HREF_DATA': {(13, 14): ("Treatment Plan", "https://www.dearbrightly.com/user-dashboard/treatment-plan")}
                },
                {
                    'INSERT_ADDRESS_COMPONENT': True,
                    'SHIP_TO_HEADER': "We'll be shipping your order to:"
                },
                {
                    'BODY_PARAGRAPH': "Of course, you can make changes anytime to your plan within 5 days of receiving this email."
                },
                {
                    'CTA_BUTTON_TEXT': "Edit Plan",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard/my-plan",
                },
                {
                    'BODY_PARAGRAPH': "Got questions? Send ’em our way, anytime. We’re always here for you.",
                },
            ],
            'INSERT_SHARING_COMPONENT': True,
        },
    }
}

# Upcoming subscription order - No change in Rx (new user)
USER_EMAIL_INFO_UPCOMING_SUBSCRIPTION_ORDER_RX_UNCHANGED_NEW_USER = {
    'email_type': EmailType.upcoming_subscription_order_rx_unchanged_new_user,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Reminder re: your upcoming bottle",
            'LEAD_IN_TEXT': "It’s official! Your derm-grade formula is now a part of your routine (and the star of it).",
            'BODY': [
                {
                    'HREF_BODY': "Your new bottle will be on its way—view your upcoming formula in your Treatment Plan and "
                                 "keep an eye out for a shipping confirmation.".split(),
                    'HREF_DATA': {
                        (13, 14): ("Treatment Plan", "https://www.dearbrightly.com/user-dashboard/treatment-plan")}
                },
                {
                    'INSERT_ADDRESS_COMPONENT': True,
                    'SHIP_TO_HEADER': "We'll be shipping your order to:"
                },
                {
                    'BODY_PARAGRAPH': "Of course, you can make changes anytime to your plan within 5 days of receiving this email."
                },
                {
                    'CTA_BUTTON_TEXT': "Edit Plan",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard/my-plan",
                },
                {
                    'BODY_PARAGRAPH': "We can't wait to hear what you think! You can always keep it real with us.",
                },
            ],
            'INSERT_SHARING_COMPONENT': True,
        },
    }
}

# TODO (Amy): remove copy around interim bottle when new bottle goes out. ETA February.
# Upcoming subscription order - Update in Rx (returning user)
USER_EMAIL_INFO_UPCOMING_SUBSCRIPTION_ORDER_RX_UPDATED_RETURNING_USER = {
    'email_type': EmailType.upcoming_subscription_order_rx_update_returning_user,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Your upcoming bottle (same product, different interim look)",
            'LEAD_IN_TEXT': "You’re on a roll! Your provider updated your formula, and your next refill is on its way.",
            'BODY': [
                {
                    'BODY_PARAGRAPH' : "You've been ramped up to your highest strength for your remaining upcoming bottles. "
                                       "It's a bit stronger, but your provider thinks you're ready for it. "
                },
                {
                    'BODY_PARAGRAPH' : "Also, heads up! If you haven't already, you'll be receiving your formula in our new "
                                       "refillable glass bottle. If you have already, this is a friendly reminder to not throw it away—you’ll "
                                       "need it for this upcoming refill!"
                },
                {
                    'HREF_BODY': "View your upcoming formula in your Treatment Plan and keep an eye out for a shipping confirmation.".split(),
                    'HREF_DATA': {(6, 7): ("Treatment Plan", "https://www.dearbrightly.com/user-dashboard/treatment-plan")}
                },
                {
                    'INSERT_ADDRESS_COMPONENT': True,
                    'SHIP_TO_HEADER': "We'll be shipping your order to:"
                },
                {
                    'BODY_PARAGRAPH': "Of course, you can make changes anytime to your plan within 5 days of receiving this email."
                },
                {
                    'CTA_BUTTON_TEXT': "Edit Plan",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard/my-plan",
                },
                {
                    'BODY_PARAGRAPH': "Got questions? Send ’em our way, anytime. We’re always here for you.",
                },
            ],
            'INSERT_SHARING_COMPONENT': True,
        },
    }
}

# TODO (Amy): remove copy around interim bottle when new bottle goes out. ETA February.
# Upcoming subscription order - No change in Rx (returning user)
USER_EMAIL_INFO_UPCOMING_SUBSCRIPTION_ORDER_RX_UNCHANGED_RETURNING_USER = {
    'email_type': EmailType.upcoming_subscription_order_rx_unchanged_returning_user,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Your upcoming bottle (same product, different interim look)",
            'LEAD_IN_TEXT': "You’re on a roll! A new bottle is on its way.",
            'BODY': [
                {
                    'HREF_BODY': "Review your upcoming order here, and keep an eye out for a shipping confirmation email.".split(),
                    'HREF_DATA': {(4, 4): ("here", "https://www.dearbrightly.com/user-dashboard/my-plan")}
                },
                {
                    'INSERT_ADDRESS_COMPONENT': True,
                    'SHIP_TO_HEADER': "We'll be shipping your order to:"
                },
                {
                    'BODY_PARAGRAPH': "Of course, you can make changes anytime to your plan within 5 days of receiving this email."
                },
                {
                    'CTA_BUTTON_TEXT': "Edit Plan",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard/my-plan",
                },
                {
                    'BODY_PARAGRAPH': "We can't wait to hear what you think! You can always keep it real with us.",
                },
            ],
            'INSERT_SHARING_COMPONENT': True,
        },
    }
}

# Annual Visit
USER_EMAIL_INFO_ANNUAL_VISIT = {
    'email_type': EmailType.user_annual_visit,
    'time_intervals_in_days': {
        21: {
            'SUBJECT_LINE': "Action needed: Time to update your yearly Skin Profile",
            'LEAD_IN_TEXT': "Whoa, it’s been a minute (maybe a year)! It’s time to update your yearly Skin Profile.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "We haven’t heard from you in almost a year. "
                                      "Your next order ships soon and we wanted to provide the best care for your skin. "

                },
                {
                    'BODY_PARAGRAPH': "In order for the medical provider to best refill your next order, let us know if you have any changes to your medical info or Skin Profile. "
                                      "This is your chance to let us know if you have any medical updates, skin changes, or new skin goals.",
                },
                {
                    'YES_NO_CTA_BUTTON_TITLE': "Any updates to your Skin Profile?",
                    'YES_NO_CTA_BUTTON_SUB_TITLE': "It takes a minute to update your Skin Profile.",
                    'YES_CTA_BUTTON_TEXT': "Yes",
                    'NO_CTA_BUTTON_TEXT': "No",
                    'YES_CTA_BUTON_URL': "https://www.dearbrightly.com/update-skin-profile",
                    'NO_CTA_BUTON_URL': "https://www.dearbrightly.com/welcome-back",
                },
                {
                    'BODY_PARAGRAPH': "Let us know if you have any questions. We’re always here for you.",
                },
            ],
            'INSERT_SHARING_COMPONENT': True,
        },
        14: {
            'SUBJECT_LINE': "Action needed: Update your Skin Profile for your upcoming bottle",
            'LEAD_IN_TEXT': "Time flies when your skin is living its best life. ",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "It’s already been a year since you discovered the wonders of your derm-grade formula! "
                                      "Your next order will ship soon (in two weeks). "
                                      "That means it’s time to re-evaluate your skin goals. ",
                },
                {
                    'BODY_PARAGRAPH': "This is your chance to let us know if you have any medical updates, skin changes, or new skin concerns. "
                                      "Any updates will allow us to make sure your formula is evolving right along with you.",
                },
                {
                    'YES_NO_CTA_BUTTON_TITLE': "Any updates to your Skin Profile?",
                    'YES_NO_CTA_BUTTON_SUB_TITLE': "It takes a minute to update your Skin Profile.",
                    'YES_CTA_BUTTON_TEXT': "Yes",
                    'NO_CTA_BUTTON_TEXT': "No",
                    'YES_CTA_BUTON_URL': "https://www.dearbrightly.com/update-skin-profile",
                    'NO_CTA_BUTON_URL': "https://www.dearbrightly.com/welcome-back",
                },
                {
                    'HIGHLIGHTED_BODY': "If no response is received within 10 days of receipt of this email, "
                                        "we will notify your medical provider to use the information from your most recent Skin Profile.".split(),
                    'HIGHLIGHTED_BODY_DATA': {(0, 12): "If no response is received within 10 days of receipt of this email,".split()}
                },
                {
                    'BODY_PARAGRAPH': "Let us know if you have any questions. We’re always here for you.",
                },
            ],
            'INSERT_SHARING_COMPONENT': True,
        },
        # 14: {
        #     'SUBJECT_LINE': "Last call to update your yearly Skin Profile",
        #     'LEAD_IN_TEXT': "Awww, it’s our anniversary! Which means…",
        #     'BODY': [
        #         {
        #             'BODY_PARAGRAPH':  "It’s been a year since you’ve taken your skincare to the next level with your derm-grade formula. "
        #                                "Reflect on all your changes by updating your Skin Profile. "
        #                                "It’s sooo easy—because the answers are all about you. ",
        #         },
        #         {
        #             'CTA_BUTTON_TEXT': "Update your Skin Profile",
        #             'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard",
        #         },
        #     ],
        #     'INSERT_SHARING_COMPONENT': True,
        # },
        # Sent to users with paid orders, but expired visits
        # 0: {
        #     'SUBJECT_LINE': "Action needed: Update your yearly Skin Profile so that we can ship your order",
        #     'LEAD_IN_TEXT': "You have a paid order pending, but we haven’t heard from you in over a year. "
        #                     "Before shipping, we wanted to provide the best care for your skin.",
        #     'BODY': [
        #         {
        #             'BODY_PARAGRAPH': "In order for the medical provider to best refill your next order, let us know if you have any changes to your medical info or Skin Profile. "
        #                               "This is your chance to let us know if you have any medical updates, skin changes, or new skin goals.",
        #         },
        #         {
        #             'YES_NO_CTA_BUTTON_TITLE': "Any updates to your Skin Profile?",
        #             'YES_NO_CTA_BUTTON_SUB_TITLE': "It takes a minute to update your Skin Profile.",
        #             'YES_CTA_BUTTON_TEXT': "Yes",
        #             'NO_CTA_BUTTON_TEXT': "No",
        #             'YES_CTA_BUTON_URL': "https://www.dearbrightly.com/update-skin-profile",
        #             'NO_CTA_BUTON_URL': "https://www.dearbrightly.com/welcome-back",
        #         },
        #         {
        #             'HIGHLIGHTED_BODY': "If no response is received within 10 days of receipt of this email, "
        #                                 "we will notify your medical provider to use the information from your most recent Skin Profile.".split(),
        #             'HIGHLIGHTED_BODY_DATA': {
        #                 (0, 12): "If no response is received within 10 days of receipt of this email,".split()}
        #         },
        #         {
        #             'BODY_PARAGRAPH': "Let us know if you have any questions. We’re always here for you.",
        #         },
        #     ],
        #     'INSERT_SHARING_COMPONENT': True,
        # },

    }
}

# Payment failure
USER_EMAIL_INFO_PAYMENT_FAILURE = {
    'email_type': EmailType.payment_failure,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Action needed: Update your payment info",
            'LEAD_IN_TEXT': "Ooh, shiny new plastic?",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Update your credit card details. You’ll receive your next bottle like nothing ever happened ;)"
                },
                {
                    'CTA_BUTTON_TEXT': "Update Payment",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard/my-account",
                },
            ]
        },
    }
}

USER_EMAIL_INFO_SUBSCRIPTION_PAYMENT_FAILURE = {
    'email_type': EmailType.subscription_payment_failure,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Action needed: Update your payment info for your upcoming order",
            'LEAD_IN_TEXT': "Your payment failed for your upcoming order.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Update your credit card details to avoid delays in your next order. "
                                      "We will re-try a couple more times before canceling your plan."
                },
                {
                    'CTA_BUTTON_TEXT': "Update Payment",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard/my-account",
                },
            ]
        },
    }
}

USER_EMAIL_INFO_SUBSCRIPTION_CANCEL_PAYMENT_FAILURE = {
    'email_type': EmailType.subscription_cancel_payment_failure,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Plan Canceled",
            'LEAD_IN_TEXT': "We're sorry to see you go.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "We had to cancel your plan after multiple failed payment attempts. "
                                      "Please update your payment details if you'd like to resume your plan."
                },
                {
                    'CTA_BUTTON_TEXT': "Resume Plan",
                    'CTA_BUTON_URL': "https://www.dearbrightly.com/user-dashboard",
                },
            ]
        },
    }
}


# TODO (Amy) - Need copy. I just have placeholder text.
# Order confirmation for users who click ship now
USER_EMAIL_INFO_ORDER_CONFIRMATION_SHIP_NOW = {
    'email_type': EmailType.order_confirmation_ship_now,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Your Early Ship Order Confirmation",
            'LEAD_IN_TEXT': "Thanks for updating your ship date. We're excited you'll be getting your order a bit sooner!",
            'BODY': [
                {
                    'HREF_BODY': "Review your order summary here, and keep an eye out for a shipping confirmation.".split(),
                    'HREF_DATA': {(4, 4): ("here", "https://www.dearbrightly.com/user-dashboard")}
                },
                {
                    'INSERT_ADDRESS_COMPONENT': True,
                    'SHIP_TO_HEADER': "We'll be shipping your order to:"
                },
            ],
            'INSERT_SHARING_COMPONENT': True,
        },
    }
}

# TODO (Amy) - Need copy. I just have placeholder text.
# Order confirmation for users who unpaused a subscription
USER_EMAIL_INFO_ORDER_CONFIRMATION_RESUME = {
    'email_type': EmailType.order_confirmation_resume,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Resume Plan Confirmation",
            'LEAD_IN_TEXT': "Thanks for re-starting your plan. We're excited you'll be getting back on track to healthy, glowing skin!",
            'BODY': [
                {
                    'HREF_BODY': "Review your order summary here, and keep an eye out for a shipping confirmation.".split(),
                    'HREF_DATA': {(4, 4): ("here", "https://www.dearbrightly.com/user-dashboard")}
                },
                {
                    'INSERT_ADDRESS_COMPONENT': True,
                    'SHIP_TO_HEADER': "We're shipping your order to:"
                },
            ],
            'INSERT_SHARING_COMPONENT': True,
        },
    }
}

# Order confirmation for users who updated their payment details and had a pending order
USER_EMAIL_INFO_ORDER_CONFIRMATION_PAYMENT_DETAIL_UPDATED = {
    'email_type': EmailType.order_confirmation_payment_detail_updated,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Order confirmation",
            'LEAD_IN_TEXT': "Thanks for updating your payment info. We'll be processing your order soon!",
            'BODY': [
                {
                    'HREF_BODY': "Review your order summary here, and keep an eye out for a shipping confirmation.".split(),
                    'HREF_DATA': {(4, 4): ("here", "https://www.dearbrightly.com/user-dashboard")}
                }
            ]
        },
    }
}

# TODO (Amy) - Need copy. I just have placeholder text.
# Order Confirmation
USER_EMAIL_INFO_ORDER_CONFIRMATION = {
    'email_type': EmailType.order_confirmation,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "You’re all set! 👌",
            'LEAD_IN_TEXT': "Thanks for your order! Get ready to get that glow. ☀️",
            'BODY': [
                {
                    'HREF_BODY': "You can review your order summary here. "
                                 "Your order should take 3-5 business days to ship, so keep an eye out for a shipping confirmation.".split(),
                    'HREF_DATA': {(6, 6): ("here", "https://www.dearbrightly.com/user-dashboard")}
                },
                {
                    'INSERT_ADDRESS_COMPONENT': True,
                    'SHIP_TO_HEADER': "We'll be shipping your order to:"
                },
                {
                    'BODY_PARAGRAPH': "Let us know if you have any questions. We’re always here for you."
                },
            ],
            'INSERT_SHARING_COMPONENT': True,
        },
    }
}


# Upcoming order following payment detail update
USER_EMAIL_INFO_UPCOMING_ORDER_PAYMENT_DETAIL_UPDATED = {
    'email_type': EmailType.upcoming_order_payment_detail_updated,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Your upcoming order",
            'LEAD_IN_TEXT': "Thanks for updating your payment info. We'll be processing your order soon!",
            'BODY': [
                {
                    'HREF_BODY': "Keep an eye out for a shipping confirmation. You can review your plan here.".split(),
                    'HREF_DATA': {(13, 13): ("here.", "https://www.dearbrightly.com/user-dashboard/my-plan")}
                },
            ]
        },
    }
}


# TODO (Amy) - Need copy. I just have placeholder text.
# Sharing Program
USER_EMAIL_SHARING_PROGRAM = {
    'email_type': EmailType.sharing_program,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "✨{referrer_first_name} wanted to share something special with you!",
            'LEAD_IN_TEXT': "Have you noticed my skin lately? It’s thanks to Dear Brightly.",
            'BODY': [
                {
                    'BODY_PARAGRAPH': "Dear Brightly is changing the way you access derm-grade skincare, and making it easier than ever.",
                },
                {
                    'CTA_BUTTON_TEXT': "Check ’em out!",
                    'CTA_BUTON_URL': 'https://www.dearbrightly.com/products/night-shift',
                },
            ]
        }
    }
}

# Terms of Use update
USER_EMAIL_INFO_TERMS_OF_USE_UPDATE = {
    'email_type': EmailType.terms_of_use_update,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Updates to our Terms of Use",
            'BODY': [
                {
                    'HREF_BODY': "We updated our Terms of Use for all users on December 16, 2020.".split(),
                    'HREF_DATA': {(3, 5): ("Terms of Use",
                                           "https://www.dearbrightly.com/terms-of-use/")}
                },
                {
                    'BODY_PARAGRAPH': "The updated Terms include modifications to the following sections:",
                },
                {
                    'LIST': ["Doctor Patient Relationship",
                             "What about my privacy?",
                             "Consent to receive periodic messages"],
                },
                {
                    'BODY_PARAGRAPH': "The following sections were also added:",
                },
                {
                    'LIST': ["Refunds & Exchanges",
                             "Shipment",
                             "Risk of Loss",
                             "Inspection by Customer",
                             "Auto-refill Plan Terms"],
                },
                {
                    'HREF_BODY': "Please be aware that by continuing to use our services after December 16, 2020, "
                                 "you acknowledge and agree to our updated Terms of Use.".split(),
                    'HREF_DATA': {
                        (21, 23): ("Terms of Use", "https://www.dearbrightly.com/terms-of-use/")}
                },
                {
                    'BODY_PARAGRAPH': "If you have any questions or concerns, please contact us."
                },
            ]
        }
    }
}

# Privacy Policy update
USER_EMAIL_INFO_PRIVACY_POLICY_UPDATE = {
    'email_type': EmailType.privacy_policy_update,
    'time_intervals_in_days': {
        0: {
            'SUBJECT_LINE': "Updates to our Privacy Policy",
            'BODY': [
                {
                    'HREF_BODY': "We've updated our Privacy Policy for all users.".split(),
                    'HREF_DATA': {(3, 4): ("Privacy Policy",
                                           "https://www.dearbrightly.com/privacy-policy/")}
                },
                {
                    'BODY_PARAGRAPH': "The updated Privacy Policy include modifications to the following sections:",
                },
                {
                    'LIST': ["Google Analytics - Clarification on how Google Analytics is used in our website.",
                             "Advertisers - How we collect and use your personal data when you use our apps and websites."],
                },
                {
                    'HREF_BODY': "Please be aware that by continuing to use our services after June 8, 2023, "
                                 "you acknowledge and agree to our updated Privacy Policy.".split(),
                    'HREF_DATA': {
                        (21, 23): ("Privacy Policy", "https://www.dearbrightly.com/privacy-policy/")}
                },
                {
                    'BODY_PARAGRAPH': "If you have any questions or concerns, please contact us."
                },
            ]
        }
    }
}