import { TOTP_LENGTH } from '@core/constants/auth.constants';

export default {
  networkError: 'Une erreur est survenue',
  rateLimited:
    'Vous avez fait trop de requêtes, attendez une minute avant de recommencer',
  login: {
    emailNotVerified: 'Vérifiez votre email avant de continuer.',
    emailNotVerifiedLink: 'Renvoyer le liens de vérification',
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
      accountCreated: 'Compte créé ! Veuillez vérifier vos emails.',
      validation: {
        email: 'Un email valide est requis.',
        emailMinLength: "L'addresse est trop courte",
        emailMaxLength: "L'addresse est trop longue.",
        password: 'Un mot de passe valide est requis.',
        passwordMinLength: 'Le mot de passe est trop court',
        passwordMaxLength: 'Le mot de passe est trop long.',
        passwordMatch: 'Les mots de passe sont différents',
        passwordStrength: 'Le mot de passe est trop faible',
        conflictingCreds: 'Un compte avec cet email existe déjà',
      },
    },
  },
  totp: {
    form: {
      title: 'Vérifiez votre identité',
      subtitleTotp: "Saisissez le code de votre application d'authentification",
      subtitleEmail: 'Saisissez le code reçus par email',
      subtitleRecovery: 'Saisissez un de vos codes de récupération',
      totpLabel: 'TOTP',
      totpButton: 'Soumettre',
      recoveryButton: 'Utiliser le code de récupération',
      useRecoveryCode: 'Utiliser un code de récupération à la place',
      backToTotp: 'Retour au code authenticateur',
      validation: {
        totp: 'Un TOTP valid est requis',
        totpMinLength: `Le TOTP doit avoir ${TOTP_LENGTH} chiffres.`,
        totpMaxLength: `Le TOTP doit avoir ${TOTP_LENGTH} chiffres.`,
      },
    },
  },
  recoveryCode: {
    remainingCodes:
      'Code de récupération utilisé avec succès. {count} codes de récupération restants.',
    lastCodeRemaining:
      "Code de récupération utilisé avec succès. C'était votre dernier code de récupération ! Veuillez en générer de nouveaux.",
    fewCodesRemaining:
      'Code de récupération utilisé avec succès. Seulement {count} codes de récupération restants. Pensez à en générer de nouveaux.',
    noCodesRemaining:
      "Code de récupération utilisé avec succès. Vous n'avez plus de codes de récupération ! Veuillez en générer de nouveaux immédiatement.",
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
  profile: {
    joined: 'À rejoins le {date}',
    edit: 'Éditer mon profile',
  },
  verifyEmail: {
    toast: {
      mailSent: 'Un nouvel email de vérification a été envoyé.',
      mailError: 'Une erreur est survenu, réessayez dans 1 minute.',
    },
    verifyingTitle: 'Verification en cours',
    verifyingSubtitle: 'Nous vérifions que votre email est valid...',
    verifiedTitle: 'Email vérifié !',
    verifiedSubtitle: 'Email vérifié, vous pouvez maintenant vous connecter !',
    errorTitle: 'Impossible de vérifier votre email.',
    errorSubtitle: 'Une erreur est arrivé pendant la vérification.',
    sendNewMail: 'Envoyer un nouveau mail',
    newMailFailed: 'Une erreur est survenue. Essayez encore.',
  },
};
