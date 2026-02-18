/* ================= TIME AGO HELPER ================= */

export const timeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'الآن';

  const minutes = Math.floor(diff / 60);
  if (minutes < 60)
    return `منذ ${minutes} دقيقة`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `منذ ${hours} ساعة`;

  const days = Math.floor(hours / 24);
  if (days < 7)
    return `منذ ${days} يوم`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4)
    return `منذ ${weeks} أسبوع`;

  const months = Math.floor(days / 30);
  if (months < 12)
    return `منذ ${months} شهر`;

  const years = Math.floor(days / 365);
  return `منذ ${years} سنة`;
};


/* ================= TIME AGO HELPER ================= */

export const formatLastSeen = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "Just now";

  const minutes = Math.floor(diff / 60);
  if (minutes < 60)
    return minutes === 1
      ? "1 minute ago"
      : `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return hours === 1
      ? "1 hour ago"
      : `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days < 7)
    return days === 1
      ? "1 day ago"
      : `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4)
    return weeks === 1
      ? "1 week ago"
      : `${weeks} weeks ago`;

  const months = Math.floor(days / 30);
  if (months < 12)
    return months === 1
      ? "1 month ago"
      : `${months} months ago`;

  const years = Math.floor(days / 365);
  return years === 1
    ? "1 year ago"
    : `${years} years ago`;
};

