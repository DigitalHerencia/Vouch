## Stripe integration task

### Objective
Implement this Stripe integration using the blueprint below. The blueprint describes the required API operations, parameters, and sequencing. Adapt the implementation to your architecture, data models, and tech stack.

### How to use the resources
- Treat the blueprint as the source of truth for required API operations and parameters.
- Prefer reusing outputs from earlier steps as inputs to later ones (e.g., use the created customer ID when creating a subscription).
- Persist and retrieve required Stripe resource identifiers in your datastore (e.g., customer_id, subscription_id) and associate them with existing domain models.
- Do NOT use chapter numbers as names in your code. Name all functions, routes, CLI commands, variables, and files after the domain action they perform (e.g., `create_account`, `/create-checkout-session`, `onboard`) rather than the step they came from (e.g., avoid `chapter1`, `step2`, `/chapter1/create-account`).
- Template variables like ${node...} represent outputs from earlier steps that should be used as inputs to later ones. For example, ${node.createProduct.createProductRequest:default_price} refers to the default_price field from the response of the createProductRequest fixture within the createProduct node.
- If connected to the Stripe MCP server, use tool calls as much as possible to create dependent resources (such as products and prices) if they don't exist already.
- Do not guess as to what the required Stripe API version should be. Leave the API version argument empty when initializing the Stripe client unless the blueprint specifies otherwise.
- When populating .env files or constructing commands for the CLI, use environment variable placeholders for API keys (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY) and instruct the user to obtain them from the Stripe Dashboard.

---

### Resources

#### Blueprints (authoritative "what to call")
<blueprints-json>
[
  {
    "title": "Collect payments using Accounts v2 as a marketplace",
    "steps": [
      {
        "key": "create-account-chapter",
        "title": "Create and onboard a connected account",
        "description": "Create an account for each seller on your marketplace.",
        "nodes": [
          {
            "type": "apiRequests",
            "key": "create-account",
            "title": "Create an account",
            "description": "Create a connected account to represent a seller on your marketplace.",
            "requests": [
              {
                "key": "create-account-request",
                "path": "/v2/core/accounts",
                "method": "post",
                "params": {
                  "configuration": {
                    "recipient": {
                      "capabilities": {
                        "stripe_balance": {
                          "stripe_transfers": {
                            "requested": true
                          }
                        }
                      }
                    }
                  },
                  "display_name": "Test account",
                  "contact_email": "testaccount@example.com",
                  "defaults": {
                    "responsibilities": {
                      "losses_collector": "application",
                      "fees_collector": "application"
                    }
                  },
                  "dashboard": "express",
                  "include": [
                    "configuration.merchant",
                    "configuration.recipient",
                    "identity",
                    "defaults",
                    "configuration.customer"
                  ],
                  "identity": {
                    "country": "${env:connectedAccountCountry}"
                  }
                }
              }
            ]
          },
          {
            "type": "apiRequests",
            "key": "create-account-link",
            "title": "Create an account link",
            "description": "In your actual integration, create an account link to collect KYC information from your connected account, which will render a <LinkHosted>Stripe-hosted onboarding flow</LinkHosted>. Alternatively, you can use <LinkEmbedded>embedded onboarding</LinkEmbedded> to integrate the onboarding component into your application or use <LinkApi>API onboarding</LinkApi> to create a customized onboarding UI using Stripe's APIs.",
            "requests": [
              {
                "key": "create-account-link-request",
                "path": "/v2/core/account_links",
                "method": "post",
                "params": {
                  "account": "${node.create-account-chapter.create-account.create-account-request:id}",
                  "use_case": {
                    "type": "account_onboarding",
                    "account_onboarding": {
                      "configurations": [
                        "recipient",
                        "merchant"
                      ],
                      "refresh_url": "https://dashboard.stripe.com/workbench/blueprints/learn-accounts-v2-marketplace/create-account-chapter?confirmation-redirect=create-account-link",
                      "return_url": "https://dashboard.stripe.com/workbench/blueprints/learn-accounts-v2-marketplace/create-account-chapter?confirmation-redirect=create-account-link"
                    }
                  }
                }
              }
            ]
          },
          {
            "type": "uiComponent",
            "key": "onboard-account",
            "title": "Complete KYC data collection",
            "description": "Your connected account can use the generated account link to complete KYC data collection. This node isn't required for this example but will be necessary in your actual implementation."
          },
          {
            "type": "asyncHandler",
            "key": "wait-for-account-onboard",
            "title": "Wait for the account to onboard",
            "events": [
              {
                "eventType": "v2.core.account[configuration.recipient].capability_status_updated",
                "eventPayloadType": "thin"
              }
            ]
          }
        ]
      },
      {
        "key": "accept-embedded-payments-chapter",
        "title": "Accept embedded payments",
        "description": "Create a charge on behalf of the connected account and pay then out to sellers on your marketplace.",
        "nodes": [
          {
            "type": "apiRequests",
            "key": "create-checkout-session",
            "title": "Create a checkout interface",
            "description": "Create a Checkout Session to accept payments. The connected account's customer will be directed to a <LinkHosted>Stripe-hosted prebuilt payment form</LinkHosted> optimized for conversion. Alternatively, you can also <LinkEmbedded>embed a prebuilt payment form</LinkEmbedded> on your site or use the API to build a more <LinkApi>customized checkout experience</LinkApi>.",
            "requests": [
              {
                "key": "create-checkout-session-request",
                "path": "/v1/checkout/sessions",
                "method": "post",
                "params": {
                  "success_url": "https://dashboard.stripe.com/workbench/blueprints/learn-accounts-v2-marketplace/accept-embedded-payments-chapter?confirmation-redirect=create-checkout-session",
                  "line_items": [
                    {
                      "price_data": {
                        "currency": "${env:currency}",
                        "product_data": {
                          "name": "Cookie"
                        },
                        "unit_amount": 100000
                      },
                      "quantity": 1
                    }
                  ],
                  "mode": "payment",
                  "payment_intent_data": {
                    "application_fee_amount": 123,
                    "transfer_data": {
                      "destination": "${node.create-account-chapter.create-account.create-account-request:id}"
                    }
                  }
                }
              }
            ]
          },
          {
            "type": "uiComponent",
            "key": "complete-checkout",
            "title": "Accept a payment",
            "description": "The connected account's customer can then complete a payment on the checkout surface. Click on the link below and fill in the <Link>test card information</Link> with the card number as 4000 0000 0000 0077 to run a successful payment. Use a valid future date, such as 12/31 and any three-digit CVC.",
            "link": "${node.accept-embedded-payments-chapter.create-checkout-session.create-checkout-session-request:id}"
          },
          {
            "type": "asyncHandler",
            "key": "wait-for-checkout",
            "title": "Verify that the payment is complete",
            "events": [
              {
                "eventType": "checkout.session.completed",
                "eventPayloadType": "snapshot"
              }
            ],
            "expectedNumberOfEvents": 1
          }
        ]
      }
    ]
  }
]
</blueprints-json>