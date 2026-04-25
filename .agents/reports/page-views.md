# Vouch Page Inventory

Scope is based on the required MVP pages, core flows, and page-state requirements: account creation, verification, Stripe/Connect setup, Vouch creation/acceptance, manual dual confirmation, deterministic release/refund, dashboard, admin visibility, and legal/public pages.

---

## 1. Public / Marketing

1. Landing page — default
2. Landing page — mobile
3. How It Works page
4. Pricing page
5. FAQ page
6. Terms page
7. Privacy page
8. 404 / public not found
9. Public error page

---

## 2. Auth

10. Sign in
11. Sign in — error state
12. Sign up
13. Sign up — from invite link
14. Sign up — from create Vouch CTA
15. Email / account verification pending
16. Auth callback / loading state
17. Auth error / failed session
18. Signed-out redirect state

---

## 3. Onboarding / Setup

19. Setup checklist — incomplete
20. Setup checklist — all complete
21. Setup checklist — blocked by verification
22. Setup checklist — blocked by payment method
23. Setup checklist — blocked by payout setup
24. Identity verification start
25. Identity verification pending
26. Identity verification success
27. Identity verification rejected / requires action
28. Adult verification pending / failed
29. Terms acceptance page / modal
30. Setup return-from-invite state
31. Setup return-from-create-Vouch state

---

## 4. Payment / Payout Setup

32. Payment method setup
33. Payment method setup — provider redirect/loading
34. Payment method ready
35. Payment method failed
36. Payout / Stripe Connect setup
37. Payout onboarding redirect/loading
38. Payout ready
39. Payout restricted / requires action
40. Payout setup failed
41. Payment settings overview

---

## 5. Dashboard / User App

42. Dashboard — empty state
43. Dashboard — action required
44. Dashboard — active Vouches
45. Dashboard — mixed Vouch states
46. Dashboard — payer-focused
47. Dashboard — payee-focused
48. Dashboard — loading skeleton
49. Dashboard — error state
50. Vouch list page
51. Vouch list — filtered by pending
52. Vouch list — filtered by active
53. Vouch list — filtered by completed
54. Vouch list — filtered by expired/refunded
55. Vouch list — empty filtered result

---

## 6. Create Vouch Flow

56. Create Vouch — intro/default
57. Create Vouch — amount step
58. Create Vouch — time/window step
59. Create Vouch — recipient/share-link step
60. Create Vouch — review step
61. Create Vouch — fee breakdown
62. Create Vouch — terms acknowledgement
63. Create Vouch — payment processing/loading
64. Create Vouch — success / invite created
65. Create Vouch — copy invite link
66. Create Vouch — recipient email sent
67. Create Vouch — blocked by setup
68. Create Vouch — payment failed
69. Create Vouch — invalid amount
70. Create Vouch — invalid time window

---

## 7. Invite / Accept Vouch Flow

71. Invite landing — unauthenticated
72. Invite landing — authenticated
73. Invite landing — invalid token
74. Invite landing — expired invite
75. Invite landing — already accepted
76. Review Vouch before acceptance
77. Accept Vouch — setup blocked
78. Accept Vouch — payout setup required
79. Accept Vouch — terms required
80. Accept Vouch — confirmation modal
81. Accept Vouch — success / active state
82. Decline Vouch — confirmation modal
83. Decline Vouch — success
84. Accept Vouch — self-acceptance denied

---

## 8. Vouch Detail

85. Vouch detail — pending / payer view
86. Vouch detail — pending / invite sent
87. Vouch detail — active before confirmation window
88. Vouch detail — active confirmation window open
89. Vouch detail — payer confirmed / waiting for payee
90. Vouch detail — payee confirmed / waiting for payer
91. Vouch detail — both confirmed / processing release
92. Vouch detail — completed
93. Vouch detail — expired
94. Vouch detail — refunded / voided / non-captured
95. Vouch detail — failed payment
96. Vouch detail — failed release
97. Vouch detail — failed refund
98. Vouch detail — unauthorized / not found
99. Vouch detail — loading skeleton

Vouch detail is the critical screen because the product requires users to understand status, amount, required action, deadline, missing confirmation, and final outcome without ambiguity.

---

## 9. Confirmation Flow

100. Confirm presence page — payer
101. Confirm presence page — payee
102. Confirm presence — before window opens
103. Confirm presence — window open
104. Confirm presence — already confirmed
105. Confirm presence — waiting for other party
106. Confirm presence — both confirmed success
107. Confirm presence — window closed
108. Confirm presence — duplicate confirmation error
109. Confirm presence — unauthorized participant
110. Confirm presence — provider/payment failure

---

## 10. Account / Settings

111. Account settings overview
112. Profile basics / private account info
113. Verification status card
114. Payment readiness card
115. Payout readiness card
116. Terms/legal status card
117. Account disabled state
118. Settings loading state
119. Settings error state

No public profile mockups. Profiles, ratings, search/discovery, messaging, reviews, and provider directories are explicitly forbidden.

---

## 11. Notifications / Email Templates

120. Invite email
121. Vouch accepted email
122. Confirmation window open email
123. Confirmation recorded email
124. Vouch completed email
125. Vouch expired/refunded email
126. Payment failed email

---

## 12. Admin / Operations

127. Admin dashboard
128. Admin dashboard — failure-heavy state
129. Admin Vouch list
130. Admin Vouch list — filtered by failed
131. Admin Vouch detail
132. Admin Vouch detail — completed
133. Admin Vouch detail — expired/refunded
134. Admin Vouch detail — payment failed
135. Admin users list
136. Admin user detail
137. Admin payments list
138. Admin payment detail
139. Admin webhook events list
140. Admin webhook event detail
141. Admin audit log
142. Admin audit event detail
143. Admin safe retry confirmation
144. Admin safe retry success/failure
145. Admin unauthorized / non-admin denied

Admin mockups must stay operational only. No dispute cases, evidence upload, manual fund award, or confirmation rewrite screens.

---

## 13. System / Shared States

146. Global loading shell
147. Route loading skeleton
148. Global error
149. Protected route unauthorized
150. Entity not found
151. Toast / notification states
152. Form validation error pattern
153. Server action failure pattern
154. Payment provider unavailable
155. Maintenance / degraded service banner

---

## Recommended Mockup Order

Start with:

1. Landing page
2. Dashboard
3. Create Vouch flow
4. Accept Vouch flow
5. Vouch detail variants
6. Confirmation variants
7. Setup/payment/payout
8. Admin operational views

That gets the core product loop visually locked before spending time on secondary states.
