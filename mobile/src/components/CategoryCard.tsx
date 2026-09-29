import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Task } from '../types';

interface CategoryCardProps {
  task: Task;
  isExpanded: boolean;
  selectedSubServices: string[];
  onToggleExpand: () => void;
  onToggleSubService: (service: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  task,
  isExpanded,
  selectedSubServices,
  onToggleExpand,
  onToggleSubService,
}) => {
  const isComingSoon = Boolean(task.is_coming_soon);

  return (
    <TouchableOpacity
      activeOpacity={isComingSoon ? 0.9 : 0.8}
      onPress={isComingSoon ? undefined : onToggleExpand}
      style={[
        styles.cardContainer,
        isExpanded && styles.expandedContainer,
        isComingSoon && styles.comingSoonContainer,
      ]}
    >
      <View style={styles.headerRow}>
        {/* Category Icon */}
        <View style={[styles.iconWrapper, isExpanded && styles.iconWrapperExpanded]}>
          <MaterialCommunityIcons
            name={(task.icon_name as any) || 'bookmark-outline'}
            size={22}
            color={isExpanded ? '#5eead4' : colors.primary}
          />
        </View>

        {/* Title & Description */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isExpanded && styles.titleExpanded]}>
              {task.title}
            </Text>
            {isComingSoon && (
              <View style={styles.soonBadge}>
                <Text style={styles.soonBadgeText}>Soon</Text>
              </View>
            )}
          </View>
          <Text style={styles.description}>{task.description}</Text>
        </View>
      </View>

      {/* Expanded sub-services */}
      {isExpanded && !isComingSoon && (
        <View style={styles.subServicesContainer}>
          <Text style={styles.subSectionTitle}>WHAT KIND OF HELP?</Text>
          <View style={styles.pillsRow}>
            {task.sub_services.map((service, index) => {
              const isSelected = selectedSubServices.includes(service);
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => onToggleSubService(service)}
                  style={[
                    styles.pill,
                    isSelected && styles.pillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isSelected && styles.pillTextSelected,
                    ]}
                  >
                    {service}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 12,
  },
  expandedContainer: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  comingSoonContainer: {
    opacity: 0.75,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconWrapperExpanded: {
    backgroundColor: colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  titleExpanded: {
    color: colors.primary,
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  soonBadge: {
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#fffbeb',
  },
  soonBadgeText: {
    fontSize: 11,
    color: '#d97706',
    fontWeight: '600',
  },
  subServicesContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(14, 75, 62, 0.1)',
  },
  subSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 4,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  pillTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
