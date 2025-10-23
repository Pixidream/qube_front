export default {
  security: {
    title: 'Paramètres de Sécurité',
    subtitle:
      "Gérez les paramètres de sécurité et d'authentification de votre compte.",
    password: 'Mot de passe',
    lastChanged: 'Changé {timeSince}',
    neverChanged: 'Jamais mis à jour',
    changePasswordButton: 'Modifier le mot de passe',
    totp: 'Authentification à double facteur',
    totpSubtitle:
      'Ajoutez une couche de sécurité supplémentaire à votre compte',
    totpEnabled: 'Activé',
    totpDisabled: 'Désactivé',
    totpConfigureButton: 'Configurer',
    passwordVerifyForm: {
      title: 'Vérifiez votre mot de passe',
      subtitle: 'Confirmez votre mot de passe pour configurer votre 2FA',
      label: 'Mot de passe',
      button: 'Vérifier',
      validation: {
        passwordError: 'Le mot de passe est invalid',
      },
    },
    totpForm: {
      title: 'Configurez votre TOTP',
      subtitle: 'Scannez le QR code avec votre application préférée',
      label: 'Entrez le code généré par votre application',
      button: 'Vérifier',
      validation: {
        totp: 'Un totp valide est requis',
        totpLength: 'Le TOTP doit faire 8 chiffres.',
        totpInvalid: 'Le code entré est invalide.',
      },
    },
    totpRecovery: {
      title: 'Sauvegardez vos codes de récupération',
      subtitle:
        "Ces codes peuvent être utilisés pour accéder à votre compte si vous perdez votre appareil d'authentification",
      warning: {
        title: 'Important!',
        description:
          'Stockez ces codes dans un endroit sûr. Vous ne pourrez plus les voir à nouveau.',
      },
      copy: 'Copier les codes',
      copied: 'Copié!',
      download: 'Télécharger les codes',
      downloading: 'Téléchargement des codes de récupération...',
      downloadSuccess: 'Codes de récupération téléchargés avec succès',
      downloadError:
        'Échec du téléchargement, codes copiés dans le presse-papiers',
      complete: "J'ai sauvegardé mes codes",
    },
    totpRegenerate: {
      button: 'Régénérer les codes',
      title: 'Régénérer les codes de récupération',
      subtitle:
        'Générer de nouveaux codes de récupération et invalider les anciens',
      success: 'Codes de récupération régénérés avec succès',
      confirm: 'Régénérer les codes',
      processing: 'Régénération des codes de récupération...',
      passwordVerify: {
        title: 'Confirmation de sécurité requise',
        description:
          'Veuillez vérifier votre mot de passe pour régénérer les codes de récupération. Ceci est une opération de sécurité sensible.',
      },
      warning: {
        title: 'Attention!',
        description:
          "Ceci va invalider tous vos codes de récupération actuels. Assurez-vous d'avoir accès à votre application d'authentification.",
      },
      newCodes: {
        title: 'Vos nouveaux codes de récupération',
        subtitle: 'Vos anciens codes de récupération ne sont plus valides',
        warning:
          'Ces NOUVEAUX codes remplacent les précédents. Stockez-les en sécurité - vous ne les verrez plus.',
        complete: "J'ai sauvegardé mes nouveaux codes",
      },
      error: {
        title: 'Erreur',
        description: 'Échec de la régénération des codes de récupération',
      },
    },
    totpDisable: {
      button: 'Désactiver',
      title: "Désactiver l'authentification à double facteur",
      subtitle: "Désactiver l'authentification TOTP pour votre compte",
      success: 'Authentification à double facteur désactivée avec succès',
      confirm: 'Désactiver TOTP',
      processing: "Désactivation de l'authentification à double facteur...",
      passwordVerify: {
        title: 'Confirmation de sécurité requise',
        description:
          "Veuillez vérifier votre mot de passe pour désactiver l'authentification à double facteur. Ceci réduira la sécurité de votre compte.",
      },
      warning: {
        title: 'Avertissement de sécurité!',
        description:
          'Désactiver le 2FA rendra votre compte moins sécurisé. Êtes-vous sûr de vouloir continuer?',
      },
      consequences: {
        title: 'Ceci va:',
        item1: "Supprimer l'exigence TOTP pour la connexion",
        item2: 'Invalider tous les codes de récupération',
        item3: 'Réduire la sécurité de votre compte',
      },
      error: {
        title: 'Erreur',
        description:
          "Échec de la désactivation de l'authentification à double facteur",
      },
    },
    changePassword: {
      title: 'Changer le mot de passe',
      subtitle: 'Mettre à jour le mot de passe de votre compte',
      currentPasswordLabel: 'Mot de passe actuel',
      newPasswordLabel: 'Nouveau mot de passe',
      confirmPasswordLabel: 'Confirmer le nouveau mot de passe',
      success: 'Mot de passe changé avec succès',
      error: 'Échec du changement de mot de passe',
      logoutNotice:
        'Pour des raisons de sécurité, vous serez déconnecté pour utiliser votre nouveau mot de passe',
    },
  },
  profile: {
    title: 'Informations personnelles',
    subtitle: 'Mettez à jour vos informations personnelles et votre profil.',
  },
  common: {
    cancel: 'Annuler',
    retry: 'Réessayer',
  },
};
