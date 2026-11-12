export const isRequired = (value) =>
  value !== null && value !== undefined && String(value).trim().length > 0;

export const isEmail = (value) =>
  !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

export const isPhone = (value) =>
  !value || /^[0-9+()\s-]{7,20}$/.test(String(value).trim());

export const isPositiveNumber = (value) =>
  Number.isFinite(Number(value)) && Number(value) > 0;

export const isNonNegativeNumber = (value) =>
  Number.isFinite(Number(value)) && Number(value) >= 0;

export const isPositiveInt = (value) =>
  Number.isInteger(Number(value)) && Number(value) > 0;

export const isNonNegativeInt = (value) =>
  Number.isInteger(Number(value)) && Number(value) >= 0;

export const isDate = (value) =>
  !value || /^\d{4}-\d{2}-\d{2}$/.test(String(value));

export const today = () => new Date().toISOString().slice(0, 10);
