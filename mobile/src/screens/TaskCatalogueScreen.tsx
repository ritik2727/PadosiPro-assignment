import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { CategoryCard } from '../components/CategoryCard';
import { tasksApi } from '../api/tasks';
import { Task } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TaskCatalogueScreenProps {
  initialCategory?: string;
  initialQuery?: string;
  onBack: () => void;
  onContinue: (selection: {
    category: string;
    serviceTitle: string;
    subServices: string[];
  }) => void;
}

export const TaskCatalogueScreen: React.FC<TaskCatalogueScreenProps> = ({
  initialCategory,
  initialQuery,
  onBack,
  onContinue,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [selectedSubServices, setSelectedSubServices] = useState<string[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');

  const fetchTasks = async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await tasksApi.getTasks(undefined, query);
      if (res.success && res.data) {
        setTasks(res.data);

        // If an initial category was requested, auto-expand it
        if (initialCategory) {
          const match = res.data.find((t) => t.category === initialCategory);
          if (match) {
            setExpandedCategoryId(match.id);
            setActiveTask(match);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load task catalogue. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(initialQuery);
  }, []);

  const handleToggleExpand = (task: Task) => {
    if (expandedCategoryId === task.id) {
      setExpandedCategoryId(null);
      setActiveTask(null);
      setSelectedSubServices([]);
    } else {
      setExpandedCategoryId(task.id);
      setActiveTask(task);
      setSelectedSubServices([]);
    }
  };

  const handleToggleSubService = (service: string) => {
    if (selectedSubServices.includes(service)) {
      setSelectedSubServices(selectedSubServices.filter((s) => s !== service));
    } else {
      setSelectedSubServices([...selectedSubServices, service]);
    }
  };

  const handleContinue = () => {
    if (!activeTask || selectedSubServices.length === 0) return;

    onContinue({
      category: activeTask.category,
      serviceTitle: activeTask.title,
      subServices: selectedSubServices,
    });
  };

  return (
    <View style={styles.container}>
      <Header onBack={onBack} />

      {/* Screen Title & Subtitle */}
      <View style={styles.headerArea}>
        <Text style={styles.heading}>What do you need help with?</Text>
        <Text style={styles.subtitle}>
          Pick a category, then choose a service. You can add details next.
        </Text>

        {/* Live Filter Bar */}
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks, e.g. cleaning, driver, flights..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              fetchTasks(text.trim());
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                fetchTasks('');
              }}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content Area */}
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading task catalogue...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Retry"
            variant="outline"
            style={{ marginTop: 14 }}
            onPress={() => fetchTasks(searchQuery)}
          />
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.centerState}>
          <MaterialCommunityIcons name="clipboard-text-search-outline" size={48} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No matching services found</Text>
          <Text style={styles.emptyDesc}>Try searching with different keywords like 'plumbing' or 'errands'.</Text>
          <Button
            title="Clear Search"
            variant="outline"
            style={{ marginTop: 14 }}
            onPress={() => {
              setSearchQuery('');
              fetchTasks('');
            }}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollList}>
          {tasks.map((task) => (
            <CategoryCard
              key={task.id}
              task={task}
              isExpanded={expandedCategoryId === task.id}
              selectedSubServices={selectedSubServices}
              onToggleExpand={() => handleToggleExpand(task)}
              onToggleSubService={handleToggleSubService}
            />
          ))}
        </ScrollView>
      )}

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <Button
          title={
            selectedSubServices.length > 0
              ? `Continue (${selectedSubServices.length} selected)`
              : 'Continue'
          }
          onPress={handleContinue}
          disabled={selectedSubServices.length === 0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fafbfc',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  scrollList: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: 14,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
});
