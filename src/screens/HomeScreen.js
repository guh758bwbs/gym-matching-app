import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator,Alert
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { calcMatchScore } from '../utils/matchScore';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import NotificationBadge from '../components/NotificationBadge';

export default function HomeScreen({ route,navigation }) {
  const { userId } = route.params;
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadChats, setUnreadChats] = useState(0);
  const [pendingSchedules, setPendingSchedules] = useState(0);

  useEffect(() => {
    loadMatches();
    loadNotifications();
  }, []);

  async function loadMatches() {
    try {
      // ログイン中のユーザー情報を取得
      const myDoc = await getDoc(doc(db, 'users', userId));
      
      if (!myDoc.exists()) {
        setLoading(false);
        return;
      }
      
      const me = { id: myDoc.id, ...myDoc.data() };
      setCurrentUser(me);

      // 全ユーザーを取得
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const allUsers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 自分と逆の役割のユーザーを抽出
      const oppositeRole = me.role === 'learner' ? 'trainer' : 'learner';
      const candidates = allUsers.filter(user => 
        user.role === oppositeRole && user.id !== me.id
      );

      if (candidates.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      // 相性スコアを計算
      const matchesWithScore = candidates.map(user => {
        const { score, rank, details } = calcMatchScore(
          me.role === 'learner' ? user : me,
          me.role === 'learner' ? me : user
        );
        return { ...user, score, rank, details };
      });

      // スコア順に並び替え
      matchesWithScore.sort((a, b) => b.score - a.score);
      
      setMatches(matchesWithScore);
      setLoading(false);
    } catch (error) {
      console.error('データ取得エラー:', error);
      setLoading(false);
    }
  }

  async function loadNotifications() {
    try {
      // チャット未読数を取得（簡易版：すべてのチャット数）
      const chatsSnapshot = await getDocs(collection(db, 'chats'));
      setUnreadChats(chatsSnapshot.size);

      // スケジュールリクエスト数を取得
      const schedulesSnapshot = await getDocs(
        query(
          collection(db, 'schedules'),
          where('partnerId', '==', userId),
          where('status', '==', 'pending')
        )
      );
      setPendingSchedules(schedulesSnapshot.size);
    } catch (error) {
      console.error('通知取得エラー:', error);
    }
  }

async function handleLogout() {
  try {
    await signOut(auth);
    Alert.alert('ログアウト', 'ログアウトしました', [
      { text: 'OK', onPress: () => navigation.replace('Login') }
    ]);
  } catch (error) {
    console.error('ログアウトエラー:', error);
    Alert.alert('エラー', 'ログアウトに失敗しました');
  }
}


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>まだマッチングデータがありません</Text>
        <Text style={styles.emptySubtitle}>
          {currentUser?.role === 'learner' 
            ? 'トレーナーの登録をお待ちください' 
            : '教わる側の登録をお待ちください'}
        </Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadMatches}
        >
          <Text style={styles.refreshButtonText}>更新する</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>おすすめのパートナー</Text>
        <View style={styles.notificationRow}>
          <View style={styles.notificationItem}>
            <Text style={styles.notificationLabel}>💬 未読チャット</Text>
            <View style={styles.notificationBadgeContainer}>
              <NotificationBadge count={unreadChats} />
            </View>
          </View>
          
          <View style={styles.notificationItem}>
            <Text style={styles.notificationLabel}>📅 リクエスト</Text>
            <View style={styles.notificationBadgeContainer}>
              <NotificationBadge count={pendingSchedules} />
            </View>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          あなたは{currentUser?.role === 'learner' ? '教わる側' : '教える側'}です
        </Text>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>ログアウト</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => navigation.navigate('ProfileEdit', { userId })}
        >
          <Text style={styles.editButtonText}>プロフィール編集</Text>
        </TouchableOpacity>

      </View>

      <FlatList
        data={matches}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProfileDetail', { user: item, currentUserId: userId })}
          >
            <View style={styles.cardHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {item.name?.charAt(0) || '?'}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardGym}>📍 {item.gym}</Text>
                <Text style={styles.cardAge}>年齢: {item.age}歳</Text>
              </View>
            </View>

            <View style={styles.scoreSection}>
              <Text style={styles.rank}>{item.rank}</Text>
              <Text style={styles.score}>スコア: {item.score}点</Text>
            </View>

            <View style={styles.detailsSection}>
              {item.role === 'trainer' && (
                <Text style={styles.detailText}>
                  得意: {item.specialties?.join(', ')}
                </Text>
              )}
              {item.role === 'learner' && (
                <Text style={styles.detailText}>
                  目標: {item.goals?.join(', ')}
                </Text>
              )}
              <Text style={styles.detailText}>
                空き: {item.availableDays?.join(', ')} / {item.availableTime}
              </Text>
            </View>

            <View style={styles.matchDetails}>
              {item.details?.map((detail, index) => (
                <Text key={index} style={styles.matchDetailText}>
                  • {detail}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#e94560',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSection: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardInfo: {
    marginLeft: 12,
    justifyContent: 'center',
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardGym: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardAge: {
    fontSize: 14,
    color: '#666',
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e94560',
  },
  detailsSection: {
    marginTop: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  matchDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  matchDetailText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  logoutButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f44336',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  editButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2196f3',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  notificationRow: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 10,
    gap: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  notificationLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  notificationBadgeContainer: {
    position: 'relative',
    width: 24,
    height: 24,
  },
});