/**
 * Formats a numeric value into Indian Rupee format.
 * Examples: 150000 => "₹1,50,000", 25000 => "₹25,000", 200 => "₹200"
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  return `₹${formattedNumber}`;
}

export const formatCurrency = formatINR;

/**
 * Returns today's date in YYYY-MM-DD string format (local time).
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD date string to human friendly text.
 * Example: "2026-08-24" => "August 24, 2026" or "Today, 24 Aug"
 */
export function formatDate(dateString: string, options: { relative?: boolean; short?: boolean } = {}): string {
  if (!dateString) return '';

  const todayStr = getTodayDateString();
  
  if (options.relative && dateString === todayStr) {
    return 'Today';
  }

  const d = new Date(dateString + 'T00:00:00');
  if (isNaN(d.getTime())) return dateString;

  if (options.short) {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Calculates days difference between today and a target date.
 */
export function getDaysRemaining(targetDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(targetDateStr + 'T00:00:00');
  if (isNaN(targetDate.getTime())) return 0;

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Generates dynamic motivational messages based on progress percentage and remaining amount.
 */
export function getMotivationalMessage(progressPercent: number, remainingAmount: number): string {
  if (progressPercent >= 100) {
    return '🎉 Congratulations! You reached your goal for the iPhone 17 Pro Max!';
  }
  if (progressPercent >= 75) {
    return `Only ${formatINR(remainingAmount)} to go! You can almost touch it. 📱`;
  }
  if (progressPercent >= 50) {
    return `Halfway there! Keep up the great saving momentum together. 💪`;
  }
  if (progressPercent >= 30) {
    return `Small savings build big dreams. ${progressPercent.toFixed(0)}% complete! ✨`;
  }
  if (progressPercent >= 10) {
    return `Great start! Building habits day by day. 🚀`;
  }
  return `Your iPhone 17 Pro Max journey starts today. Save together! ❤️`;
}
