import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPanel from './AdminPanel';

describe('AdminPanel', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders admin login form', () => {
    render(<AdminPanel />);

    expect(screen.getByText(/Admin Access/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter admin key/i)).toBeInTheDocument();
  });

  test('shows login error on invalid admin key', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    });

    render(<AdminPanel />);

    fireEvent.change(screen.getByPlaceholderText(/Enter admin key/i), {
      target: { value: 'badkey' },
    });
    fireEvent.click(screen.getByText(/Login/i));

    await waitFor(() => {
      expect(screen.getByText(/Invalid admin key/i)).toBeInTheDocument();
    });
  });
});
