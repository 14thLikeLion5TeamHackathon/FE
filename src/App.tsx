import AppRoutes from './app/AppRoutes';
import { useUnauthorizedRedirect } from './hooks/auth/useUnauthorizedRedirect';

function App() {
  // 라우터 안쪽이라 navigate를 쓸 수 있는 가장 바깥 지점이다.
  useUnauthorizedRedirect();

  return <AppRoutes />;
}

export default App;
