/**
 * Date formatting utilities
 */

/**
 * Format date to dd/mm/yyyy format
 */
export const formatDateToDDMMYYYY = (date: Date | string | null | undefined): string => {
  if (!date) return '';

  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (isNaN(dateObj.getTime())) return '';

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Format time to hh:mm format
 */
export const formatTimeToHHMM = (time: string | null | undefined): string => {
  if (!time) return '';

  // If time is already in HH:mm format, return as is
  if (time.match(/^\d{2}:\d{2}$/)) {
    return time;
  }

  // If time is in HH:mm:ss format, truncate seconds
  if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return time.substring(0, 5);
  }

  return time;
};

/**
 * Format date and time together to dd/mm/yyyy hh:mm
 */
export const formatDateTimeToPattern = (dateTime: Date | string | null | undefined, _pattern?: string): string => {
  if (!dateTime) return '';

  let dateObj: Date;
  if (typeof dateTime === 'string') {
    dateObj = new Date(dateTime);
  } else {
    dateObj = dateTime;
  }

  if (isNaN(dateObj.getTime())) return '';

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
