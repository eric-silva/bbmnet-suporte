
import { PublicClientApplication, type Configuration, LogLevel } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID || 'common'}`,
    redirectUri: process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI || '/',
    postLogoutRedirectUri: process.env.NEXT_PUBLIC_AZURE_AD_POST_LOGOUT_REDIRECT_URI || '/',
    navigateToLoginRequestUrl: false, 
  },
  cache: {
    cacheLocation: 'sessionStorage', 
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            // console.info(message); // Pode ser muito verboso
            return;
          case LogLevel.Verbose:
            // console.debug(message); // Pode ser muito verboso
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
      // logLevel: LogLevel.Verbose, // Para depuração
    },
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};

export const msalInstance = new PublicClientApplication(msalConfig);
