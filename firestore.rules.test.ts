/**
 * Dirty Dozen Security Rule Verification Specification (Firestore Emulator Suite)
 * Documents the 12 adversarial payloads tested against firestore.rules.
 */
export const DIRTY_DOZEN_CASES = [
  { name: 'Unauthenticated order create', path: 'orders/ord_1', auth: null, expected: 'PERMISSION_DENIED' },
  { name: 'Identity spoofing on order', path: 'orders/ord_2', auth: 'user_A', payload: { userId: 'user_B' }, expected: 'PERMISSION_DENIED' },
  { name: 'Shadow field privilege escalation', path: 'users/user_A', auth: 'user_A', payload: { isAdmin: true }, expected: 'PERMISSION_DENIED' },
  { name: 'Unverified admin email spoof', path: 'products/prod_1', auth: { email: 'usitakatelvin@gmail.com', email_verified: false }, expected: 'PERMISSION_DENIED' },
  { name: 'PII blanket read on other user', path: 'users/user_B', auth: 'user_A', expected: 'PERMISSION_DENIED' },
  { name: 'Unfiltered list query on orders', path: 'orders', auth: 'user_A', query: 'all', expected: 'PERMISSION_DENIED' },
  { name: 'Customer self-verifying transaction', path: 'transactions/tx_1', auth: 'user_A', payload: { status: 'verified' }, expected: 'PERMISSION_DENIED' },
  { name: 'Customer unlocking Pay Small Small dispatch early', path: 'orders/ord_1', auth: 'user_A', payload: { balanceRemaining: 5000, fulfilmentStatus: 'eligible_for_dispatch' }, expected: 'PERMISSION_DENIED' },
  { name: 'Oversized document ID poisoning', path: `orders/${'a'.repeat(500)}`, auth: 'user_A', expected: 'PERMISSION_DENIED' },
  { name: 'Client timestamp forgery', path: 'orders/ord_3', auth: 'user_A', payload: { createdAt: '2020-01-01T00:00:00Z' }, expected: 'PERMISSION_DENIED' },
  { name: 'Modifying cancelled order', path: 'orders/ord_cancelled', auth: 'user_A', payload: { status: 'paid' }, expected: 'PERMISSION_DENIED' },
  { name: 'Cross-account cart tampering', path: 'users/user_B/cart/item_1', auth: 'user_A', expected: 'PERMISSION_DENIED' }
];
