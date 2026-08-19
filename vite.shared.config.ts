/** Build settings shared by the 3 Module Federation apps (host + remotes). */
export const federationBuildConfig = {
  target: 'esnext',
  modulePreload: false,
} as const;
