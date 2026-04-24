
// REQUIRED
export const validateRequired = (value, fieldName = 'This field') => {
    if (!value || value.toString().trim() === '') {
        return `${fieldName} is required.`;
    }
    return null;
};

// EMAIL
export const validateEmail = (email) => {
    if (!email || email.trim() === '') return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(String(email).toLowerCase())) {
        return "Please enter a valid email address.";
    }
    return null;
};

// CONTACT NUMBER (PH)
export const validateContactNumber = (contact) => {
    if (!contact || contact.trim() === '') return null;
    const re = /^(09|\+639)\d{9}$/;
    if (!re.test(String(contact).replace(/\s+/g, ''))) {
        return "Please enter a valid contact number (e.g. 09123456789).";
    }
    return null;
};

// MIN LENGTH
export const validateMinLength = (value, min) => {
    if (!value) return null;
    if (value.length < min) {
        return `Minimum of ${min} characters required.`;
    }
    return null;
};

// MAX LENGTH
export const validateMaxLength = (value, max) => {
    if (!value) return null;
    if (value.length > max) {
        return `Maximum of ${max} characters allowed.`;
    }
    return null;
};

// NUMBER ONLY
export const validateNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (!/^\d+(\.\d+)?$/.test(value)) {
        return "Only numbers are allowed.";
    }
    return null;
};

// POSITIVE NUMBER
export const validatePositiveNumber = (value) => {
    if (!value) return null;
    if (Number(value) <= 0) {
        return "Value must be greater than 0.";
    }
    return null;
};

// INTEGER ONLY
export const validateInteger = (value) => {
    if (!value && value !== 0) return null;
    if (!Number.isInteger(Number(value))) {
        return "Only whole numbers are allowed.";
    }
    return null;
};

// PRICE (2 decimal limit)
export const validatePrice = (value) => {
    if (!value) return null;
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        return "Invalid price format (max 2 decimal places).";
    }
    return null;
};

// ALPHABET ONLY (names, departments)
export const validateAlphabet = (value) => {
    if (!value) return null;
    const re = /^[A-Za-z\s]+$/;
    if (!re.test(value)) {
        return "Only letters are allowed.";
    }
    return null;
};

// ALPHANUMERIC (codes, IDs)
export const validateAlphaNumeric = (value) => {
    if (!value) return null;
    const re = /^[A-Za-z0-9\s_-]+$/;
    if (!re.test(value)) {
        return "Only letters, numbers, dash and underscore allowed.";
    }
    return null;
};

// DATE (NOT FUTURE)
export const validatePastDate = (date) => {
    if (!date) return null;
    if (new Date(date) > new Date()) {
        return "Date cannot be in the future.";
    }
    return null;
};

// DATE RANGE (start ≤ end)
export const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    if (new Date(startDate) > new Date(endDate)) {
        return "Start date cannot be later than end date.";
    }
    return null;
};

// FUTURE DATE ONLY
export const validateFutureDate = (date) => {
    if (!date) return null;
    if (new Date(date) < new Date()) {
        return "Date must be in the future.";
    }
    return null;
};

// PASSWORD STRENGTH
export const validatePassword = (password) => {
    if (!password) return null;

    const minLength = /.{8,}/;
    const hasNumber = /\d/;
    const hasLetter = /[A-Za-z]/;
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/;

    if (!minLength.test(password)) {
        return "Password must be at least 8 characters.";
    }
    if (!hasNumber.test(password)) {
        return "Password must contain at least one number.";
    }
    if (!hasLetter.test(password)) {
        return "Password must contain letters.";
    }
    if (!hasSpecial.test(password)) {
        return "Password must contain a special character.";
    }

    return null;
};

// URL VALIDATION
export const validateURL = (url) => {
    if (!url) return null;
    try {
        new URL(url);
        return null;
    } catch {
        return "Invalid URL format.";
    }
};

// SELECT DROPDOWN
export const validateSelect = (value, fieldName = 'Selection') => {
    if (!value || value === '' || value === '0') {
        return `Please select a ${fieldName}.`;
    }
    return null;
};

// FILE SIZE (MB)
export const validateFileSize = (file, maxMB = 2) => {
    if (!file) return null;
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > maxMB) {
        return `File must be less than ${maxMB}MB.`;
    }
    return null;
};