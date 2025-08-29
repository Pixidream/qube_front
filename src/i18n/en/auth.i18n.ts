import { TOTP_LENGTH } from '@/core/constants/auth.constants';

export default {
  networkError: 'Something wrong happend',
  login: {
    form: {
      title: 'Login to your account',
      subtitle: 'Connect to your workspace',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      noAccountLink: "Don't have an account ? Create one !",
      passwordForgotten: 'Forgot your password ?',
      loginButton: 'Log in',
      validation: {
        email: 'A valid email is required.',
        emailMinLength: 'Email is too short.',
        emailMaxLength: 'Email is too long.',
        password: 'A valid passowrd is required.',
        passwordMinLength: 'Password is too short.',
        passwordMaxLength: 'Password is too long.',
        invalidCreds: 'Invalid email or password.',
      },
    },
  },
  signup: {
    form: {
      title: 'Create your account',
      subtitle: 'Take control of your inventory in minutes',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm your password',
      signupButton: 'Sign up',
      haveAccountLink: 'Already have an account ? Log in !',
      validation: {
        email: 'A valid email is required.',
        emailMinLength: 'Email is too short.',
        emailMaxLength: 'Email is too long.',
        password: 'A valid passowrd is required.',
        passwordMinLength: 'Password is too short.',
        passwordMaxLength: 'Password is too long.',
        passwordMatch: 'Passwords are not the same',
        passwordStrength: 'Password is too weak',
      },
    },
  },
  totp: {
    form: {
      title: 'Verify your identity',
      subtitleTotp: 'Enter the code from your authenticator app',
      subtitleEmail: 'Enter the code received by email',
      totpLabel: 'TOTP',
      totpButton: 'Submit',
      validation: {
        totp: 'A valid TOTP is required.',
        totpMinLength: `TOTP token has to have ${TOTP_LENGTH} figures.`,
        totpMaxLength: `TOTP token has to have ${TOTP_LENGTH} figures.`,
      },
    },
  },
  sendResetPassword: {
    form: {
      title: 'Reset your password',
      subtitle: 'Enter your email to receive a reset link',
      emailLabel: 'Email',
      submitButton: 'Send',
      validation: {
        email: 'A valid email is required.',
        emailMinLength: 'Email is too short.',
        emailMaxLength: 'Email is too long.',
      },
    },
    toast: {
      title: 'Email sent',
      description: 'Check your inbox for the reset link',
    },
  },
  resetPassword: {
    form: {
      title: 'New password',
      subtitle: 'Choose a secure password for your account',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm your password',
      submitButton: 'Save',
      validation: {
        password: 'A valid passowrd is required.',
        passwordMinLength: 'Password is too short.',
        passwordMaxLength: 'Password is too long.',
        passwordMatch: 'Passwords are not the same',
        passwordStrength: 'Password is too weak',
      },
    },
    toast: {
      title: 'Password updated',
      description: 'You can now log in with your new password',
    },
  },
};
