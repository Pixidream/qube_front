import { TOTP_LENGTH } from '@core/constants/auth.constants';

export default {
  networkError: 'Une erreur est survenue',
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
        invalidCreds: 'Email ou mot de passe invalide.',
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
  totp: {
    form: {
      title: 'Vérifiez votre identité',
      subtitleTotp: "Saisissez le code de votre application d'authentification",
      subtitleEmail: 'Saisissez le code reçus par email',
      totpLabel: 'TOTP',
      totpButton: 'Soumettre',
      validation: {
        totp: 'Un TOTP valid est requis',
        totpMinLength: `Le TOTP doit avoir ${TOTP_LENGTH} chiffres.`,
        totpMaxLength: `Le TOTP doit avoir ${TOTP_LENGTH} chiffres.`,
      },
    },
  },
  sendResetPassword: {
    form: {
      title: 'Réinitialiser votre mot de passe',
      subtitle:
        'Saisissez votre email pour recevoir un lien de réinitialisation',
      emailLabel: 'Email',
      submitButton: 'Envoyer',
      validation: {
        email: 'Un email valide est requis.',
        emailMinLength: "L'addresse est trop courte",
        emailMaxLength: "L'addresse est trop longue.",
      },
    },
    toast: {
      title: 'Email envoyé',
      description:
        'Vérifiez votre boîte de réception pour le lien de réinitialisation',
    },
  },
  resetPassword: {
    form: {
      title: 'Nouveau mot de passe',
      subtitle: 'Choisissez un mot de passe sécurisé pour votre compte',
      passwordLabel: 'Mot de passe',
      confirmPasswordLabel: 'Confirmez votre mot de passe',
      submitButton: 'Sauvegarder',
      validation: {
        password: 'Un mot de passe valide est requis.',
        passwordMinLength: 'Le mot de passe est trop court',
        passwordMaxLength: 'Le mot de passe est trop long.',
        passwordMatch: 'Les mots de passe sont différents',
        passwordStrength: 'Le mot de passe est trop faible',
      },
    },
    toast: {
      title: 'Mot de passe mis à jour',
      description: 'Vous pouvez maintenant vous connecter',
    },
  },
};
