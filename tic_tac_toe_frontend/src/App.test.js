import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders Tic Tac Toe main title', () => {
  render(<App />);
  expect(screen.getByText('Tic Tac Toe')).toBeInTheDocument();
});

test('renders mode select buttons', () => {
  render(<App />);
  expect(screen.getByTestId('pvp-btn')).toBeInTheDocument();
  expect(screen.getByTestId('pvc-btn')).toBeInTheDocument();
  expect(screen.getByTestId('restart-btn')).toBeInTheDocument();
});

test('board has 9 cells', () => {
  render(<App />);
  expect(screen.getAllByTestId('square-btn')).toHaveLength(9);
});

test('switches mode correctly and starts PvC', () => {
  render(<App />);
  fireEvent.click(screen.getByTestId('pvc-btn'));
  expect(screen.getByTestId('pvc-btn')).toBeDisabled();
  expect(screen.getByText(/Game Mode: Player vs Computer/i)).toBeInTheDocument();
});
