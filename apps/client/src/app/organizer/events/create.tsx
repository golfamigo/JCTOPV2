import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { Text, Button, Card, ListItem, Icon, Input, Avatar, Overlay, Chip, CheckBox } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useAppTheme } from '@/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const DRAFT_STORAGE_KEY = 'event_creation_draft';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Event category interface
export interface EventCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// Predefined event categories
export const EVENT_CATEGORIES: EventCategory[] = [
  {
    id: 'sports',
    name: '運動',
    description: '體育活動、競賽、健身',
    icon: 'sports-basketball',
    color: '#FF6B6B',
  },
  {
    id: 'music',
    name: '音樂',
    description: '演唱會、音樂節、表演',
    icon: 'music-note',
    color: '#4ECDC4',
  },
  {
    id: 'business',
    name: '商業',
    description: '會議、研討會、工作坊',
    icon: 'business',
    color: '#45B7D1',
  },
  {
    id: 'education',
    name: '教育',
    description: '課程、培訓、講座',
    icon: 'school',
    color: '#96CEB4',
  },
  {
    id: 'social',
    name: '社交',
    description: '聚會、派對、社區活動',
    icon: 'people',
    color: '#FFEAA7',
  },
  {
    id: 'technology',
    name: '科技',
    description: '技術分享、黑客松、創新',
    icon: 'computer',
    color: '#DDA0DD',
  },
  {
    id: 'arts',
    name: '藝術',
    description: '展覽、藝術節、文化活動',
    icon: 'palette',
    color: '#FFA07A',
  },
  {
    id: 'food',
    name: '美食',
    description: '品酒會、美食節、烹飪課',
    icon: 'restaurant',
    color: '#98D8C8',
  },
];

// Types for the event creation form
export interface EventFormData {
  // Basic Information
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  image?: string;
  
  // Category and Location
  categories: string[];
  venueName: string;
  venueAddress: string;
  venueCapacity?: number;
  locationNotes?: string;
}

export interface FormErrors {
  title?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  categories?: string;
  venueName?: string;
  venueAddress?: string;
}

// Step information
interface Step {
  id: number;
  title: string;
  completed: boolean;
  active: boolean;
}

