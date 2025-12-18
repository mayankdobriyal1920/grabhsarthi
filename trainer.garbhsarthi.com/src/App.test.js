import { render, screen } from '@testing-library/react';
import App from './App';

// Mock router to avoid CRA Jest resolver issues with ESM-only react-router-dom@7
jest.mock('react-router-dom', () => ({
  Link: ({ children, ...rest }) => <a {...rest}>{children}</a>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element || null,
  Navigate: ({ to }) => <div>redirect:{to}</div>,
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' })
}), { virtual: true });

// Mock trainer actions to avoid network calls during render
jest.mock('./apiHelper/TrainerCommonAction', () => ({
  actionToGetUserSessionData: jest.fn(),
  actionToLogoutUserSession: jest.fn()
}));

// Mock auth service used in TrainerLogin
jest.mock('./services/authService', () => ({
  getStoredAuth: () => ({ token: null })
}));

// Mock Zustand store shape used by App
jest.mock('./trainerStore/trainerStore', () => () => ({
  userSession: { loading: false },
  userAuthDetail: { userInfo: {} }
}));

test('renders app shell', () => {
  render(<App />);
  expect(screen.getByText(/Trainer Sign In/i)).toBeInTheDocument();
});
