# Samsara Choice Ltd — Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Account Isolation**: A user's profile (`/users/{uid}`), cart (`/users/{uid}/cart/{itemId}`), orders (`/orders/{orderId}`), Pay Small Small plans (`/paymentPlans/{planId}`), subscriptions (`/subscriptions/{subId}`), and transactions (`/transactions/{txId}`) are readable and writable ONLY by the owning authenticated verified user (`request.auth.uid == resource.data.userId`) or an authorised admin (`isAdmin()`).
2. **Admin Privilege Separation**: Only verified administrators (`request.auth.token.email == 'usitakatelvin@gmail.com' && request.auth.token.email_verified == true` or existence in `/admins/{uid}`) may create/edit products, categories, store settings, subscription templates, coupons, or verify/override payment statuses and order fulfilment states.
3. **Immutable Ownership & Timestamps**: `userId` and `createdAt` cannot be modified after creation, and `createdAt`/`updatedAt` must match `request.time`.
4. **No Shadow Fields or Oversized Strings**: Every document creation enforces `hasAll` + `hasOnly` and strict `.size()` bounds on all strings and lists.
5. **Fulfilment Locking**: Non-admin customers cannot alter `fulfilmentStatus` or mark `status` as `delivered` or `verified`.

## 2. Dirty Dozen Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. **Unauthenticated Order Creation**: Anonymous request creating `/orders/ord_1` without `request.auth`.
2. **Identity Spoofing on Order**: Authenticated user A creating `/orders/ord_2` with `userId: "user_B"`.
3. **Shadow Field Privilege Escalation on User**: User A creating `/users/userA` with extra field `isAdmin: true` or `role: "admin"`.
4. **Email Spoofing Admin Bypass**: User with `email: "usitakatelvin@gmail.com"` but `email_verified: false` attempting to write `/products/prod_1`.
5. **PII Blanket Read**: User A attempting `get` on `/users/userB` or `list` on `/users`.
6. **Query Scraping Without Filter**: User A running `list` on `/orders` without `where('userId', '==', userA)`.
7. **Self-Verification of Bank Transfer**: User A updating `/transactions/tx_1` to `status: "verified"`.
8. **Self-Unlocking Pay Small Small Fulfilment**: User A updating `/orders/ord_1` `fulfilmentStatus: "eligible_for_dispatch"`.
9. **Resource Poisoning (1MB ID/String)**: User A creating `/orders/{1500_char_id}` or review comment > 1000 chars.
10. **Client Timestamp Forgery**: User A creating `/orders/ord_3` with backdated `createdAt` != `request.time`.
11. **Terminal State Tampering**: User A updating a `cancelled` or `delivered` order.
12. **Cart Cross-Account Tampering**: User A writing to `/users/userB/cart/item_1`.
