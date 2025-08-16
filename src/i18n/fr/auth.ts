export default {
  login: {
    form: {
      title: 'Connectez-vous à votre compte',
      subtitle: 'Connectez-vous à votre espace',
      emailLabel: 'Email',
      passwordLabel: 'Mot de passe',
      noAccountLink: "Vous n'avez pas de compte ? Créez en un !",
      passwordForgotten: 'Mot de passe oublié ?',
      loginButton: 'Se Connecter',
      validation: {
        email: 'Un email valide est requis.',
        emailMinLength: "L'addresse est trop courte",
        emailMaxLength: "L'addresse est trop longue.",
        password: 'Un mot de passe valide est requis.',
        passwordMinLength: 'Le mot de passe est trop court',
        passwordMaxLength: 'Le mot de passe est trop long.',
      },
    },
  },
  signup: {
    form: {
      title: 'Créez votre compte',
      subtitle: 'Prenez le contrôle de votre inventaire en quelques minutes',
      emailLabel: 'Email',
      passwordLabel: 'Mot de passe',
      confirmPasswordLabel: 'Confirmez votre mot de passe',
      signupButton: 'Créer mon compte',
      haveAccountLink: 'Vous avez un compte ? Vous connecter !',
      validation: {
        email: 'Un email valide est requis.',
        emailMinLength: "L'addresse est trop courte",
        emailMaxLength: "L'addresse est trop longue.",
        password: 'Un mot de passe valide est requis.',
        passwordMinLength: 'Le mot de passe est trop court',
        passwordMaxLength: 'Le mot de passe est trop long.',
        passwordMatch: 'Les mots de passe sont différents',
        passwordStrength: 'Le mot de passe est trop faible',
      },
    },
  },
};
