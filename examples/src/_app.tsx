import type { PropsWithChildren } from 'react';
import type { InitialProps } from 'react-native-bedrock';
import { AppsInToss } from '@apps-in-toss/framework';
import { context } from '../require.context';
import { TDSProvider } from '@toss-design-system/react-native';

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return <TDSProvider>{children}</TDSProvider>;
}

export default AppsInToss.registerApp(AppContainer, { context });
