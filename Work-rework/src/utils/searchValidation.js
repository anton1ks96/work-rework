/**
 * Student ID format: i + year(2 digits) + s + number(4 digits)
 * Examples: i24s0291, i23s0157
 */
const STUDENT_ID_REGEX = /^i\d{2}s\d{4}$/;
const STUDENT_ID_LENGTH = 8;

/**
 * Validates search query and determines if search should be performed
 * @param {string} query - Search query from user input
 * @returns {Object} Validation result
 *   - {boolean} shouldSearch - Whether to perform the search
 *   - {string} type - 'id' or 'name'
 *   - {string} reason - Reason why search should not be performed (if applicable)
 */
export const validateSearchQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return {
      shouldSearch: false,
      type: null,
      reason: 'Пустой запрос',
    };
  }

  const trimmedQuery = query.trim();

  if (trimmedQuery.toLowerCase().startsWith('i')) {
    const queryLength = trimmedQuery.length;

    if (queryLength < STUDENT_ID_LENGTH) {
      return {
        shouldSearch: false,
        type: 'id',
        reason: 'ID должен быть полным',
      };
    }

    if (queryLength === STUDENT_ID_LENGTH) {
      const lowerQuery = trimmedQuery.toLowerCase();
      const isValidFormat = STUDENT_ID_REGEX.test(lowerQuery);

      if (isValidFormat) {
        return {
          shouldSearch: true,
          type: 'id',
          reason: null,
        };
      } else {
        return {
          shouldSearch: false,
          type: 'id',
          reason: 'ID должен быть полным',
        };
      }
    }
  }

  if (trimmedQuery.length >= 4) {
    return {
      shouldSearch: true,
      type: 'name',
      reason: null,
    };
  }

  return {
    shouldSearch: false,
    type: 'name',
    reason: 'Запрос слишком маленький, минимум 4 символа',
  };
};
