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
  },
};
