// Profile screen: user info and sign-out
import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Avatar, Button, List, Divider, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser, useClerk } from '@clerk/expo';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const theme = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      await user.reload();
    } catch (err) {
      console.error('Failed to reload user:', err);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  const initial = user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || '?';
  const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User';
  const email = user?.emailAddresses?.[0]?.emailAddress;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#E50914']} 
            tintColor="#E50914"
            progressBackgroundColor="#1C1C1C"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Profile</Text>
          <Text variant="bodySmall" style={styles.pageSubtitle}>Manage your account and preferences</Text>
        </View>

        {/* Avatar card */}
        <View style={styles.avatarSection}>
          <Avatar.Text
            size={80}
            label={initial}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          <Text variant="headlineSmall" style={styles.name}>{fullName}</Text>
          <Text variant="bodyMedium" style={styles.email}>{email}</Text>
        </View>

        {/* Account details */}
        <Surface style={styles.card} elevation={1}>
          <List.Subheader style={styles.subheader}>Account</List.Subheader>
          <List.Item
            title="Full Name"
            description={fullName}
            left={(props) => <List.Icon {...props} icon="account-outline" color={theme.colors.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Email"
            description={email || '—'}
            left={(props) => <List.Icon {...props} icon="email-outline" color={theme.colors.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Account Status"
            description="Active"
            left={(props) => <List.Icon {...props} icon="shield-check-outline" color="#22c55e" />}
            titleStyle={styles.listTitle}
            descriptionStyle={[styles.listDesc, { color: '#22c55e' }]}
          />
        </Surface>

        {/* App info */}
        <Surface style={[styles.card, { marginTop: 12 }]} elevation={1}>
          <List.Subheader style={styles.subheader}>Application</List.Subheader>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information-outline" color={theme.colors.onSurfaceVariant} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDesc}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="file-document-outline" color={theme.colors.onSurfaceVariant} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            titleStyle={styles.listTitle}
          />
        </Surface>

        {/* Sign out */}
        <View style={styles.signOutSection}>
          <Button
            mode="outlined"
            onPress={() => signOut()}
            icon="logout"
            style={styles.signOutButton}
            contentStyle={styles.signOutContent}
            labelStyle={styles.signOutLabel}
            textColor="#E50914"
          >
            Sign Out
          </Button>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#F5F5F5' },
  pageSubtitle: { color: '#666', marginTop: 2 },

  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: { backgroundColor: '#E50914', marginBottom: 12 },
  avatarLabel: { fontSize: 32, fontWeight: '800' },
  name: { color: '#F5F5F5', fontWeight: '700', marginBottom: 4 },
  email: { color: '#666' },

  card: { marginHorizontal: 16, borderRadius: 12, backgroundColor: '#1C1C1C', overflow: 'hidden' },
  subheader: { color: '#666', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', paddingTop: 12 },
  listTitle: { color: '#E0E0E0', fontSize: 14 },
  listDesc: { color: '#666', fontSize: 13 },
  divider: { backgroundColor: '#2A2A2A', marginLeft: 56 },

  signOutSection: { paddingHorizontal: 16, marginTop: 24 },
  signOutButton: { borderRadius: 10, borderColor: '#E50914' },
  signOutContent: { paddingVertical: 4 },
  signOutLabel: { fontSize: 15, fontWeight: '600' },
});
