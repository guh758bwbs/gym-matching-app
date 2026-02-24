import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function ReviewScreen({ route, navigation }) {
  const { partnerId, partnerName, currentUserId } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  async function handleSubmitReview() {
    if (rating === 0) {
      Alert.alert('入力エラー', '評価（星の数）を選択してください');
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        reviewerId: currentUserId,
        revieweeId: partnerId,
        rating: rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        '✅ レビュー送信完了',
        `${partnerName}さんへのレビューを送信しました！`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('レビュー送信エラー:', error);
      Alert.alert('エラー', 'レビューの送信に失敗しました');
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⭐ トレーニングレビュー</Text>
        <Text style={styles.subtitle}>{partnerName}さんを評価</Text>
      </View>

      {/* 星評価 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>評価を選択してください</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Text style={styles.starText}>
                {star <= rating ? '⭐' : '☆'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingText}>
          {rating === 0 && '評価を選択してください'}
          {rating === 1 && '😞 改善が必要'}
          {rating === 2 && '😐 普通'}
          {rating === 3 && '🙂 良い'}
          {rating === 4 && '😊 とても良い'}
          {rating === 5 && '🤩 最高！'}
        </Text>
      </View>

      {/* コメント */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>コメント（任意）</Text>
        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="トレーニングの感想を書いてください..."
          multiline
          numberOfLines={6}
          maxLength={500}
        />
        <Text style={styles.charCount}>{comment.length}/500文字</Text>
      </View>

      {/* 送信ボタン */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          rating === 0 && styles.submitButtonDisabled
        ]}
        onPress={handleSubmitReview}
        disabled={rating === 0}
      >
        <Text style={styles.submitButtonText}>レビューを送信</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  starButton: {
    padding: 5,
  },
  starText: {
    fontSize: 48,
  },
  ratingText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  charCount: {
    marginTop: 5,
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  submitButton: {
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
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 30,
  },
});