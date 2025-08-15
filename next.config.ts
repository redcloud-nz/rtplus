
import type { NextConfig } from 'next'

interface PackageData {
  name: string;
  version: string;
  license: string;
  private: boolean;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  ['nz.rtplus']?: {
    displayName: string;
    repositoryUrl: string;
    version: string;
    versionName: string;
    
    [key: string]: any;
  };
}

import packageDataJson from './package.json' with { type: 'json' };
const packageData = packageDataJson as unknown as PackageData;

const appMetadata = packageData['nz.rtplus']

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: appMetadata?.version,
    NEXT_PUBLIC_APP_VERSION_NAME: appMetadata?.versionName,
    NEXT_PUBLIC_APP_DISPLAY_NAME: appMetadata?.displayName,
    NEXT_PUBLIC_APP_REPOSITORY_URL: appMetadata?.repositoryUrl,
  }
}

export default nextConfig
