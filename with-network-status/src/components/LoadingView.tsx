import { Loader } from '@toss-design-system/react-native';

interface LoadingViewProps {
  children: React.ReactNode;
  loading: boolean;
}

export function LoadingView({ children, loading }: LoadingViewProps) {
  return loading ? <Loader size="small" /> : children;
}
