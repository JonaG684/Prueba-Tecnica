export interface ValidationErrors {
    username?: string;
    email?: string;
    password?: string;
  }
  

  export const validateFields = (username: string, email: string, password: string): ValidationErrors => {
    const errors: ValidationErrors = {};
  
    if (username.length < 6) {
      errors.username = 'Username must be at least 6 characters long.';
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
  
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }
  
    return errors;
  };
  

  export const validateSingleField = (
    field: 'username' | 'email' | 'password',
    value: string
  ): string => {
    switch (field) {
      case 'username':
        if (value.length < 6) {
          return 'Username must be at least 6 characters long.';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address.';
        }
        break;
      case 'password':
        if (value.length < 8) {
          return 'Password must be at least 8 characters long.';
        }
        break;
      default:
        return '';
    }
    return '';
  };
  