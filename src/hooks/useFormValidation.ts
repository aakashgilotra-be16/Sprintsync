/**
 * useFormValidation - Custom hook for secure form handling
 * Combines input sanitization with validation
 */

import { useCallback } from 'react';
import {
  sanitizeString,
  sanitizeObject,
  validateName,
  validateDate,
  validateDepartment,
  validateSprintName,
  validateFileUpload,
  RateLimiter,
} from '@/utils/sanitizer';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const useFormValidation = () => {
  // Create a rate limiter for form submissions (1 per second)
  const submitLimiter = new RateLimiter(1000);

  /**
   * Validate and sanitize a form submission
   * Prevents rapid-fire submissions and malicious input
   */
  const validateFormSubmission = useCallback(
    (formData: Record<string, unknown>): ValidationResult => {
      if (!submitLimiter.canExecute()) {
        return {
          isValid: false,
          error: 'Please wait before submitting again.',
        };
      }

      if (!formData || typeof formData !== 'object') {
        return { isValid: false, error: 'Invalid form data.' };
      }

      return { isValid: true };
    },
    [submitLimiter]
  );

  /**
   * Validate person form (name, department)
   */
  const validatePersonForm = useCallback(
    (name: string, dept: unknown): ValidationResult => {
      if (!validateName(name)) {
        return {
          isValid: false,
          error: 'Name must be 2-100 characters (letters, spaces, hyphens only)',
        };
      }

      if (!validateDepartment(dept)) {
        return {
          isValid: false,
          error: 'Department must be Dev, QA, or PM',
        };
      }

      return { isValid: true };
    },
    []
  );

  /**
   * Validate sprint form (name, dates)
   */
  const validateSprintForm = useCallback(
    (name: string, startDate: string, endDate: string): ValidationResult => {
      if (!validateSprintName(name)) {
        return {
          isValid: false,
          error: 'Sprint name must be 3-100 characters (alphanumeric & hyphens)',
        };
      }

      if (!validateDate(startDate)) {
        return { isValid: false, error: 'Invalid start date format' };
      }

      if (!validateDate(endDate)) {
        return { isValid: false, error: 'Invalid end date format' };
      }

      if (new Date(startDate) > new Date(endDate)) {
        return {
          isValid: false,
          error: 'Start date must be before end date',
        };
      }

      return { isValid: true };
    },
    []
  );

  /**
   * Validate leave form (member, dates)
   */
  const validateLeaveForm = useCallback(
    (name: string, startDate: string, endDate: string): ValidationResult => {
      if (!validateName(name)) {
        return {
          isValid: false,
          error: 'Invalid member name',
        };
      }

      if (!validateDate(startDate)) {
        return { isValid: false, error: 'Invalid start date' };
      }

      if (!validateDate(endDate)) {
        return { isValid: false, error: 'Invalid end date' };
      }

      if (new Date(startDate) > new Date(endDate)) {
        return {
          isValid: false,
          error: 'Start date must be before end date',
        };
      }

      return { isValid: true };
    },
    []
  );

  /**
   * Validate holiday form (name, date)
   */
  const validateHolidayForm = useCallback(
    (name: string, date: string): ValidationResult => {
      const sanitized = sanitizeString(name);

      if (sanitized.length < 2 || sanitized.length > 100) {
        return {
          isValid: false,
          error: 'Holiday name must be 2-100 characters',
        };
      }

      if (!validateDate(date)) {
        return { isValid: false, error: 'Invalid date format' };
      }

      return { isValid: true };
    },
    []
  );

  /**
   * Validate file upload (size, type, extension)
   */
  const validateFile = useCallback(
    (file: File, maxSizeMB?: number): ValidationResult => {
      if (!(file instanceof File)) {
        return { isValid: false, error: 'Invalid file' };
      }

      if (!validateFileUpload(file, maxSizeMB)) {
        return {
          isValid: false,
          error: `File must be Excel format, max ${maxSizeMB || 5}MB`,
        };
      }

      return { isValid: true };
    },
    []
  );

  /**
   * Sanitize and validate a single text input
   */
  const sanitizeInput = useCallback((input: string): string => {
    return sanitizeString(input);
  }, []);

  /**
   * Sanitize entire form object
   */
  const sanitizeForm = useCallback(
    (formData: Record<string, unknown>): Record<string, unknown> => {
      return sanitizeObject(formData);
    },
    []
  );

  return {
    validateFormSubmission,
    validatePersonForm,
    validateSprintForm,
    validateLeaveForm,
    validateHolidayForm,
    validateFile,
    sanitizeInput,
    sanitizeForm,
  };
};

/**
 * Display error message safely
 * Prevents HTML injection in error messages
 * Note: This is a simple utility function, use in your components as:
 * 
 * <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
 *   {getSafeErrorMessage(message)}
 * </div>
 */
export const getSafeErrorMessage = (message: string): string => {
  return sanitizeString(message);
};
