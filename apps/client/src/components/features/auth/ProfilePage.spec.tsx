import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from './ProfilePage';
import { useAuthStore } from '../../../stores/authStore';

// Mock the auth store
jest.mock('../../../stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

const mockUser = {
  id: 'uuid-123',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  authProvider: 'email' as const,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-15'),
};

const mockAuthStoreFunctions = {
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
};

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      getProfile: mockAuthStoreFunctions.getProfile,
      updateProfile: mockAuthStoreFunctions.updateProfile,
    } as any);
  });

  describe('Profile Display', () => {
    it('should render user profile information', () => {
      renderWithChakra(<ProfilePage />);

      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
      expect(screen.getByText('email')).toBeInTheDocument();
    });

    it('should display formatted dates', () => {
      renderWithChakra(<ProfilePage />);

      expect(screen.getByText('January 1, 2023')).toBeInTheDocument(); // Created date
      expect(screen.getByText('January 15, 2023')).toBeInTheDocument(); // Updated date
    });

    it('should show "Not provided" for missing phone number', () => {
      const userWithoutPhone = { ...mockUser, phone: undefined };
      mockUseAuthStore.mockReturnValue({
        user: userWithoutPhone,
        getProfile: mockAuthStoreFunctions.getProfile,
        updateProfile: mockAuthStoreFunctions.updateProfile,
      } as any);

      renderWithChakra(<ProfilePage />);

      expect(screen.getByText('Not provided')).toBeInTheDocument();
    });

    it('should display edit button when not in edit mode', () => {
      renderWithChakra(<ProfilePage />);

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('should show readonly email field with badge', () => {
      renderWithChakra(<ProfilePage />);

      expect(screen.getByText('Cannot be changed')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should enter edit mode when edit button is clicked', () => {
      renderWithChakra(<ProfilePage />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('should show form inputs in edit mode', () => {
      renderWithChakra(<ProfilePage />);
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      const nameInput = screen.getByDisplayValue('Test User');
      const phoneInput = screen.getByDisplayValue('+1234567890');
      
      expect(nameInput).toBeInTheDocument();
      expect(phoneInput).toBeInTheDocument();
      
      // Email should still be readonly
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should exit edit mode when cancel button is clicked', () => {
      renderWithChakra(<ProfilePage />);
      
      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    it('should reset form values when cancel is clicked', () => {
      renderWithChakra(<ProfilePage />);
      
      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      // Change input values
      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Re-enter edit mode and check values are reset
      const editButtonAgain = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButtonAgain);
      
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      renderWithChakra(<ProfilePage />);
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
    });

    it('should validate name length (minimum)', async () => {
      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'A' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters long')).toBeInTheDocument();
      });

      expect(mockAuthStoreFunctions.updateProfile).not.toHaveBeenCalled();
    });

    it('should validate name length (maximum)', async () => {
      const nameInput = screen.getByDisplayValue('Test User');
      const longName = 'A'.repeat(51);
      fireEvent.change(nameInput, { target: { value: longName } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Name must not exceed 50 characters')).toBeInTheDocument();
      });

      expect(mockAuthStoreFunctions.updateProfile).not.toHaveBeenCalled();
    });

    it('should validate phone number format', async () => {
      const phoneInput = screen.getByDisplayValue('+1234567890');
      fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Phone number must be a valid international format')).toBeInTheDocument();
      });

      expect(mockAuthStoreFunctions.updateProfile).not.toHaveBeenCalled();
    });

    it('should allow empty phone number', async () => {
      const phoneInput = screen.getByDisplayValue('+1234567890');
      fireEvent.change(phoneInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAuthStoreFunctions.updateProfile).toHaveBeenCalledWith({
          phone: undefined,
        });
      });
    });
  });

  describe('Profile Updates', () => {
    beforeEach(() => {
      renderWithChakra(<ProfilePage />);
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
    });

    it('should call updateProfile with changed values only', async () => {
      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAuthStoreFunctions.updateProfile).toHaveBeenCalledWith({
          name: 'Updated Name',
        });
      });
    });

    it('should call updateProfile with multiple changed values', async () => {
      const nameInput = screen.getByDisplayValue('Test User');
      const phoneInput = screen.getByDisplayValue('+1234567890');
      
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      fireEvent.change(phoneInput, { target: { value: '+9876543210' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAuthStoreFunctions.updateProfile).toHaveBeenCalledWith({
          name: 'Updated Name',
          phone: '+9876543210',
        });
      });
    });

    it('should not call updateProfile if no changes were made', async () => {
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      expect(mockAuthStoreFunctions.updateProfile).not.toHaveBeenCalled();
    });

    it('should show success message after successful update', async () => {
      mockAuthStoreFunctions.updateProfile.mockResolvedValue(undefined);

      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
      });
    });

    it('should show error message on update failure', async () => {
      const errorMessage = 'Update failed';
      mockAuthStoreFunctions.updateProfile.mockRejectedValue(new Error(errorMessage));

      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should show loading state during update', async () => {
      // Mock a slow update
      mockAuthStoreFunctions.updateProfile.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading message when user is null and fetching', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        getProfile: mockAuthStoreFunctions.getProfile,
        updateProfile: mockAuthStoreFunctions.updateProfile,
      } as any);

      renderWithChakra(<ProfilePage />);

      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });

    it('should call getProfile when user is null', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        getProfile: mockAuthStoreFunctions.getProfile,
        updateProfile: mockAuthStoreFunctions.updateProfile,
      } as any);

      renderWithChakra(<ProfilePage />);

      expect(mockAuthStoreFunctions.getProfile).toHaveBeenCalled();
    });

    it('should show error message when unable to load profile', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        getProfile: mockAuthStoreFunctions.getProfile,
        updateProfile: mockAuthStoreFunctions.updateProfile,
      } as any);

      // Mock the component to simulate fetch completion with no user
      jest.spyOn(React, 'useState')
        .mockImplementationOnce(() => [false, jest.fn()]) // isEditing
        .mockImplementationOnce(() => [false, jest.fn()]) // isLoading
        .mockImplementationOnce(() => [false, jest.fn()]) // isFetching - set to false to simulate fetch completion
        .mockImplementationOnce(() => ['', jest.fn()]) // name
        .mockImplementationOnce(() => ['', jest.fn()]) // phone
        .mockImplementationOnce(() => [{}, jest.fn()]) // errors
        .mockImplementationOnce(() => [null, jest.fn()]) // updateError
        .mockImplementationOnce(() => [null, jest.fn()]); // updateSuccess

      renderWithChakra(<ProfilePage />);

      expect(screen.getByText('Unable to load profile')).toBeInTheDocument();
    });
  });
});