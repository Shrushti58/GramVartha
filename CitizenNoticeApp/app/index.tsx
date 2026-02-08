/**
 * Landing Screen - Home/Hero Page
 * Welcome screen with app introduction and call to action
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        {/* Background gradient */}
        <View style={styles.gradientBackground}>
          <View style={[styles.floatingCircle, styles.circle1]} />
          <View style={[styles.floatingCircle, styles.circle2]} />
          <View style={[styles.floatingCircle, styles.circle3]} />
        </View>

        {/* Badge */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>✓ Serving Rural Communities</Text>
        </View>

        {/* Main Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <View style={styles.brandContainer}>
            <Text style={styles.brandText}>GramVartha</Text>
            <View style={styles.brandUnderline} />
          </View>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Empowering rural communities through digital governance and transparent communication
        </Text>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('notice' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>View All Notices</Text>
            <Text style={styles.buttonIcon}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>👥</Text>
            </View>
            <Text style={styles.statNumber}>10,000+</Text>
            <Text style={styles.statLabel}>Active Readers</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📍</Text>
            </View>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Villages Served</Text>
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        
        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>🔍</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Easy Search & Filter</Text>
            <Text style={styles.featureDescription}>
              Find notices quickly by category, keyword, or date
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>🔖</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Save & Bookmark</Text>
            <Text style={styles.featureDescription}>
              Save important notices for quick access anytime
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>📤</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Share Instantly</Text>
            <Text style={styles.featureDescription}>
              Share notices with family and community members
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>🔓</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>No Login Required</Text>
            <Text style={styles.featureDescription}>
              Access all public notices without registration
            </Text>
          </View>
        </View>
      </View>

      {/* Categories Preview */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Notice Categories</Text>
        <View style={styles.categoryGrid}>
          {[
            { icon: '🏗️', name: 'Development' },
            { icon: '❤️', name: 'Health' },
            { icon: '🎓', name: 'Education' },
            { icon: '🚜', name: 'Agriculture' },
            { icon: '💼', name: 'Employment' },
            { icon: '👥', name: 'Social Welfare' },
          ].map((category, index) => (
            <View key={index} style={styles.categoryChip}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Final CTA */}
      <View style={styles.finalCTA}>
        <Text style={styles.finalCTATitle}>Ready to Stay Informed?</Text>
        <Text style={styles.finalCTASubtitle}>
          Access the latest government notices and announcements
        </Text>
        <TouchableOpacity
          style={styles.finalCTAButton}
          onPress={() => router.push('notice' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.finalCTAButtonText}>Explore Notices</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ for Citizens
        </Text>
        <Text style={styles.footerVersion}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary[50],
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: Colors.primary[300],
    top: -50,
    left: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: Colors.primary[400],
    top: 100,
    right: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: Colors.primary[500],
    bottom: 50,
    left: width / 2 - 50,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[100],
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.primary[200],
    marginBottom: 24,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[500],
    marginRight: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary[800],
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  brandContainer: {
    position: 'relative',
  },
  brandText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6D4C41',
    letterSpacing: -1,
  },
  brandUnderline: {
    height: 6,
    backgroundColor: Colors.primary[200],
    borderRadius: 3,
    marginTop: -10,
    marginHorizontal: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  ctaContainer: {
    marginBottom: 40,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: Colors.button.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textInverse,
    marginRight: 8,
  },
  buttonIcon: {
    fontSize: 20,
    color: Colors.textInverse,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: Colors.primary[100],
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 28,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: Colors.surface,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: Colors.primary[50],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  finalCTA: {
    marginHorizontal: 20,
    marginVertical: 40,
    padding: 32,
    backgroundColor: Colors.button.primary,
    borderRadius: 24,
    alignItems: 'center',
  },
  finalCTATitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textInverse,
    marginBottom: 8,
    textAlign: 'center',
  },
  finalCTASubtitle: {
    fontSize: 15,
    color: Colors.primary[50],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  finalCTAButton: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  finalCTAButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.button.primary,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});