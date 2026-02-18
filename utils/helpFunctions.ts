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


export const formatTime = (dateString: string) => {

  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.toDateString() === yesterday.toDateString();

  const diffDays =
    Math.floor(
      (now.getTime() - date.getTime()) /
      (1000 * 60 * 60 * 24)
    );

  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  if (isToday) {
    return timePart;
  }

  if (isYesterday) {
    return `Yesterday ${timePart}`;
  }

  if (diffDays < 7) {
    const dayName = date.toLocaleDateString("en-US", {
      weekday: "long"
    });
    return `${dayName} ${timePart}`;
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }) + ` ${timePart}`;
};
export const formatChatTime = (dateString?: string) => {

  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  });
};

export const formatLastSeenListFriend = (
  dateString?: string | null
): string => {

  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) return "";

  /* ================= SAME DAY ================= */

  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  /* ================= YESTERDAY ================= */

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "Yesterday";
  }

  /* ================= WITHIN THIS WEEK ================= */

  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
    });
  }

  /* ================= OLDER THAN WEEK ================= */

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${day}.${month}.${year}`;
};


export const truncateText = (text: string, maxLength: number) => {
  if (!text) return "";
  return text.length > maxLength
    ? text.substring(0, maxLength) + "..."
    : text;
};
