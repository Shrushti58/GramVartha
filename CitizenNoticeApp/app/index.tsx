/**
 * Home Screen - With Professional Splash Screen
 * Shows logo then fades to main content
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [selectedVillage, setSelectedVillage] = useState('Kasaba');
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation values
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const appNameSlide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simulate loading time (2 seconds)
    const timer = setTimeout(() => {
      // Fade out splash and fade in content
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(logoScale, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(appNameSlide, {
          toValue: -50,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsLoading(false);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Splash Screen Component
  const SplashScreen = () => (
    <Animated.View 
      style={[
        styles.splashContainer,
        {
          opacity: splashOpacity,
          transform: [{ scale: logoScale }]
        }
      ]}
    >
      <View style={styles.splashContent}>
        <View style={styles.splashLogoCircle}>
          <Image
            source={require("../assets/images/gramvarthalogo.png")}
            style={styles.splashLogoImage}
            resizeMode="contain"
          />
        </View>
        <Animated.Text 
          style={[
            styles.splashAppName,
            {
              transform: [{ translateY: appNameSlide }]
            }
          ]}
        >
          GramVartha
        </Animated.Text>
        <Text style={styles.splashTagline}>Digital Governance Portal</Text>
      </View>
    </Animated.View>
  );

  // Main Content
  const MainContent = () => (
    <Animated.View style={[styles.mainContainer, { opacity: contentOpacity }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Image
                source={require("../assets/images/gramvarthalogo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.appName}>GramVartha</Text>
              <Text style={styles.villageText}>{selectedVillage} • GP</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.villageSelector}>
            <Text style={styles.villageSelectorText}>Change</Text>
            <Text style={styles.chevron}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.welcomeTitle}>Your Village Updates</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: Colors.primary[50] }]}>
            <Text style={[styles.statValue, { color: Colors.primary[700] }]}>23</Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>New Notices</Text>
            <View style={[styles.statBadge, { backgroundColor: Colors.primary[500] }]}>
              <Text style={styles.statBadgeText}>+5 today</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: Colors.success + '15' }]}>
            <Text style={[styles.statValue, { color: Colors.success }]}>5</Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Urgent</Text>
            <View style={[styles.statBadge, { backgroundColor: Colors.success }]}>
              <Text style={styles.statBadgeText}>Action needed</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: Colors.warning + '15' }]}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>12</Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>Events</Text>
            <View style={[styles.statBadge, { backgroundColor: Colors.warning }]}>
              <Text style={styles.statBadgeText}>This week</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllLink, { color: Colors.primary[600] }]}>Customize →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: Colors.surface }]}
            onPress={() => router.push('notice' as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.primary[100] }]}>
              <Text style={styles.iconText}>📋</Text>
            </View>
            <Text style={styles.actionLabel}>All Notices</Text>
            <Text style={styles.actionCount}>156 total</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: Colors.surface }]}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.error + '20' }]}>
              <Text style={styles.iconText}>⚡</Text>
            </View>
            <Text style={styles.actionLabel}>Urgent</Text>
            <Text style={styles.actionCount}>5 new</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: Colors.surface }]}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.success + '20' }]}>
              <Text style={styles.iconText}>📅</Text>
            </View>
            <Text style={styles.actionLabel}>Events</Text>
            <Text style={styles.actionCount}>12 upcoming</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: Colors.surface }]}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.warning + '20' }]}>
              <Text style={styles.iconText}>🏛️</Text>
            </View>
            <Text style={styles.actionLabel}>Schemes</Text>
            <Text style={styles.actionCount}>8 active</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Notice */}
        <View style={[styles.featuredCard, { 
          backgroundColor: Colors.primary[600],
          shadowColor: Colors.primary[700] 
        }]}>
          <View style={styles.featuredContent}>
            <View>
              <View style={styles.featuredTag}>
                <Text style={styles.featuredTagText}>📢 FEATURED</Text>
              </View>
              <Text style={styles.featuredTitle}>Gram Sabha Meeting</Text>
              <Text style={styles.featuredDesc}>Today at 10:00 AM • Panchayat Hall</Text>
            </View>
            <TouchableOpacity style={styles.featuredButton}>
              <Text style={styles.featuredButtonText}>View →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trust Indicators */}
        <View style={styles.trustSection}>
          <View style={styles.trustItem}>
            <View style={[styles.trustDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.trustText}>Official Government Updates</Text>
          </View>
          <View style={styles.trustItem}>
            <View style={[styles.trustDot, { backgroundColor: Colors.primary[500] }]} />
            <Text style={styles.trustText}>No Login Required</Text>
          </View>
        </View>

      </View>

      {/* Bottom CTA */}
      <View style={styles.bottomCta}>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: Colors.button.primary }]}
          onPress={() => router.push('notice' as any)}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>View All Village Notices</Text>
          <View style={styles.buttonIcon}>
            <Text style={styles.buttonIconText}>→</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {isLoading ? <SplashScreen /> : <MainContent />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainContainer: {
    flex: 1,
  },

  // Splash Screen Styles
  splashContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  splashContent: {
    alignItems: 'center',
  },
  splashLogoCircle: {
    width: 120,
    height: 120,
    backgroundColor: Colors.surface,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  splashLogoImage: {
    width: 80,
    height: 80,
  },
  splashAppName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textInverse,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  splashTagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // Original Header Styles
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 60,
    height: 60,
    backgroundColor: Colors.primary[600],
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: Colors.primary[700],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary[700],
    lineHeight: 32,
  },
  villageText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  villageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  villageSelectorText: {
    fontSize: 12,
    color: Colors.primary[700],
    fontWeight: '500',
    marginRight: 4,
  },
  chevron: {
    fontSize: 10,
    color: Colors.primary[600],
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    position: 'relative',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 8,
  },
  statBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statBadgeText: {
    color: Colors.textInverse,
    fontSize: 9,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    width: (width - 50) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  actionCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  featuredCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  featuredContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  featuredTagText: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textInverse,
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  featuredButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featuredButtonText: {
    color: Colors.textInverse,
    fontSize: 13,
    fontWeight: '600',
  },
  trustSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  trustText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  bottomCta: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
    backgroundColor: Colors.background,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textInverse,
    marginRight: 8,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIconText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
});