import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {
  Button,
  Text,
  Card,
  Image,
  Divider,
  Icon,
  Badge,
} from '@rneui/themed';
import { Registration } from '@jctop-event/shared-types';
import registrationService from '../../../services/registrationService';

interface RegistrationConfirmationPageProps {
  registrationId: string;
}

const RegistrationConfirmationPage: React.FC<RegistrationConfirmationPageProps> = ({
  registrationId
}) => {
  const router = useRouter();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRegistration();
  }, [registrationId]);

  const loadRegistration = async () => {
    try {
      setIsLoading(true);
      const data = await registrationService.getRegistration(registrationId);
      setRegistration(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load registration');
      Alert.alert('Error', err.message || 'Failed to load registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTickets = () => {
    router.push('/tickets');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@jctop.com');
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3182CE" />
        <Text style={styles.loadingText}>Loading registration...</Text>
      </View>
    );
  }

  if (error || !registration) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error" type="material" color="#E53E3E" size={48} />
        <Text style={styles.errorText}>{error || 'Registration not found'}</Text>
        <Button
          title="Try Again"
          onPress={loadRegistration}
          buttonStyle={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <View style={styles.successHeader}>
          <Icon
            name="check-circle"
            type="material"
            color="#48BB78"
            size={64}
          />
          <Text h3 style={styles.successTitle}>Registration Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your registration has been successfully completed
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Registration ID:</Text>
            <Text style={styles.detailValue}>{registration.id}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Event:</Text>
            <Text style={styles.detailValue}>{(registration as any).eventTitle || 'Event'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(registration.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Badge
              value={registrationService.formatRegistrationStatus(registration.status)}
              badgeStyle={[
                styles.statusBadge,
                { backgroundColor: registrationService.getStatusColor(registration.status) }
              ]}
            />
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount:</Text>
            <Text style={styles.detailValue}>
              ${registration.finalAmount.toFixed(2)}
            </Text>
          </View>

          {registration.discountAmount && registration.discountAmount > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Discount Applied:</Text>
              <Text style={styles.discountValue}>
                -${registration.discountAmount!.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ticket Details</Text>
          
          {registration.ticketSelections.map((selection, index) => (
            <Card key={index} containerStyle={styles.ticketCard}>
              <View style={styles.ticketRow}>
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketName}>Ticket Type {selection.ticketTypeId}</Text>
                  <Text style={styles.ticketQuantity}>
                    Quantity: {selection.quantity}
                  </Text>
                </View>
                <Text style={styles.ticketPrice}>
                  ${(selection.price * selection.quantity).toFixed(2)}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendee Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>{(registration as any).userName || 'User'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{(registration as any).userEmail || 'Email not available'}</Text>
          </View>

          {(registration as any).userPhone && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>{(registration as any).userPhone}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Icon name="info" type="material" color="#3182CE" size={20} />
          <Text style={styles.infoText}>
            A confirmation email has been sent to {(registration as any).userEmail || 'your email'} with your ticket details and QR code.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="View My Tickets"
            onPress={handleViewTickets}
            buttonStyle={styles.primaryButton}
            icon={
              <Icon
                name="confirmation-number"
                type="material"
                color="white"
                size={20}
                style={{ marginRight: 8 }}
              />
            }
          />

          <Button
            title="Contact Support"
            type="outline"
            onPress={handleContactSupport}
            buttonStyle={styles.outlineButton}
            titleStyle={styles.outlineButtonText}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    margin: 16,
    borderRadius: 8,
    padding: 0,
  },
  successHeader: {
    alignItems: 'center',
    padding: 24,
  },
  successTitle: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  successSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#718096',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#48BB78',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  ticketCard: {
    marginBottom: 12,
    borderRadius: 6,
    padding: 12,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketInfo: {
    flex: 1,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  ticketQuantity: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EBF8FF',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 6,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#2C5282',
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3182CE',
    paddingVertical: 12,
    borderRadius: 6,
  },
  outlineButton: {
    borderColor: '#3182CE',
    paddingVertical: 12,
    borderRadius: 6,
  },
  outlineButtonText: {
    color: '#3182CE',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#718096',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#E53E3E',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#3182CE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
});

export default RegistrationConfirmationPage;