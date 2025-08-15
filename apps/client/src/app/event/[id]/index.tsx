import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, Share, Alert, Platform, Linking } from 'react-native';
import { ThemeProvider, Image, Text, Card, ListItem, Button, Icon, Badge, Skeleton, PricingCard } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EventWithRelations } from '@jctop-event/shared-types';

// Extended Event interface for UI display
interface EventDetail {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  organizer?: {
    id: string;
    name: string;
  };
  capacity?: number;
  remainingCapacity?: number;
  categories?: string[];
  ticketTypes?: {
    id: string;
    name: string;
    price: number;
    description: string;
    quantity: number;
    remaining: number;
    isEarlyBird: boolean;
  }[];
}
import eventService from '../../../services/eventService';
import { theme, customTheme } from '@/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

export default function EventDetailScreen() {
  const router = useRouter();
  const { id: eventId } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEvent();
      checkFavoriteStatus();
    }
  }, [eventId]);

  const loadEvent = async () => {
    if (!eventId) return;

    try {
      setIsLoading(true);
      setError(null);
      const eventData = await eventService.getPublicEventById(eventId);
      // Convert Date objects to strings and handle location data for local EventDetail interface
      const formattedEvent: EventDetail = {
        id: eventData.id,
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.startDate instanceof Date ? eventData.startDate.toISOString() : eventData.startDate,
        endDate: eventData.endDate ? (eventData.endDate instanceof Date ? eventData.endDate.toISOString() : eventData.endDate) : undefined,
        imageUrl: (eventData as any).imageUrl,
        location: typeof eventData.location === 'string' ? {
          address: eventData.location,
          latitude: 0,
          longitude: 0
        } : eventData.location as any,
        organizer: (eventData as any).organizer,
        capacity: (eventData as any).capacity,
        remainingCapacity: (eventData as any).remainingCapacity,
        categories: (eventData as any).categories,
        ticketTypes: (eventData as any).ticketTypes || (eventData as any).ticketTypes,
      };
      setEvent(formattedEvent);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('eventDetail.loadError');
      setError(errorMessage);
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favoriteEvents');
      if (favorites) {
        const favoriteIds = JSON.parse(favorites);
        setIsFavorite(favoriteIds.includes(eventId));
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!eventId) return;
    
    setIsLoadingFavorite(true);
    try {
      const favorites = await AsyncStorage.getItem('favoriteEvents');
      let favoriteIds = favorites ? JSON.parse(favorites) : [];
      
      if (isFavorite) {
        favoriteIds = favoriteIds.filter((id: string) => id !== eventId);
      } else {
        favoriteIds.push(eventId);
      }
      
      await AsyncStorage.setItem('favoriteEvents', JSON.stringify(favoriteIds));
      setIsFavorite(!isFavorite);
    } catch (error) {
      Alert.alert(t('common.error'), t('eventDetail.favoriteError'));
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleShare = async () => {
    if (!event) return;

    try {
      const message = `${event.title}\n${formatEventDate(event.startDate)}\n${event.location?.address || ''}`;
      
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(message);
        Alert.alert(t('common.success'), t('eventDetail.linkCopied'));
      } else {
        await Share.share({
          message,
          title: event.title,
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const formatEventDate = (date: string | Date) => {
    const eventDate = new Date(date);
    const year = eventDate.getFullYear();
    const month = eventDate.getMonth() + 1;
    const day = eventDate.getDate();
    const hours = eventDate.getHours().toString().padStart(2, '0');
    const minutes = eventDate.getMinutes().toString().padStart(2, '0');
    
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  };

  const formatCurrency = (amount: number) => {
    return `NT$ ${amount.toLocaleString('zh-TW')}`;
  };

  const getTicketQuantityColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 50) return customTheme.colors.success;
    if (percentage > 20) return customTheme.colors.warning;
    return customTheme.colors.danger;
  };

  const getEventStatus = () => {
    if (!event) return null;
    
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    
    if (now < startDate) {
      return { text: t('eventDetail.status.upcoming'), color: customTheme.colors.primary };
    } else if (endDate && now > endDate) {
      return { text: t('eventDetail.status.ended'), color: customTheme.colors.midGrey };
    } else {
      return { text: t('eventDetail.status.ongoing'), color: customTheme.colors.success };
    }
  };

  const handleRegister = (ticketTypeId?: string) => {
    router.push({
      pathname: `/event/[id]/register`,
      params: { id: eventId, ticketTypeId: ticketTypeId || '' }
    });
  };

  const handleDirections = () => {
    if (!event?.location) return;
    
    const { latitude, longitude, address } = event.location;
    const url = Platform.select({
      ios: `maps:${latitude},${longitude}?q=${encodeURIComponent(address)}`,
      android: `geo:${latitude},${longitude}?q=${encodeURIComponent(address)}`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    });
    
    Linking.openURL(url);
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <View style={styles.container}>
          <StatusBar style="light" />
          <Stack.Screen options={{ headerShown: false }} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Skeleton height={250} />
            <View style={styles.contentContainer}>
              <Skeleton height={32} style={{ marginBottom: customTheme.spacing.md }} />
              <Skeleton height={20} style={{ marginBottom: customTheme.spacing.sm }} />
              <Skeleton height={20} style={{ marginBottom: customTheme.spacing.lg }} />
              <Skeleton height={150} style={{ marginBottom: customTheme.spacing.lg }} />
              <Skeleton height={200} />
            </View>
          </ScrollView>
        </View>
      </ThemeProvider>
    );
  }

  if (error || !event) {
    return (
      <ThemeProvider theme={theme}>
        <View style={styles.errorContainer}>
          <StatusBar style="dark" />
          <Stack.Screen options={{ headerShown: false }} />
          <Icon
            name="alert-circle-outline"
            type="material-community"
            size={64}
            color={customTheme.colors.danger}
          />
          <Text h3 style={styles.errorText}>{t('eventDetail.notFound')}</Text>
          <Button
            title={t('common.back')}
            onPress={() => router.back()}
            buttonStyle={styles.backButton}
          />
        </View>
      </ThemeProvider>
    );
  }

  const eventStatus = getEventStatus();

  return (
    <ThemeProvider theme={theme}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <Stack.Screen options={{ headerShown: false }} />
        
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Event Header Section */}
          <View style={styles.headerContainer}>
            <Image
              source={{ uri: event.imageUrl || 'https://via.placeholder.com/800x450' }}
              style={styles.heroImage}
              PlaceholderContent={<Skeleton />}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.gradientOverlay}
            />
            
            {/* Back Button */}
            <View style={styles.headerActions}>
              <Icon
                name="arrow-left"
                type="material-community"
                color="white"
                size={28}
                onPress={() => router.back()}
                containerStyle={styles.backIconContainer}
                testID="back-button"
              />
            </View>
            
            {/* Header Content */}
            <View style={styles.headerContent}>
              <Text h1 style={styles.eventTitle}>{event.title}</Text>
              <View style={styles.headerInfo}>
                <Icon name="calendar" type="material-community" color="white" size={20} />
                <Text style={styles.headerInfoText}>{formatEventDate(event.startDate)}</Text>
              </View>
              <View style={styles.headerInfo}>
                <Icon name="map-marker" type="material-community" color="white" size={20} />
                <Text style={styles.headerInfoText}>{event.location?.address || t('eventDetail.noLocation')}</Text>
              </View>
              {event.organizer && (
                <View style={styles.headerInfo}>
                  <Icon name="account-circle" type="material-community" color="white" size={20} />
                  <Text style={styles.headerInfoText}>{event.organizer.name}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.contentContainer}>
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                title={t('eventDetail.share')}
                type="outline"
                icon={
                  <Icon
                    name="share-variant"
                    type="material-community"
                    size={20}
                    color={customTheme.colors.primary}
                    style={{ marginRight: 8 }}
                  />
                }
                onPress={handleShare}
                buttonStyle={styles.actionButton}
                titleStyle={styles.actionButtonText}
                testID="share-button"
              />
              <Button
                title={isFavorite ? t('eventDetail.favorited') : t('eventDetail.favorite')}
                type={isFavorite ? 'solid' : 'outline'}
                loading={isLoadingFavorite}
                icon={
                  <Icon
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    type="material-community"
                    size={20}
                    color={isFavorite ? 'white' : customTheme.colors.primary}
                    style={{ marginRight: 8 }}
                  />
                }
                onPress={toggleFavorite}
                buttonStyle={[styles.actionButton, isFavorite && styles.favoritedButton]}
                titleStyle={[styles.actionButtonText, isFavorite && styles.favoritedButtonText]}
                testID="favorite-button"
              />
            </View>

            {/* Event Status Badge */}
            {eventStatus && (
              <Badge
                value={eventStatus.text}
                badgeStyle={[styles.statusBadge, { backgroundColor: eventStatus.color }]}
                textStyle={styles.statusBadgeText}
              />
            )}

            {/* About Event Section */}
            <Card containerStyle={styles.sectionCard}>
              <ListItem bottomDivider>
                <Icon name="information" type="material-community" color={customTheme.colors.primary} />
                <ListItem.Content>
                  <ListItem.Title style={styles.sectionTitle}>{t('eventDetail.aboutEvent')}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
              
              <View style={styles.cardContent}>
                <Text style={styles.description} numberOfLines={isDescriptionExpanded ? undefined : 3}>
                  {event.description}
                </Text>
                {event.description && event.description.length > 150 && (
                  <Button
                    title={isDescriptionExpanded ? t('common.showLess') : t('common.showMore')}
                    type="clear"
                    onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    titleStyle={styles.expandButtonText}
                  />
                )}
              </View>
            </Card>

            {/* Event Details Section */}
            <Card containerStyle={styles.sectionCard}>
              <ListItem bottomDivider>
                <Icon name="calendar-text" type="material-community" color={customTheme.colors.primary} />
                <ListItem.Content>
                  <ListItem.Title style={styles.sectionTitle}>{t('eventDetail.eventDetails')}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
              
              <ListItem>
                <ListItem.Content>
                  <ListItem.Subtitle style={styles.detailLabel}>{t('eventDetail.startTime')}</ListItem.Subtitle>
                  <ListItem.Title style={styles.detailValue}>{formatEventDate(event.startDate)}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
              
              {event.endDate && (
                <ListItem>
                  <ListItem.Content>
                    <ListItem.Subtitle style={styles.detailLabel}>{t('eventDetail.endTime')}</ListItem.Subtitle>
                    <ListItem.Title style={styles.detailValue}>{formatEventDate(event.endDate)}</ListItem.Title>
                  </ListItem.Content>
                </ListItem>
              )}
              
              {event.capacity && (
                <ListItem>
                  <ListItem.Content>
                    <ListItem.Subtitle style={styles.detailLabel}>{t('eventDetail.capacity')}</ListItem.Subtitle>
                    <ListItem.Title style={styles.detailValue}>
                      {event.remainingCapacity}/{event.capacity} {t('eventDetail.availableSeats')}
                    </ListItem.Title>
                  </ListItem.Content>
                </ListItem>
              )}
              
              {event.categories && event.categories.length > 0 && (
                <ListItem>
                  <ListItem.Content>
                    <ListItem.Subtitle style={styles.detailLabel}>{t('eventDetail.categories')}</ListItem.Subtitle>
                    <View style={styles.categoriesContainer}>
                      {event.categories.map((category, index) => (
                        <Badge
                          key={index}
                          value={category}
                          badgeStyle={styles.categoryBadge}
                          textStyle={styles.categoryBadgeText}
                        />
                      ))}
                    </View>
                  </ListItem.Content>
                </ListItem>
              )}
            </Card>

            {/* Ticket Types Section */}
            {event.ticketTypes && event.ticketTypes.length > 0 && (
              <Card containerStyle={styles.sectionCard}>
                <ListItem bottomDivider>
                  <Icon name="ticket" type="material-community" color={customTheme.colors.primary} />
                  <ListItem.Content>
                    <ListItem.Title style={styles.sectionTitle}>{t('eventDetail.ticketTypes')}</ListItem.Title>
                  </ListItem.Content>
                </ListItem>
                
                <View style={styles.ticketsContainer}>
                  {event.ticketTypes.map((ticket) => {
                    const soldOut = ticket.remaining === 0;
                    const info = [];
                    
                    if (ticket.description) {
                      info.push(ticket.description);
                    }
                    
                    if (ticket.isEarlyBird) {
                      info.push(`🐦 ${t('eventDetail.earlyBird')}`);
                    }
                    
                    if (!soldOut) {
                      info.push(t('eventDetail.remaining', { count: ticket.remaining }));
                    }
                    
                    return (
                      <PricingCard
                        key={ticket.id}
                        color={soldOut ? customTheme.colors.danger : getTicketQuantityColor(ticket.remaining, ticket.quantity)}
                        title={ticket.name}
                        price={formatCurrency(ticket.price)}
                        info={info}
                        button={soldOut ? {
                          title: t('eventDetail.soldOut'),
                          buttonStyle: [styles.buyButton, { backgroundColor: customTheme.colors.danger }],
                          disabled: true
                        } : {
                          title: t('eventDetail.buyNow'),
                          buttonStyle: styles.buyButton,
                          onPress: () => handleRegister(ticket.id)
                        }}
                        containerStyle={styles.pricingCard}
                        pricingStyle={styles.pricingText}
                        titleStyle={styles.pricingTitle}
                        infoStyle={styles.pricingInfo}
                      />
                    );
                  })}
                </View>
              </Card>
            )}

            {/* Location Section */}
            {event.location && (
              <Card containerStyle={styles.sectionCard}>
                <ListItem bottomDivider>
                  <Icon name="map" type="material-community" color={customTheme.colors.primary} />
                  <ListItem.Content>
                    <ListItem.Title style={styles.sectionTitle}>{t('eventDetail.location')}</ListItem.Title>
                  </ListItem.Content>
                </ListItem>
                
                <View style={styles.cardContent}>
                  {/* Map placeholder - actual map component would go here */}
                  <View style={styles.mapPlaceholder}>
                    <Icon
                      name="map-marker"
                      type="material-community"
                      size={48}
                      color={customTheme.colors.primary}
                    />
                    <Text style={styles.mapPlaceholderText}>{t('eventDetail.mapPlaceholder')}</Text>
                  </View>
                  
                  <Text style={styles.address}>{event.location.address}</Text>
                  
                  <Button
                    title={t('eventDetail.getDirections')}
                    icon={
                      <Icon
                        name="directions"
                        type="material-community"
                        size={20}
                        color="white"
                        style={{ marginRight: 8 }}
                      />
                    }
                    onPress={handleDirections}
                    buttonStyle={styles.directionsButton}
                    testID="directions-button"
                  />
                </View>
              </Card>
            )}
          </View>
        </ScrollView>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: customTheme.spacing.xl,
    backgroundColor: customTheme.colors.background,
  },
  errorText: {
    marginTop: customTheme.spacing.md,
    marginBottom: customTheme.spacing.xl,
    textAlign: 'center',
    color: customTheme.colors.dark,
  },
  backButton: {
    paddingHorizontal: customTheme.spacing.xl,
  },
  headerContainer: {
    position: 'relative',
    height: 250,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  headerActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: customTheme.spacing.md,
    right: customTheme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  backIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: customTheme.spacing.sm,
  },
  headerContent: {
    position: 'absolute',
    bottom: customTheme.spacing.lg,
    left: customTheme.spacing.lg,
    right: customTheme.spacing.lg,
  },
  eventTitle: {
    color: 'white',
    fontSize: customTheme.typography.h1.fontSize,
    fontWeight: customTheme.typography.h1.fontWeight,
    marginBottom: customTheme.spacing.sm,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: customTheme.spacing.xs,
  },
  headerInfoText: {
    color: 'white',
    fontSize: customTheme.typography.small.fontSize,
    marginLeft: customTheme.spacing.sm,
    flex: 1,
  },
  contentContainer: {
    padding: isTablet ? customTheme.spacing.lg : customTheme.spacing.md,
    paddingBottom: customTheme.spacing.xl,
    maxWidth: isTablet ? 800 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  actionButtons: {
    flexDirection: isTablet ? 'row' : 'column',
    justifyContent: isTablet ? 'space-between' : 'center',
    marginBottom: customTheme.spacing.lg,
    gap: customTheme.spacing.md,
  },
  actionButton: {
    flex: 1,
    borderColor: customTheme.colors.primary,
    borderWidth: 1,
  },
  actionButtonText: {
    color: customTheme.colors.primary,
    fontSize: customTheme.typography.body.fontSize,
  },
  favoritedButton: {
    backgroundColor: customTheme.colors.primary,
  },
  favoritedButtonText: {
    color: 'white',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginBottom: customTheme.spacing.lg,
    paddingHorizontal: customTheme.spacing.md,
    paddingVertical: customTheme.spacing.sm,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: customTheme.typography.small.fontSize,
    fontWeight: '600',
  },
  sectionCard: {
    borderRadius: 8,
    marginBottom: customTheme.spacing.lg,
    padding: 0,
    shadowColor: customTheme.colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: customTheme.typography.h2.fontSize,
    fontWeight: customTheme.typography.h2.fontWeight,
    color: customTheme.colors.dark,
  },
  cardContent: {
    padding: customTheme.spacing.md,
  },
  description: {
    fontSize: customTheme.typography.body.fontSize,
    color: customTheme.colors.text,
    lineHeight: 24,
  },
  expandButtonText: {
    color: customTheme.colors.primary,
    fontSize: customTheme.typography.small.fontSize,
    marginTop: customTheme.spacing.sm,
  },
  detailLabel: {
    fontSize: customTheme.typography.small.fontSize,
    color: customTheme.colors.textSecondary,
    marginBottom: customTheme.spacing.xs,
  },
  detailValue: {
    fontSize: customTheme.typography.body.fontSize,
    color: customTheme.colors.text,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: customTheme.spacing.sm,
    gap: customTheme.spacing.sm,
  },
  categoryBadge: {
    backgroundColor: customTheme.colors.lightGrey,
    paddingHorizontal: customTheme.spacing.md,
    paddingVertical: customTheme.spacing.xs,
    borderRadius: 16,
  },
  categoryBadgeText: {
    color: customTheme.colors.text,
    fontSize: customTheme.typography.small.fontSize,
  },
  ticketsContainer: {
    padding: customTheme.spacing.md,
    gap: customTheme.spacing.md,
    flexDirection: isTablet ? 'row' : 'column',
    flexWrap: isTablet ? 'wrap' : 'nowrap',
  },
  pricingCard: {
    borderRadius: 8,
    marginHorizontal: 0,
    marginVertical: customTheme.spacing.sm,
    shadowColor: customTheme.colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: isTablet ? 1 : 0,
    minWidth: isTablet ? 280 : '100%',
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: customTheme.colors.dark,
  },
  pricingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: customTheme.colors.primary,
  },
  pricingInfo: {
    fontSize: customTheme.typography.small.fontSize,
    color: customTheme.colors.textSecondary,
  },
  buyButton: {
    backgroundColor: customTheme.colors.primary,
    paddingHorizontal: customTheme.spacing.lg,
    borderRadius: 20,
  },
  buyButtonText: {
    fontSize: customTheme.typography.body.fontSize,
    fontWeight: '600',
  },
  soldOutBadge: {
    backgroundColor: customTheme.colors.danger,
    paddingHorizontal: customTheme.spacing.md,
    paddingVertical: customTheme.spacing.sm,
  },
  soldOutText: {
    fontSize: customTheme.typography.small.fontSize,
    fontWeight: '600',
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: customTheme.colors.lightGrey,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: customTheme.spacing.md,
  },
  mapPlaceholderText: {
    marginTop: customTheme.spacing.sm,
    color: customTheme.colors.textSecondary,
    fontSize: customTheme.typography.small.fontSize,
  },
  address: {
    fontSize: customTheme.typography.body.fontSize,
    color: customTheme.colors.text,
    marginBottom: customTheme.spacing.md,
  },
  directionsButton: {
    backgroundColor: customTheme.colors.primary,
    borderRadius: 8,
  },
});