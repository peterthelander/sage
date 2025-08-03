import React from 'react';
import { render, screen } from '@testing-library/react';
import UploadTab from './UploadTab';

describe('UploadTab', () => {
  it('renders success message when transactions exist', () => {
    const fileInputRef = { current: { click: () => {} } };
    render(
      <UploadTab
        transactions={[{ id: 1 }]}
        handleFileUpload={() => {}}
        fileInputRef={fileInputRef}
      />
    );
    expect(
      screen.getByText(/Successfully loaded 1 transactions/i)
    ).toBeInTheDocument();
  });
});
