import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';

export default function ProfileDetailScreen({ route, navigation }) {
  const { user, currentUserId } = route.params; 

  function handleMatchRequest() {
    Alert.alert(
      'マッチングリクエスト',
      `${user.name}さんにリクエストを送信しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '送信',
          onPress: () => {
            Alert.alert('送信完了', 'リクエストを送信しました！');
            navigation.goBack();
          }
        }
      ]
    );
  }

  function handleChat() {
    navigation.navigate('Chat', {
      chatPartnerId: user.id,
      chatPartnerName: user.name,
      currentUserId: currentUserId
    });
  }

  function handleSchedule() {
    navigation.navigate('Schedule', {
      partnerId: user.id,
      partnerName: user.name,
      currentUserId: currentUserId
    });
  }

  function handleReview() {
    navigation.navigate('Review', {
      partnerId: user.id,
      partnerName: user.name,
      currentUserId: currentUserId
    });
  }

  return (
    <ScrollView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>
            {user.name?.charAt(0) || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.age}>{user.age}歳</Text>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{user.rank}</Text>
        </View>
        <Text style={styles.scoreText}>相性スコア: {user.score}点</Text>
      </View>

      {/* 基本情報 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基本情報</Text>
        <InfoRow label="利用ジム" value={user.gym} />
        <InfoRow label="役割" value={user.role === 'trainer' ? 'トレーナー' : 'ビギナー'} />
        {user.bio && <InfoRow label="自己紹介" value={user.bio} />}
      </View>

      {/* トレーナー情報 */}
      {user.role === 'trainer' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>トレーナー情報</Text>
          <InfoRow label="得意種目" value={user.specialties?.join(', ')} />
          {user.experience && (
            <InfoRow label="指導経験" value={`${user.experience}年`} />
          )}
        </View>
      )}

      {/* ビギナー情報 */}
      {user.role === 'learner' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>トレーニング情報</Text>
          <InfoRow label="目標" value={user.goals?.join(', ')} />
          <InfoRow label="鍛えたい部位" value={user.targetMuscles?.join(', ')} />
          {user.level && <InfoRow label="レベル" value={user.level} />}
        </View>
      )}

      {/* スケジュール */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>スケジュール</Text>
        <InfoRow label="空き曜日" value={user.availableDays?.join(', ')} />
        <InfoRow label="空き時間" value={user.availableTime} />
      </View>

      {/* 相性の詳細 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>相性の詳細</Text>
        {user.details?.map((detail, index) => (
          <View key={index} style={styles.detailItem}>
            <Text style={styles.detailBullet}>✓</Text>
            <Text style={styles.detailText}>{detail}</Text>
          </View>
        ))}
      </View>

      {/* マッチングボタン */}
      <TouchableOpacity style={styles.matchButton} onPress={handleMatchRequest}>
        <Text style={styles.matchButtonText}>マッチングをリクエスト</Text>
      </TouchableOpacity>

      {/* チャットボタン */}
      <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
        <Text style={styles.chatButtonText}>💬 チャットを始める</Text>
      </TouchableOpacity>

      {/* スケジュール調整ボタン */}
      <TouchableOpacity style={styles.scheduleButton} onPress={handleSchedule}>
        <Text style={styles.scheduleButtonText}>📅 トレーニング日時を調整</Text>
      </TouchableOpacity>

      {/* レビューボタン */}
      <TouchableOpacity style={styles.reviewButton} onPress={handleReview}>
        <Text style={styles.reviewButtonText}>⭐ レビューを書く</Text>
      </TouchableOpacity>


    <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarTextLarge: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  age: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  rankBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e94560',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    width: 100,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailBullet: {
    fontSize: 16,
    color: '#4caf50',
    marginRight: 8,
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  matchButton: {
    backgroundColor: '#e94560',
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  matchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatButton: {
    backgroundColor: '#4caf50',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scheduleButton: {
    backgroundColor: '#2196f3',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewButton: {
    backgroundColor: '#ff9800',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 30,
  },
});