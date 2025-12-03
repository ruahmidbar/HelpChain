// src/utils/index.js

/**
 * מחבר מספר מחלקות (CSS classes) למחרוזת אחת, תוך הסרת ערכים ריקים
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * יוצר URL פנימי לדף מסוים לפי השם שלו
 * @param {string} page - שם הדף
 * @returns {string} נתיב URL
 */
export function createPageUrl(page) {
  return `/${page}`;
}
