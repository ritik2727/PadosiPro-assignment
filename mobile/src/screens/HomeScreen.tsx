import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { tasksApi } from '../api/tasks';
import { UserRequest } from '../types';
import { Button } from '../components/Button';

interface HomeScreenProps {
  onNavigateToTasks: (category?: string, query?: string) => void;
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToTasks,
  onLogout,
}) => {
  const { profile, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  const profileName = profile?.fullName || (profile as any)?.full_name || '';
  const firstName = profileName ? profileName.split(' ')[0] : 'there';

  const fetchUserRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await tasksApi.getUserRequests();
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.warn('Failed to load user requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const popularCategories = [
    { title: 'Errands & Daily Tasks', category: 'errands', icon: 'checkbox-marked-circle-outline' },
    { title: 'Home Services', category: 'home', icon: 'home-outline' },
    { title: 'Travel & Tourism', category: 'travel', icon: 'map-marker-outline' },
    { title: 'Health & Medical', category: 'health', icon: 'heart-outline' },
    { title: 'Senior Care', category: 'senior', icon: 'account-group-outline' },
    { title: 'Events & Management', category: 'events', icon: 'calendar-outline' },
  ];

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      onNavigateToTasks(undefined, searchQuery.trim());
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContent}>
          {/* Top Bar Greeting */}
          <View style={styles.topBar}>
            <Text style={styles.greetingText}>Good morning, {firstName}</Text>
            <TouchableOpacity
              onPress={() => setShowProfileModal(true)}
              style={styles.avatarButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="account-circle-outline" size={32} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search Section */}
          <Text style={styles.mainTitle}>What do you need help with?</Text>

          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={22} color={colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="AC leaking, cook for weekends..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleSearchSubmit}>
                <MaterialCommunityIcons name="arrow-right-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Popular Categories */}
          <Text style={styles.sectionHeader}>POPULAR WITH FAMILIES LIKE YOURS</Text>
          <View style={styles.categoriesPillsGrid}>
            {popularCategories.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.75}
                onPress={() => onNavigateToTasks(item.category)}
                style={styles.categoryPill}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={18}
                  color={colors.primary}
                  style={styles.pillIcon}
                />
                <Text style={styles.pillText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Browse everything link */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigateToTasks()}
            style={styles.browseLinkRow}
          >
            <Text style={styles.browseLinkText}>Browse everything we do</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color={colors.primary} />
          </TouchableOpacity>

          {/* Active Tasks / Requests Section */}
          <View style={styles.activeRequestsSection}>
            <Text style={styles.sectionHeader}>YOUR ACTIVE REQUESTS</Text>
            {loadingRequests ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
            ) : requests.length > 0 ? (
              requests.map((req) => (
                <View key={req.id} style={styles.requestCard}>
                  <View style={styles.requestCardHeader}>
                    <Text style={styles.requestCardTitle}>{req.service_title}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>{req.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.subServicesSummary}>
                    {req.sub_services.join(', ')}
                  </Text>
                  <View style={styles.requestCardFooter}>
                    <Text style={styles.urgencyTag}>Urgency: {req.urgency}</Text>
                    <Text style={styles.lmTag}>LM: {req.lifestyle_manager}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyRequestsBox}>
                <Text style={styles.emptyRequestsText}>
                  No active requests yet. Pick a service above or browse our catalogue!
                </Text>
              </View>
            )}
          </View>

          {/* HOW PADOSIPRO WORKS */}
          <View style={styles.howItWorksCard}>
            <Text style={styles.howSectionTitle}>HOW PADOSIPRO WORKS</Text>

            <View style={styles.stepRow}>
              <View style={styles.stepIconWrap}>
                <MaterialCommunityIcons name="chat-processing-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>Tell us what you need</Text>
                <Text style={styles.stepDesc}>In your own words. No forms to hunt through.</Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepIconWrap}>
                <MaterialCommunityIcons name="account-arrow-right-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>Your Lifestyle Manager takes it on</Text>
                <Text style={styles.stepDesc}>One person who knows your family and follows it through.</Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepIconWrap}>
                <MaterialCommunityIcons name="check-circle-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>You see it done</Text>
                <Text style={styles.stepDesc}>Updates as things actually happen, with proof when it matters.</Text>
              </View>
            </View>
          </View>

          {/* Your Lifestyle Manager Card */}
          <View style={styles.lmCard}>
            <View>
              <Text style={styles.lmCardSub}>Your Lifestyle Manager</Text>
              <Text style={styles.lmCardName}>Pilot LM</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowChatModal(true)}
              style={styles.chatButton}
            >
              <MaterialCommunityIcons name="chat-outline" size={18} color={colors.primary} />
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Profile & Logout Modal */}
      <Modal
        visible={showProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>User Profile</Text>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Name:</Text>
              <Text style={styles.modalValue}>
                {profile?.fullName || (profile as any)?.full_name || 'N/A'}
              </Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Mobile:</Text>
              <Text style={styles.modalValue}>
                {profile?.mobileNumber || (profile as any)?.mobile_number || 'N/A'}
              </Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Address:</Text>
              <Text style={styles.modalValue}>
                {profile?.addressArea || (profile as any)?.address_area || 'N/A'}
              </Text>
            </View>
            {profile?.businessName || (profile as any)?.business_name ? (
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Business:</Text>
                <Text style={styles.modalValue}>
                  {profile?.businessName || (profile as any)?.business_name}
                </Text>
              </View>
            ) : null}

            <View style={styles.modalDivider} />

            <Button
              title="Log Out"
              variant="outline"
              onPress={async () => {
                setShowProfileModal(false);
                await logout();
                onLogout();
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* LM Chat Modal */}
      <Modal
        visible={showChatModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChatModal(false)}
      >
        <View style={styles.chatModalOverlay}>
          <View style={styles.chatModalCard}>
            <View style={styles.chatModalHeader}>
              <View>
                <Text style={styles.chatModalTitle}>Pilot LM</Text>
                <Text style={styles.chatModalSubtitle}>Your dedicated Lifestyle Manager</Text>
              </View>
              <TouchableOpacity onPress={() => setShowChatModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatMessagesArea}>
              <View style={styles.lmBubble}>
                <Text style={styles.lmBubbleText}>
                  Hi {firstName}! I'm Pilot LM, your dedicated manager. Whenever you need help with tasks, home repairs, or errands, submit a request and I'll handle the rest!
                </Text>
              </View>
            </ScrollView>

            <Button
              title="Close Chat"
              onPress={() => setShowChatModal(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  innerContent: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  avatarButton: {
    padding: 4,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    marginBottom: 28,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    fontSize: 15,
    color: colors.text,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  categoriesPillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pillIcon: {
    marginRight: 8,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  browseLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 4,
  },
  browseLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 6,
  },
  activeRequestsSection: {
    marginBottom: 28,
  },
  requestCard: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  requestCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  requestCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  statusBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065f46',
  },
  subServicesSummary: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  requestCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  urgencyTag: {
    fontSize: 12,
    color: colors.textMuted,
  },
  lmTag: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyRequestsBox: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
  },
  emptyRequestsText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  howItWorksCard: {
    backgroundColor: '#fafcfb',
    borderWidth: 1,
    borderColor: '#f1f5f3',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  howSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6f4f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepTextWrap: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  lmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
  },
  lmCardSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  lmCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  modalLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 18,
  },
  chatModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  chatModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 360,
  },
  chatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  chatModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  chatModalSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  chatMessagesArea: {
    flex: 1,
    marginBottom: 20,
  },
  lmBubble: {
    backgroundColor: colors.primaryLight,
    padding: 16,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  lmBubbleText: {
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
  },
});
