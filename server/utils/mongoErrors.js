/** MongoDB / Mongoose errors when the deployment does not support multi-document transactions. */
export function isTransactionUnsupportedError(err) {
  if (!err) return false;
  const msg = String(err.message || "");
  return (
    /replica set|mongos|Transaction numbers are only allowed|retryable writes/i.test(msg) ||
    err.code === 20
  );
}
