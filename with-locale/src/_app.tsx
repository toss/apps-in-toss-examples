import { AppsInToss } from '@apps-in-toss/framework';
import { PropsWithChildren } from 'react';
import { InitialProps } from 'react-native-bedrock';
import { context } from '../require.context';
import './i18n';

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return <>{children}</>;
}

export default AppsInToss.registerApp(AppContainer, { context });
