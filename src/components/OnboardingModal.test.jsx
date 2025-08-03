import React from 'react';
import { render, screen } from '@testing-library/react';
import OnboardingModal from './OnboardingModal';

describe('OnboardingModal', () => {
  it('prefills form fields from initialData', () => {
    render(
      <OnboardingModal
        onComplete={() => {}}
        setTransactions={() => {}}
        initialData={{
          name: 'Alice',
          goals: 'Save more',
          questions: 'What is a 401k?',
          taxReturn: 'tax.pdf'
        }}
      />
    );

    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Save more')).toBeInTheDocument();
    expect(screen.getByDisplayValue('What is a 401k?')).toBeInTheDocument();
    expect(screen.getByText(/Selected: tax.pdf/)).toBeInTheDocument();
  });
});
