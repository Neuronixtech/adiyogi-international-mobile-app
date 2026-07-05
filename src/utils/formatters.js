export function formatCurrency(amount) {
  return Number(amount).toLocaleString('en-IN');
}

export function formatRupee(amount) {
  return `₹${formatCurrency(amount)}`;
}
