export const formatINR = (amountInPaise: number): string => {
  const amountInRupees = amountInPaise / 100;
  return `₹${amountInRupees.toFixed(2)}`;
};