export default function CreateEventScreen() {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);

  // Responsive design state
  const [screenData, setScreenData] = useState(Dimensions.get('screen'));
  const isTablet = screenData.width >= 768;
  const isDesktop = screenData.width >= 1200;

  // Form state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day later
    endDateTime: new Date(Date.now() + 26 * 60 * 60 * 1000), // 26 hours later
    categories: [],
    venueName: '',
    venueAddress: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Date/Time picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);
  
  // Image upload state
  const [showImageOptions, setShowImageOptions] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [imageUploadProgress, setImageUploadProgress] = useState<number>(0);
  
  // Category selection state
  const [showCategoryPicker, setShowCategoryPicker] = useState<boolean>(false);
  
  // Form progress and persistence state
  const [formProgress, setFormProgress] = useState<number>(0);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Define form steps
  const steps: Step[] = [
    {
      id: 1,
      title: t('eventCreation.basicInformation'),
      completed: false,
      active: currentStep === 1,
    },
    {
      id: 2,
      title: t('eventCreation.dateTime'),
      completed: false,
      active: currentStep === 2,
    },
    {
      id: 3,
      title: t('eventCreation.categoryLocation'),
      completed: false,
      active: currentStep === 3,
    },
    {
      id: 4,
      title: t('eventCreation.preview'),
      completed: false,
      active: currentStep === 4,
    },
  ];

  // Navigation handlers
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // Show confirmation dialog for exit
      if (hasUnsavedChanges) {
        Alert.alert(
          t('common.confirm'),
          t('eventCreation.exitConfirmation'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { 
              text: t('eventCreation.saveAndExit'), 
              onPress: async () => {
                await saveDraftToStorage(true);
                router.back();
              }
            },
            { 
              text: t('eventCreation.exitWithoutSaving'), 
              onPress: () => router.back(),
              style: 'destructive'
            },
          ]
        );
      } else {
        router.back();
      }
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  // Validation logic
  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {};

    switch (currentStep) {
      case 1: // Basic Information
        if (!formData.title.trim()) {
          newErrors.title = t('validation.required');
        } else if (formData.title.length < 10) {
          newErrors.title = t('validation.minLength', { count: 10 });
        } else if (formData.title.length > 100) {
          newErrors.title = t('validation.maxLength', { count: 100 });
        }

        if (!formData.description.trim()) {
          newErrors.description = t('validation.required');
        } else if (formData.description.length < 50) {
          newErrors.description = t('validation.minLength', { count: 50 });
        } else if (formData.description.length > 2000) {
          newErrors.description = t('validation.maxLength', { count: 2000 });
        }
        break;

      case 2: // Date and Time
        if (formData.startDateTime <= new Date()) {
          newErrors.startDateTime = t('eventCreation.validation.startDateFuture');
        }
        if (formData.endDateTime <= formData.startDateTime) {
          newErrors.endDateTime = t('eventCreation.validation.endDateAfterStart');
        }
        break;

      case 3: // Category and Location
        if (formData.categories.length === 0) {
          newErrors.categories = t('validation.required');
        }
        if (!formData.venueName.trim()) {
          newErrors.venueName = t('validation.required');
        }
        if (!formData.venueAddress.trim()) {
          newErrors.venueAddress = t('validation.required');
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Date/Time helper functions
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Date/Time picker handlers
  const handleDateTimeChange = (
    event: any,
    selectedDate: Date | undefined,
    type: 'startDate' | 'startTime' | 'endDate' | 'endTime'
  ) => {
    // Hide picker first
    switch (type) {
      case 'startDate':
        setShowStartDatePicker(false);
        break;
      case 'startTime':
        setShowStartTimePicker(false);
        break;
      case 'endDate':
        setShowEndDatePicker(false);
        break;
      case 'endTime':
        setShowEndTimePicker(false);
        break;
    }

    if (selectedDate) {
      const updatedFormData = { ...formData };
      
      switch (type) {
        case 'startDate':
          // Update start date while preserving time
          const startDateTime = new Date(selectedDate);
          startDateTime.setHours(formData.startDateTime.getHours());
          startDateTime.setMinutes(formData.startDateTime.getMinutes());
          updatedFormData.startDateTime = startDateTime;
          break;
          
        case 'startTime':
          // Update start time while preserving date
          const newStartTime = new Date(formData.startDateTime);
          newStartTime.setHours(selectedDate.getHours());
          newStartTime.setMinutes(selectedDate.getMinutes());
          updatedFormData.startDateTime = newStartTime;
          break;
          
        case 'endDate':
          // Update end date while preserving time
          const endDateTime = new Date(selectedDate);
          endDateTime.setHours(formData.endDateTime.getHours());
          endDateTime.setMinutes(formData.endDateTime.getMinutes());
          updatedFormData.endDateTime = endDateTime;
          break;
          
        case 'endTime':
          // Update end time while preserving date
          const newEndTime = new Date(formData.endDateTime);
          newEndTime.setHours(selectedDate.getHours());
          newEndTime.setMinutes(selectedDate.getMinutes());
          updatedFormData.endDateTime = newEndTime;
          break;
      }
      
      setFormData(updatedFormData);
      
      // Clear related errors
      if (type.includes('start') && errors.startDateTime) {
        setErrors(prev => ({ ...prev, startDateTime: undefined }));
      }
      if (type.includes('end') && errors.endDateTime) {
        setErrors(prev => ({ ...prev, endDateTime: undefined }));
      }
    }
  };

  // Image handling functions
  const handleImageSelection = async (source: 'camera' | 'gallery') => {
    setShowImageOptions(false);
    
    try {
      // Request permissions
      let permissionResult;
      if (source === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!permissionResult.granted) {
        Alert.alert(
          t('eventCreation.permissionRequired'),
          t('eventCreation.permissionMessage')
        );
        return;
      }

      // Launch image picker
      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageAsset = result.assets[0];
        
        // Validate image
        if (!validateImage(imageAsset)) {
          return;
        }

        // Simulate upload progress
        setUploadingImage(true);
        setImageUploadProgress(0);
        
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setImageUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // Simulate upload completion
        setTimeout(() => {
          clearInterval(progressInterval);
          setImageUploadProgress(100);
          setFormData(prev => ({ ...prev, image: imageAsset.uri }));
          setUploadingImage(false);
          setImageUploadProgress(0);
        }, 2000);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('eventCreation.imageUploadFailed'));
      setUploadingImage(false);
      setImageUploadProgress(0);
    }
  };

  const validateImage = (imageAsset: any): boolean => {
    // Check file size (max 5MB)
    if (imageAsset.fileSize && imageAsset.fileSize > 5 * 1024 * 1024) {
      Alert.alert(
        t('eventCreation.imageTooLarge'),
        t('eventCreation.imageSizeLimit')
      );
      return false;
    }

    // Check dimensions (min 800x450 for 16:9 aspect ratio)
    if (imageAsset.width < 800 || imageAsset.height < 450) {
      Alert.alert(
        t('eventCreation.imageTooSmall'),
        t('eventCreation.imageMinDimensions')
      );
      return false;
    }

    return true;
  };

  const handleRemoveImage = () => {
    Alert.alert(
      t('common.confirm'),
      t('eventCreation.removeImageConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: () => setFormData(prev => ({ ...prev, image: undefined })),
          style: 'destructive',
        },
      ]
    );
  };

  // Category handling functions
  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      const currentCategories = prev.categories;
      const isSelected = currentCategories.includes(categoryId);
      
      let newCategories: string[];
      if (isSelected) {
        // Remove category
        newCategories = currentCategories.filter(id => id !== categoryId);
      } else {
        // Add category (max 3 categories)
        if (currentCategories.length >= 3) {
          Alert.alert(
            t('eventCreation.categoryLimitTitle'),
            t('eventCreation.categoryLimitMessage')
          );
          return prev;
        }
        newCategories = [...currentCategories, categoryId];
      }
      
      // Clear category errors
      if (errors.categories && newCategories.length > 0) {
        setErrors(prevErrors => ({ ...prevErrors, categories: undefined }));
      }
      
      return { ...prev, categories: newCategories };
    });
  };

  const handleRemoveCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(id => id !== categoryId)
    }));
  };

  const getSelectedCategoryNames = (): string[] => {
    return formData.categories.map(id => {
      const category = EVENT_CATEGORIES.find(cat => cat.id === id);
      return category ? category.name : id;
    });
  };

  // Form persistence functions
  const saveDraftToStorage = async (silent: boolean = false) => {
    try {
      const draftData = {
        formData,
        currentStep,
        timestamp: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      setLastSaveTime(new Date());
      setHasUnsavedChanges(false);
      
      if (!silent) {
        Alert.alert(t('common.success'), t('eventCreation.draftSaved'));
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      if (!silent) {
        Alert.alert(t('common.error'), t('eventCreation.draftSaveFailed'));
      }
    }
  };

  const loadDraftFromStorage = async () => {
    try {
      const savedDraft = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        
        // Show confirmation dialog
        Alert.alert(
          t('eventCreation.draftFound'),
          t('eventCreation.draftFoundMessage'),
          [
            {
              text: t('eventCreation.startFresh'),
              onPress: () => clearDraft(),
              style: 'destructive',
            },
            {
              text: t('eventCreation.loadDraft'),
              onPress: () => {
                setFormData({
                  ...draftData.formData,
                  startDateTime: new Date(draftData.formData.startDateTime),
                  endDateTime: new Date(draftData.formData.endDateTime),
                });
                setCurrentStep(draftData.currentStep);
                setLastSaveTime(new Date(draftData.timestamp));
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
      setLastSaveTime(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  const calculateFormProgress = () => {
    let progress = 0;
    const totalFields = 7; // title, description, startDateTime, endDateTime, categories, venueName, venueAddress
    
    if (formData.title.length >= 10) progress++;
    if (formData.description.length >= 50) progress++;
    if (formData.startDateTime > new Date()) progress++;
    if (formData.endDateTime > formData.startDateTime) progress++;
    if (formData.categories.length > 0) progress++;
    if (formData.venueName.trim()) progress++;
    if (formData.venueAddress.trim()) progress++;
    
    return Math.round((progress / totalFields) * 100);
  };

  // Draft save functionality
  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      await saveDraftToStorage();
    } catch (error) {
      Alert.alert(t('common.error'), t('messages.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  // Step indicator component
  const StepIndicator = () => (
    <Card containerStyle={[
      styles.stepIndicatorCard, 
      { backgroundColor: colors.white },
      isTablet && styles.stepIndicatorCardTablet
    ]}>
      <View style={styles.stepIndicatorContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: step.active
                      ? colors.primary
                      : step.completed
                      ? colors.success
                      : colors.lightGrey,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    {
                      color: step.active || step.completed ? colors.white : colors.midGrey,
                    },
                  ]}
                >
                  {step.completed ? '✓' : step.id}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepTitle,
                  {
                    color: step.active ? colors.primary : colors.midGrey,
                    fontSize: 12,
                  },
                ]}
                numberOfLines={2}
              >
                {step.title}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepConnector,
                  {
                    backgroundColor: step.completed ? colors.success : colors.lightGrey,
                  },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </Card>
  );

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInformationStep />;
      case 2:
        return <DateTimeStep />;
      case 3:
        return <CategoryLocationStep />;
      case 4:
        return <PreviewStep />;
      default:
        return <BasicInformationStep />;
    }
  };

  // Basic Information Step Component
  const BasicInformationStep = () => (
    <Card containerStyle={{ backgroundColor: colors.white }}>
      <Text h3 style={[typography.h2, { marginBottom: spacing.md, color: colors.dark }]}>
        {t('eventCreation.basicInformation')}
      </Text>
      <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
        {t('eventCreation.basicInformationDescription')}
      </Text>
      
      {/* Event Title Input */}
      <Input
        testID="event-title-input"
        label={t('eventCreation.eventTitle')}
        placeholder={t('eventCreation.eventTitlePlaceholder')}
        value={formData.title}
        onChangeText={(text) => {
          setFormData(prev => ({ ...prev, title: text }));
          // Clear error when user starts typing
          if (errors.title) {
            setErrors(prev => ({ ...prev, title: undefined }));
          }
        }}
        errorMessage={errors.title}
        maxLength={100}
        containerStyle={{ marginBottom: spacing.md }}
        rightIcon={{
          name: 'event',
          type: 'material',
          color: colors.midGrey,
        }}
      />
      
      {/* Character counter for title */}
      <Text style={[typography.small, { 
        color: formData.title.length > 90 ? colors.warning : colors.textSecondary, 
        textAlign: 'right',
        marginTop: -spacing.md,
        marginBottom: spacing.md 
      }]}>
        {formData.title.length}/100 {t('eventCreation.characters')}
      </Text>
      
      {/* Event Description Input */}
      <Input
        testID="event-description-input"
        label={t('eventCreation.eventDescription')}
        placeholder={t('eventCreation.eventDescriptionPlaceholder')}
        value={formData.description}
        onChangeText={(text) => {
          setFormData(prev => ({ ...prev, description: text }));
          // Clear error when user starts typing
          if (errors.description) {
            setErrors(prev => ({ ...prev, description: undefined }));
          }
        }}
        errorMessage={errors.description}
        maxLength={2000}
        multiline
        numberOfLines={4}
        containerStyle={{ marginBottom: spacing.md }}
        inputStyle={{ minHeight: 80, textAlignVertical: 'top' }}
        rightIcon={{
          name: 'description',
          type: 'material',
          color: colors.midGrey,
        }}
      />
      
      {/* Character counter for description */}
      <Text style={[typography.small, { 
        color: formData.description.length > 1800 ? colors.warning : colors.textSecondary, 
        textAlign: 'right',
        marginTop: -spacing.md,
        marginBottom: spacing.lg 
      }]}>
        {formData.description.length}/2000 {t('eventCreation.characters')}
      </Text>

      {/* Image Upload Section */}
      <Text style={[typography.body, { color: colors.dark, marginTop: spacing.lg, marginBottom: spacing.sm, fontWeight: '600' }]}>
        {t('eventCreation.eventImage')}
      </Text>
      
      <View style={styles.imageUploadContainer}>
        {formData.image ? (
          <View style={styles.imagePreviewContainer}>
            <Avatar
              source={{ uri: formData.image }}
              size={200}
              containerStyle={styles.imagePreview}
            />
            {uploadingImage && (
              <View style={[styles.uploadOverlay, { backgroundColor: colors.dark + '80' }]}>
                <ActivityIndicator size="large" color={colors.white} />
                <Text style={[typography.small, { color: colors.white, marginTop: spacing.sm }]}>
                  {imageUploadProgress}%
                </Text>
              </View>
            )}
            <Button
              title={t('eventCreation.changeImage')}
              type="outline"
              buttonStyle={[styles.imageButton, { borderColor: colors.primary }]}
              titleStyle={{ color: colors.primary }}
              onPress={() => setShowImageOptions(true)}
              disabled={uploadingImage}
            />
            <Button
              title={t('eventCreation.removeImage')}
              type="clear"
              titleStyle={{ color: colors.danger }}
              onPress={handleRemoveImage}
              disabled={uploadingImage}
            />
          </View>
        ) : (
          <Pressable
            style={[styles.imageUploadPlaceholder, { backgroundColor: colors.lightGrey }]}
            onPress={() => setShowImageOptions(true)}
            disabled={uploadingImage}
          >
            <Icon name="add-photo-alternate" type="material" color={colors.midGrey} size={48} />
            <Text style={[typography.body, { color: colors.midGrey, marginTop: spacing.md }]}>
              {t('eventCreation.uploadEventImage')}
            </Text>
            <Text style={[typography.small, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              {t('eventCreation.imageRequirements')}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Image Selection Overlay */}
      <Overlay
        isVisible={showImageOptions}
        onBackdropPress={() => setShowImageOptions(false)}
        overlayStyle={styles.imageOptionsOverlay}
      >
        <View>
          <Text h4 style={[typography.h3, { marginBottom: spacing.lg, color: colors.dark }]}>
            {t('eventCreation.selectImageSource')}
          </Text>
          
          <ListItem
            onPress={() => handleImageSelection('camera')}
            bottomDivider
            containerStyle={{ paddingHorizontal: 0 }}
          >
            <Icon name="camera-alt" type="material" color={colors.primary} />
            <ListItem.Content>
              <ListItem.Title>{t('eventCreation.takePhoto')}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          
          <ListItem
            onPress={() => handleImageSelection('gallery')}
            containerStyle={{ paddingHorizontal: 0 }}
          >
            <Icon name="photo-library" type="material" color={colors.primary} />
            <ListItem.Content>
              <ListItem.Title>{t('eventCreation.chooseFromGallery')}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          
          <Button
            title={t('common.cancel')}
            type="clear"
            titleStyle={{ color: colors.midGrey }}
            onPress={() => setShowImageOptions(false)}
            containerStyle={{ marginTop: spacing.md }}
          />
        </View>
      </Overlay>

      {/* Validation Summary */}
      {(errors.title || errors.description) && (
        <View style={{
          backgroundColor: colors.danger + '15',
          padding: spacing.md,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: colors.danger,
          marginTop: spacing.md,
        }}>
          <Text style={[typography.small, { color: colors.danger, fontWeight: '600' }]}>
            {t('eventCreation.validationSummary')}
          </Text>
          {errors.title && (
            <Text style={[typography.small, { color: colors.danger, marginTop: spacing.xs }]}>
              • {errors.title}
            </Text>
          )}
          {errors.description && (
            <Text style={[typography.small, { color: colors.danger, marginTop: spacing.xs }]}>
              • {errors.description}
            </Text>
          )}
        </View>
      )}
    </Card>
  );

  const DateTimeStep = () => (
    <Card containerStyle={{ backgroundColor: colors.white }}>
      <Text h3 style={[typography.h2, { marginBottom: spacing.md, color: colors.dark }]}>
        {t('eventCreation.dateTime')}
      </Text>
      <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
        {t('eventCreation.dateTimeDescription')}
      </Text>

      {/* Start Date and Time */}
      <Text style={[typography.body, { color: colors.dark, marginBottom: spacing.sm, fontWeight: '600' }]}>
        {t('eventCreation.startDate')}
      </Text>
      
      <View style={[styles.dateTimeRow, isTablet && styles.dateTimeRowTablet]}>
        {/* Start Date Picker */}
        <Pressable
          style={[styles.dateTimeButton, { backgroundColor: colors.lightGrey, flex: 1, marginRight: spacing.sm }]}
          onPress={() => setShowStartDatePicker(true)}
          accessibilityRole="button"
          accessibilityLabel={t('eventCreation.selectDate')}
          accessibilityHint={t('eventCreation.startDate')}
        >
          <Icon name="calendar-today" type="material" color={colors.primary} size={20} />
          <Text style={[typography.body, { color: colors.dark, marginLeft: spacing.sm }]}>
            {formatDate(formData.startDateTime)}
          </Text>
        </Pressable>

        {/* Start Time Picker */}
        <Pressable
          style={[styles.dateTimeButton, { backgroundColor: colors.lightGrey, flex: 1, marginLeft: spacing.sm }]}
          onPress={() => setShowStartTimePicker(true)}
        >
          <Icon name="access-time" type="material" color={colors.primary} size={20} />
          <Text style={[typography.body, { color: colors.dark, marginLeft: spacing.sm }]}>
            {formatTime(formData.startDateTime)}
          </Text>
        </Pressable>
      </View>

      {errors.startDateTime && (
        <Text style={[typography.small, { color: colors.danger, marginTop: spacing.xs }]}>
          {errors.startDateTime}
        </Text>
      )}

      {/* End Date and Time */}
      <Text style={[typography.body, { color: colors.dark, marginTop: spacing.lg, marginBottom: spacing.sm, fontWeight: '600' }]}>
        {t('eventCreation.endDate')}
      </Text>
      
      <View style={[styles.dateTimeRow, isTablet && styles.dateTimeRowTablet]}>
        {/* End Date Picker */}
        <Pressable
          style={[styles.dateTimeButton, { backgroundColor: colors.lightGrey, flex: 1, marginRight: spacing.sm }]}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Icon name="calendar-today" type="material" color={colors.primary} size={20} />
          <Text style={[typography.body, { color: colors.dark, marginLeft: spacing.sm }]}>
            {formatDate(formData.endDateTime)}
          </Text>
        </Pressable>

        {/* End Time Picker */}
        <Pressable
          style={[styles.dateTimeButton, { backgroundColor: colors.lightGrey, flex: 1, marginLeft: spacing.sm }]}
          onPress={() => setShowEndTimePicker(true)}
        >
          <Icon name="access-time" type="material" color={colors.primary} size={20} />
          <Text style={[typography.body, { color: colors.dark, marginLeft: spacing.sm }]}>
            {formatTime(formData.endDateTime)}
          </Text>
        </Pressable>
      </View>

      {errors.endDateTime && (
        <Text style={[typography.small, { color: colors.danger, marginTop: spacing.xs }]}>
          {errors.endDateTime}
        </Text>
      )}

      {/* Validation Summary for Date/Time */}
      {(errors.startDateTime || errors.endDateTime) && (
        <View style={{
          backgroundColor: colors.danger + '15',
          padding: spacing.md,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: colors.danger,
          marginTop: spacing.lg,
        }}>
          <Text style={[typography.small, { color: colors.danger, fontWeight: '600' }]}>
            {t('eventCreation.validationSummary')}
          </Text>
          {errors.startDateTime && (
            <Text style={[typography.small, { color: colors.danger, marginTop: spacing.xs }]}>
              • {errors.startDateTime}
            </Text>
          )}
          {errors.endDateTime && (
            <Text style={[typography.small, { color: colors.danger, marginTop: spacing.xs }]}>
              • {errors.endDateTime}
            </Text>
          )}
        </View>
      )}

      {/* Date/Time Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.startDateTime}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => handleDateTimeChange(event, selectedDate, 'startDate')}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={formData.startDateTime}
          mode="time"
          display="default"
          onChange={(event, selectedDate) => handleDateTimeChange(event, selectedDate, 'startTime')}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={formData.endDateTime}
          mode="date"
          display="default"
          minimumDate={formData.startDateTime}
          onChange={(event, selectedDate) => handleDateTimeChange(event, selectedDate, 'endDate')}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={formData.endDateTime}
          mode="time"
          display="default"
          onChange={(event, selectedDate) => handleDateTimeChange(event, selectedDate, 'endTime')}
        />
      )}

      {/* Timezone Info */}
      <View style={{
        backgroundColor: colors.lightGrey,
        padding: spacing.md,
        borderRadius: 8,
        marginTop: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <Icon name="info" type="material" color={colors.midGrey} size={16} />
        <Text style={[typography.small, { color: colors.midGrey, marginLeft: spacing.sm, flex: 1 }]}>
          {t('eventCreation.timezone')}: {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </Text>
      </View>
    </Card>
  );

  const CategoryLocationStep = () => (
    <Card containerStyle={{ backgroundColor: colors.white }}>
      <Text h3 style={[typography.h2, { marginBottom: spacing.md, color: colors.dark }]}>
        {t('eventCreation.categoryLocation')}
      </Text>
      <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
        {t('eventCreation.categoryLocationDescription')}
      </Text>

      {/* Category Selection Section */}
      <Text style={[typography.body, { color: colors.dark, marginBottom: spacing.sm, fontWeight: '600' }]}>
        {t('eventCreation.eventCategory')}
      </Text>
      <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.md }]}>
        {t('eventCreation.categoryHelpText')}
      </Text>

      {/* Selected Categories */}
      {formData.categories.length > 0 && (
        <View style={styles.selectedCategoriesContainer}>
          <Text style={[typography.small, { color: colors.dark, marginBottom: spacing.sm, fontWeight: '600' }]}>
            {t('eventCreation.selectedCategories')}:
          </Text>
          <View style={styles.categoriesChipContainer}>
            {formData.categories.map(categoryId => {
              const category = EVENT_CATEGORIES.find(cat => cat.id === categoryId);
              if (!category) return null;
              
              return (
                <Chip
                  key={categoryId}
                  title={category.name}
                  icon={{
                    name: 'close',
                    type: 'material',
                    size: 16,
                    color: colors.white,
                  }}
                  onPress={() => handleRemoveCategory(categoryId)}
                  buttonStyle={[styles.categoryChip, { backgroundColor: category.color }]}
                  titleStyle={{ color: colors.white, fontSize: 14 }}
                  containerStyle={{ margin: 4 }}
                />
              );
            })}
          </View>
        </View>
      )}

      {/* Category Selection Button */}
      <Button
        title={formData.categories.length > 0 ? t('eventCreation.changeCategories') : t('eventCreation.selectCategories')}
        type="outline"
        buttonStyle={[styles.categorySelectButton, { borderColor: colors.primary }]}
        titleStyle={{ color: colors.primary }}
        onPress={() => setShowCategoryPicker(true)}
        icon={{
          name: 'category',
          type: 'material',
          color: colors.primary,
          size: 20,
        }}
      />

      {errors.categories && (
        <Text style={[typography.small, { color: colors.danger, marginTop: spacing.xs }]}>
          {errors.categories}
        </Text>
      )}

      {/* Category Selection Overlay */}
      <Overlay
        isVisible={showCategoryPicker}
        onBackdropPress={() => setShowCategoryPicker(false)}
        overlayStyle={styles.categoryPickerOverlay}
      >
        <View>
          <Text h4 style={[typography.h3, { marginBottom: spacing.md, color: colors.dark }]}>
            {t('eventCreation.selectCategories')}
          </Text>
          <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
            {t('eventCreation.categoryPickerHelpText')}
          </Text>

          <ScrollView style={styles.categoryPickerScroll} showsVerticalScrollIndicator={false}>
            {EVENT_CATEGORIES.map(category => (
              <ListItem
                key={category.id}
                onPress={() => handleCategoryToggle(category.id)}
                bottomDivider
                containerStyle={styles.categoryListItem}
              >
                <Icon 
                  name={category.icon} 
                  type="material" 
                  color={category.color} 
                  size={24}
                />
                <ListItem.Content>
                  <ListItem.Title style={[typography.body, { color: colors.dark }]}>
                    {category.name}
                  </ListItem.Title>
                  <ListItem.Subtitle style={[typography.small, { color: colors.textSecondary }]}>
                    {category.description}
                  </ListItem.Subtitle>
                </ListItem.Content>
                <CheckBox
                  checked={formData.categories.includes(category.id)}
                  onPress={() => handleCategoryToggle(category.id)}
                  containerStyle={styles.categoryCheckbox}
                  checkedColor={colors.primary}
                />
              </ListItem>
            ))}
          </ScrollView>

          <View style={styles.categoryPickerButtons}>
            <Button
              title={t('common.done')}
              buttonStyle={[styles.categoryPickerButton, { backgroundColor: colors.primary }]}
              titleStyle={{ color: colors.white }}
              onPress={() => setShowCategoryPicker(false)}
            />
          </View>
        </View>
      </Overlay>

      {/* Location Information Section */}
      <Text style={[typography.body, { color: colors.dark, marginTop: spacing.xl, marginBottom: spacing.sm, fontWeight: '600' }]}>
        {t('eventCreation.locationInformation')}
      </Text>

      {/* Venue Name Input */}
      <Input
        testID="venue-name-input"
        label={t('eventCreation.venueName')}
        placeholder={t('eventCreation.venueNamePlaceholder')}
        value={formData.venueName}
        onChangeText={(text) => {
          setFormData(prev => ({ ...prev, venueName: text }));
          if (errors.venueName) {
            setErrors(prev => ({ ...prev, venueName: undefined }));
          }
        }}
        errorMessage={errors.venueName}
        containerStyle={{ marginBottom: spacing.md }}
        rightIcon={{
          name: 'location-on',
          type: 'material',
          color: colors.midGrey,
        }}
      />

      {/* Venue Address Input */}
      <Input
        testID="venue-address-input"
        label={t('eventCreation.venueAddress')}
        placeholder={t('eventCreation.venueAddressPlaceholder')}
        value={formData.venueAddress}
        onChangeText={(text) => {
          setFormData(prev => ({ ...prev, venueAddress: text }));
          if (errors.venueAddress) {
            setErrors(prev => ({ ...prev, venueAddress: undefined }));
          }
        }}
        errorMessage={errors.venueAddress}
        multiline
        numberOfLines={3}
        containerStyle={{ marginBottom: spacing.md }}
        inputStyle={{ minHeight: 60, textAlignVertical: 'top' }}
        rightIcon={{
          name: 'map',
          type: 'material',
          color: colors.midGrey,
        }}
      />

      {/* Venue Capacity Input (Optional) */}
      <Input
        testID="venue-capacity-input"
        label={t('eventCreation.venueCapacity')}
        placeholder={t('eventCreation.venueCapacityPlaceholder')}
        value={formData.venueCapacity?.toString() || ''}
        onChangeText={(text) => {
          const capacity = text ? parseInt(text, 10) : undefined;
          setFormData(prev => ({ ...prev, venueCapacity: capacity }));
        }}
        keyboardType="numeric"
        containerStyle={{ marginBottom: spacing.md }}
        rightIcon={{
          name: 'group',
          type: 'material',
          color: colors.midGrey,
        }}
      />

      {/* Location Notes Input (Optional) */}
      <Input
        testID="location-notes-input"
        label={t('eventCreation.locationNotes')}
        placeholder={t('eventCreation.locationNotesPlaceholder')}
        value={formData.locationNotes || ''}
        onChangeText={(text) => {
          setFormData(prev => ({ ...prev, locationNotes: text }));
        }}
        multiline
        numberOfLines={3}
        containerStyle={{ marginBottom: spacing.lg }}
        inputStyle={{ minHeight: 60, textAlignVertical: 'top' }}
        rightIcon={{
          name: 'note',
          type: 'material',
          color: colors.midGrey,
        }}
      />

      {/* Validation Summary for Category/Location */}
      {(errors.categories || errors.venueName || errors.venueAddress) && (
        <View style={{
          backgroundColor: colors.danger + '15',
          padding: spacing.md,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: colors.danger,
          marginTop: spacing.md,
        }}>
          <Text style={[typography.small, { color: colors.danger, fontWeight: '600' }]}>
            {t('eventCreation.validationSummary')}
          </Text>
          {errors.categories && (
            <Text style={[typography.small, { color: colors.danger, marginTop: spacing.xs }]}>
              • {errors.categories}
            </Text>
          )}
          {errors.venueName && (
            <Text style={[typography.small, { color: colors.danger, marginTop: spacing.xs }]}>
              • {errors.venueName}
            </Text>
          )}
          {errors.venueAddress && (
            <Text style={[typography.small, { color: colors.danger, marginTop: spacing.xs }]}>
              • {errors.venueAddress}
            </Text>
          )}
        </View>
      )}
    </Card>
  );

  const PreviewStep = () => (
    <Card containerStyle={{ backgroundColor: colors.white }}>
      <Text h3 style={[typography.h2, { marginBottom: spacing.md, color: colors.dark }]}>
        {t('eventCreation.preview')}
      </Text>
      <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
        {t('eventCreation.previewDescription')}
      </Text>
      <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', padding: spacing.xl }]}>
        {t('eventCreation.previewComingSoon')}
      </Text>
    </Card>
  );

  // useEffect hooks for form management
  // Handle responsive design dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ screen }) => {
      setScreenData(screen);
    });

    return () => subscription?.remove();
  }, []);

  // Load draft on component mount
  useEffect(() => {
    loadDraftFromStorage();
  }, []);

  // Auto-save draft every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      const interval = setInterval(() => {
        saveDraftToStorage(true); // Silent save
      }, AUTO_SAVE_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [hasUnsavedChanges]);

  // Update form progress whenever form data changes
  useEffect(() => {
    const progress = calculateFormProgress();
    setFormProgress(progress);
    setHasUnsavedChanges(true);
  }, [formData]);

  // Update step completion status based on validation
  useEffect(() => {
    steps.forEach((step, index) => {
      if (step.id < currentStep) {
        step.completed = true;
      } else if (step.id === currentStep) {
        step.completed = false;
      } else {
        step.completed = false;
      }
    });
  }, [currentStep]);

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: spacing.lg }]}>
        <View style={styles.headerContent}>
          <Button
            type="clear"
            onPress={handleBack}
            icon={
              <Icon
                name="arrow-back"
                type="material"
                color={colors.primary}
                size={24}
              />
            }
            buttonStyle={styles.backButton}
          />
          <Text h1 style={[typography.h1, { color: colors.dark, flex: 1, textAlign: 'center' }]}>
            {t('eventCreation.createEvent')}
          </Text>
          <Button
            title={t('eventCreation.saveDraft')}
            type="clear"
            titleStyle={{ color: colors.primary, fontSize: 14 }}
            onPress={handleSaveDraft}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {t('eventCreation.progress')}: {formProgress}%
            </Text>
            {lastSaveTime && (
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {t('eventCreation.lastSaved')}: {lastSaveTime.toLocaleTimeString()}
              </Text>
            )}
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.lightGrey }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: colors.primary,
                  width: `${formProgress}%`
                }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Step Indicator */}
      <StepIndicator />

      {/* Form Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer, 
          { 
            paddingHorizontal: isTablet ? spacing.xl * 2 : spacing.md,
            maxWidth: isDesktop ? 800 : '100%',
            alignSelf: 'center',
            width: '100%'
          }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={[
        styles.navigationButtons, 
        { backgroundColor: colors.white, borderTopColor: colors.border },
        isTablet && styles.navigationButtonsTablet
      ]}>
        <Button
          title={t('common.previous')}
          type="outline"
          buttonStyle={[styles.navButton, { borderColor: colors.midGrey }]}
          titleStyle={{ color: colors.midGrey }}
          onPress={handlePrevious}
          disabled={currentStep === 1}
        />
        <Button
          title={currentStep === steps.length ? t('eventCreation.createEvent') : t('common.next')}
          buttonStyle={[styles.navButton, { backgroundColor: colors.primary }]}
          titleStyle={{ color: colors.white }}
          onPress={handleNext}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 44,
  },
  backButton: {
    paddingHorizontal: 8,
    minWidth: 44,
    minHeight: 44,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepIndicatorCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepTitle: {
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  stepConnector: {
    height: 2,
    flex: 0.8,
    marginTop: -20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Space for navigation buttons
  },
  navigationButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    paddingBottom: 34, // Account for safe area on iOS
  },
  navButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    minHeight: 44,
  },
  imageUploadContainer: {
    marginBottom: 16,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    borderRadius: 8,
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButton: {
    borderRadius: 8,
    marginBottom: 8,
    paddingVertical: 12,
    width: 200,
  },
  imageUploadPlaceholder: {
    height: 200,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6C757D40',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  imageOptionsOverlay: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  selectedCategoriesContainer: {
    marginBottom: 16,
  },
  categoriesChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 32,
  },
  categorySelectButton: {
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  categoryPickerOverlay: {
    width: '95%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 24,
  },
  categoryPickerScroll: {
    maxHeight: 400,
  },
  categoryListItem: {
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  categoryCheckbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  categoryPickerButtons: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  categoryPickerButton: {
    borderRadius: 8,
    paddingVertical: 14,
  },
  
  // Responsive styles for tablet (≥768px)
  dateTimeRowTablet: {
    flexDirection: 'row',
    gap: 16,
  },
  stepIndicatorCardTablet: {
    marginHorizontal: 32,
    paddingHorizontal: 24,
  },
  stepItemTablet: {
    flex: 0,
    minWidth: 120,
  },
  navigationButtonsTablet: {
    paddingHorizontal: 32,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  
  // Responsive styles for desktop (≥1200px)
  formFieldsDesktop: {
    flexDirection: 'row',
    gap: 24,
  },
  formFieldDesktop: {
    flex: 1,
  },
});