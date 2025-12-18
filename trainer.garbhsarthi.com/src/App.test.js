import { render, screen } from '@testing-library/react';
import App from './App';

// Mock router to avoid CRA Jest resolver issues with ESM-only react-router-dom@7
jest.mock('react-router-dom', () => ({
  Link: ({ children, ...rest }) => <a {...rest}>{children}</a>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element || null,
  Navigate: ({ to }) => <div>redirect:{to}</div>
}));

// Mock trainer actions to avoid network calls during render
jest.mock('./apiHelper/TrainerCommonAction', () => ({
  actionToGetUserSessionData: jest.fn(),
  actionToLogoutUserSession: jest.fn()
}));

// Mock Zustand store shape used by App
jest.mock('./trainerStore/trainerStore', () => () => ({
  userSession: { loading: false },
  userAuthDetail: { userInfo: {} }
}));

test('renders app shell', () => {
  render(<App />);
  expect(screen.getByText(/Garbh Sarthi/i)).toBeInTheDocument();
});
