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
};
