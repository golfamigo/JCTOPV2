import React from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import { Card, Text, Button, Icon, Badge } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { EventWithRelations } from '@jctop-event/shared-types';
import { useAppTheme } from '@/theme';

interface EventCardProps {
  event: EventWithRelations;
  onFavorite?: (eventId: string, isFavorited: boolean) => void;
  isFavorited?: boolean;
  onEventClick?: (eventId: string) => void;
  onRegister?: (eventId: string) => void;
  isLoading?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onFavorite,
  isFavorited = false,
  onEventClick,
  onRegister,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();

  const formatDate = (date: Date | string) => {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  const formatTime = (date: Date | string) => {
    const dateObj = new Date(date);
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getMinPrice = () => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) {
      return t('events.free');
    }
    const minPrice = Math.min(...event.ticketTypes.map(ticket => ticket.price));
    return minPrice === 0 ? t('events.free') : `NT$${minPrice.toFixed(0)}`;
  };

  const handleViewDetailsPress = () => {
    if (onEventClick && !isLoading) {
      onEventClick(event.id);
    }
  };

  const handleFavoritePress = () => {
    if (onFavorite && !isLoading) {
      onFavorite(event.id, !isFavorited);
    }
  };

  const handleRegisterPress = () => {
    if (onRegister && !isLoading) {
      onRegister(event.id);
    }
  };

  if (isLoading) {
    return (
      <Card containerStyle={{ margin: spacing.sm }}>
        <View style={{ height: 200, backgroundColor: colors.lightGrey }} />
        <View style={{ padding: spacing.md }}>
          <View style={{ height: 24, backgroundColor: colors.lightGrey, marginBottom: spacing.sm }} />
          <View style={{ height: 16, backgroundColor: colors.lightGrey, marginBottom: spacing.sm }} />
          <View style={{ height: 16, backgroundColor: colors.lightGrey, marginBottom: spacing.sm }} />
          <View style={{ height: 20, width: 80, backgroundColor: colors.lightGrey }} />
        </View>
      </Card>
    );
  }

  return (
    <Card
      containerStyle={{
        margin: spacing.sm,
        borderRadius: 8,
        shadowColor: colors.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
        {/* Event Image */}
        <View style={{ position: 'relative' }}>
          <View
            style={{
              height: 200,
              backgroundColor: colors.lightGrey,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.midGrey, fontSize: 14 }}>
              🎟️ {t('events.eventName')}
            </Text>
          </View>
          
          {/* Favorite Button */}
          {onFavorite && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: spacing.sm,
                right: spacing.sm,
                backgroundColor: colors.white,
                borderRadius: 20,
                padding: spacing.xs,
                shadowColor: colors.dark,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2,
              }}
              onPress={handleFavoritePress}
              testID={`favorite-button-${event.id}`}
              accessibilityLabel={isFavorited ? t('events.removeFromFavorites') : t('events.addToFavorites')}
            >
              <Icon
                name="heart"
                type="material-community"
                color={isFavorited ? colors.danger : colors.midGrey}
                size={20}
              />
            </TouchableOpacity>
          )}

          {/* Event Status Badge */}
          {event.status && event.status === 'published' && (
            <Badge
              value={event.status}
              status="success"
              containerStyle={{
                position: 'absolute',
                top: spacing.sm,
                left: spacing.sm,
              }}
              badgeStyle={{
                borderRadius: 12,
              }}
            />
          )}
        </View>

        {/* Event Details */}
        <Card.Divider />
        <View style={{ padding: spacing.md }}>
          {/* Category */}
          {event.category && (
            <Badge
              value={event.category.name}
              status="primary"
              containerStyle={{ alignSelf: 'flex-start', marginBottom: spacing.sm }}
              badgeStyle={{
                backgroundColor: colors.primary,
                borderRadius: 12,
              }}
            />
          )}

          {/* Event Title */}
          <Text
            h3
            style={{
              color: colors.dark,
              marginBottom: spacing.sm,
              lineHeight: 24,
            }}
            numberOfLines={2}
          >
            {event.title}
          </Text>

          {/* Date and Time */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
            <Icon
              name="calendar"
              type="material-community"
              color={colors.midGrey}
              size={16}
              containerStyle={{ marginRight: spacing.xs }}
            />
            <Text style={{ color: colors.midGrey, fontSize: 14 }}>
              {formatDate(event.startDate)} • {formatTime(event.startDate)}
            </Text>
          </View>

          {/* Location */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
            <Icon
              name="map-marker"
              type="material-community"
              color={colors.midGrey}
              size={16}
              containerStyle={{ marginRight: spacing.xs }}
            />
            <Text
              style={{ color: colors.midGrey, fontSize: 14, flex: 1 }}
              numberOfLines={1}
            >
              {event.venue?.name || event.location}
            </Text>
          </View>

          {/* Price */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
            <Icon
              name="currency-twd"
              type="material-community"
              color={colors.success}
              size={16}
              containerStyle={{ marginRight: spacing.xs }}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: colors.success,
              }}
            >
              {t('events.from')} {getMinPrice()}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Register Button - Only show for published events */}
            {event.status === 'published' && onRegister && (
              <Button
                title={t('events.register')}
                onPress={handleRegisterPress}
                buttonStyle={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: spacing.sm,
                  flex: 1,
                  marginRight: spacing.xs,
                }}
                titleStyle={{ fontSize: 14, fontWeight: '600' }}
                testID={`register-button-${event.id}`}
                accessibilityLabel={`${t('events.registerForEvent')} ${event.title}`}
              />
            )}

            {/* View Details Button */}
            <Button
              title={t('events.viewDetails')}
              type="outline"
              onPress={handleViewDetailsPress}
              buttonStyle={{
                borderColor: colors.primary,
                borderRadius: 8,
                paddingVertical: spacing.sm,
                flex: event.status === 'published' && onRegister ? 1 : undefined,
                marginLeft: event.status === 'published' && onRegister ? spacing.xs : 0,
              }}
              titleStyle={{
                color: colors.primary,
                fontSize: 14,
                fontWeight: '600',
              }}
              testID={`view-details-button-${event.id}`}
              accessibilityLabel={`${t('events.viewDetails')} ${event.title}`}
            />
          </View>
        </View>
      </Card>
  );
};

export default EventCard;