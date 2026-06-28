import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders paste and view sections', () => {
    render(<App />);

    expect(screen.getByText(/Share Your Code/i)).toBeInTheDocument();
    expect(screen.getByText(/View Shared Code/i)).toBeInTheDocument();
  });

  test('submits paste form successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ snippetId: 'abc123' }),
    });

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), {
      target: { value: 'Tester' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Paste your code here/i), {
      target: { value: 'console.log("hello world");' },
    });
    fireEvent.click(screen.getByText(/Share Code/i));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/paste'),
      expect.objectContaining({ method: 'POST' })
    );
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter your name/i)).toHaveValue('');
      expect(screen.getByPlaceholderText(/Paste your code here/i)).toHaveValue('');
    });
  });
});
