import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Alert,
  AlertIcon,
  Divider,
  Text,
  HStack,
  Box,
  Card,
  CardBody,
  Heading,
} from '@chakra-ui/react';
import { InvoiceSettings } from '@jctop-event/shared-types';
import { useReportStore } from '../../../stores/reportStore';
import invoiceService, { CreateInvoiceSettingsRequest } from '../../../services/invoiceService';

interface InvoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
}

export const InvoiceSettingsModal: React.FC<InvoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
}) => {
  const toast = useToast();
  const {
    invoiceSettings,
    invoiceSettingsLoading,
    invoiceSettingsError,
    setInvoiceSettings,
    setInvoiceSettingsLoading,
    setInvoiceSettingsError,
  } = useReportStore();

  const [formData, setFormData] = useState<CreateInvoiceSettingsRequest>({
    companyName: '',
    companyAddress: '',
    taxNumber: '',
    invoicePrefix: '',
    invoiceFooter: '',
    customFields: {},
  });

  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInvoiceSettings();
    }
  }, [isOpen, eventId]);

  useEffect(() => {
    if (invoiceSettings) {
      setFormData({
        companyName: invoiceSettings.companyName || '',
        companyAddress: invoiceSettings.companyAddress || '',
        taxNumber: invoiceSettings.taxNumber || '',
        invoicePrefix: invoiceSettings.invoicePrefix || '',
        invoiceFooter: invoiceSettings.invoiceFooter || '',
        customFields: invoiceSettings.customFields || {},
      });
    }
  }, [invoiceSettings]);

  const loadInvoiceSettings = async () => {
    setInvoiceSettingsLoading(true);
    setInvoiceSettingsError(null);

    try {
      const settings = await invoiceService.getInvoiceSettings(eventId);
      setInvoiceSettings(settings);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load invoice settings';
      setInvoiceSettingsError(errorMessage);
    } finally {
      setInvoiceSettingsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateInvoiceSettingsRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const isUpdate = !!invoiceSettings;
      const savedSettings = await invoiceService.saveInvoiceSettings(
        eventId,
        formData,
        isUpdate
      );
      
      setInvoiceSettings(savedSettings);
      
      toast({
        title: 'Settings Saved',
        description: 'Invoice settings have been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save invoice settings';
      toast({
        title: 'Save Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!invoiceSettings) return;
    
    setIsSaving(true);

    try {
      await invoiceService.deleteInvoiceSettings(eventId);
      setInvoiceSettings(null);
      setFormData({
        companyName: '',
        companyAddress: '',
        taxNumber: '',
        invoicePrefix: '',
        invoiceFooter: '',
        customFields: {},
      });

      toast({
        title: 'Settings Deleted',
        description: 'Invoice settings have been deleted',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete invoice settings';
      toast({
        title: 'Delete Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Invoice Settings - {eventTitle}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {invoiceSettingsError && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {invoiceSettingsError}
            </Alert>
          )}

          {previewMode ? (
            <InvoicePreview 
              formData={formData} 
              eventTitle={eventTitle}
              onBackToEdit={() => setPreviewMode(false)}
            />
          ) : (
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Company Name</FormLabel>
                <Input
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter your company name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Company Address</FormLabel>
                <Textarea
                  value={formData.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  placeholder="Enter your company address"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Tax Number / VAT ID</FormLabel>
                <Input
                  value={formData.taxNumber}
                  onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                  placeholder="Enter tax number or VAT ID"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Invoice Prefix</FormLabel>
                <Input
                  value={formData.invoicePrefix}
                  onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                  placeholder="e.g., INV-, EVENT-"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Invoice Footer</FormLabel>
                <Textarea
                  value={formData.invoiceFooter}
                  onChange={(e) => handleInputChange('invoiceFooter', e.target.value)}
                  placeholder="Additional terms, payment instructions, etc."
                  rows={3}
                />
              </FormControl>

              <Divider />

              <Box>
                <Button
                  variant="outline"
                  onClick={togglePreview}
                  w="full"
                  isDisabled={!formData.companyName}
                >
                  Preview Invoice Template
                </Button>
              </Box>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            {invoiceSettings && !previewMode && (
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleDelete}
                isLoading={isSaving}
              >
                Delete
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {!previewMode && (
              <Button
                colorScheme="primary"
                onClick={handleSave}
                isLoading={isSaving || invoiceSettingsLoading}
                isDisabled={!formData.companyName}
              >
                {invoiceSettings ? 'Update' : 'Create'} Settings
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface InvoicePreviewProps {
  formData: CreateInvoiceSettingsRequest;
  eventTitle: string;
  onBackToEdit: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  formData,
  eventTitle,
  onBackToEdit,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Heading size="md">Invoice Preview</Heading>
        <Button size="sm" onClick={onBackToEdit}>
          Back to Edit
        </Button>
      </HStack>

      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {/* Header */}
            <Box borderBottom="2px" borderColor="gray.200" pb={4}>
              <Text fontSize="2xl" fontWeight="bold">INVOICE</Text>
              <Text color="gray.600">
                {formData.invoicePrefix || 'INV-'}001
              </Text>
            </Box>

            {/* Company Info */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold">
                {formData.companyName || 'Your Company Name'}
              </Text>
              {formData.companyAddress && (
                <Text whiteSpace="pre-line" color="gray.600">
                  {formData.companyAddress}
                </Text>
              )}
              {formData.taxNumber && (
                <Text color="gray.600">Tax ID: {formData.taxNumber}</Text>
              )}
            </Box>

            {/* Event Info */}
            <Box>
              <Text fontWeight="semibold">Event:</Text>
              <Text>{eventTitle}</Text>
            </Box>

            {/* Sample Invoice Items */}
            <Box>
              <Text fontWeight="semibold" mb={2}>Invoice Details:</Text>
              <Box bg="gray.50" p={3} borderRadius="md">
                <HStack justify="space-between">
                  <Text>Event Registration - General Admission</Text>
                  <Text fontWeight="semibold">$50.00</Text>
                </HStack>
                <HStack justify="space-between" mt={2} pt={2} borderTop="1px" borderColor="gray.200">
                  <Text fontWeight="bold">Total:</Text>
                  <Text fontWeight="bold">$50.00</Text>
                </HStack>
              </Box>
            </Box>

            {/* Footer */}
            {formData.invoiceFooter && (
              <Box borderTop="1px" borderColor="gray.200" pt={4}>
                <Text fontSize="sm" color="gray.600" whiteSpace="pre-line">
                  {formData.invoiceFooter}
                </Text>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};