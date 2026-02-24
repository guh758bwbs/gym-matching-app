import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function ScheduleScreen({ route, navigation }) {
  const { partnerId, partnerName, currentUserId } = route.params;
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00',
    '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00'
  ];

  async function handleRequestSchedule() {
    if (!selectedDate || !selectedTime) {
      Alert.alert('入力エラー', '日付と時間を選択してください');
      return;
    }

    try {
      await addDoc(collection(db, 'schedules'), {
        requesterId: currentUserId,
        partnerId: partnerId,
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        '✅ リクエスト送信完了',
        `${partnerName}さんに\n${selectedDate} ${selectedTime}\nのトレーニングをリクエストしました！`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('スケジュール保存エラー:', error);
      Alert.alert('エラー', 'スケジュールの送信に失敗しました');
    }
  }

  // 今日以降の日付のみ選択可能
  const today = new Date().toISOString().split('T')[0];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 トレーニング日時を選択</Text>
        <Text style={styles.subtitle}>{partnerName}さんとの予定</Text>
      </View>

      {/* カレンダー */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>日付を選択</Text>
        <Calendar
          onDayPress={day => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: '#e94560',
            }
          }}
          minDate={today}
          theme={{
            selectedDayBackgroundColor: '#e94560',
            todayTextColor: '#e94560',
            arrowColor: '#e94560',
          }}
        />
        {selectedDate && (
          <Text style={styles.selectedText}>
            選択中: {selectedDate}
          </Text>
        )}
      </View>

      {/* 時間選択 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>時間を選択</Text>
        <View style={styles.timeGrid}>
          {timeSlots.map(time => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                selectedTime === time && styles.timeSlotSelected
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[
                styles.timeText,
                selectedTime === time && styles.timeTextSelected
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 確認エリア */}
      {selectedDate && selectedTime && (
        <View style={styles.confirmSection}>
          <Text style={styles.confirmTitle}>選択内容</Text>
          <Text style={styles.confirmText}>
            📅 {selectedDate} ({getDayOfWeek(selectedDate)})
          </Text>
          <Text style={styles.confirmText}>
            🕐 {selectedTime}
          </Text>
          <Text style={styles.confirmText}>
            👤 {partnerName}さん
          </Text>
        </View>
      )}

      {/* リクエストボタン */}
      <TouchableOpacity
        style={[
          styles.requestButton,
          (!selectedDate || !selectedTime) && styles.requestButtonDisabled
        ]}
        onPress={handleRequestSchedule}
        disabled={!selectedDate || !selectedTime}
      >
        <Text style={styles.requestButtonText}>
          リクエストを送信
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

// 曜日を取得する関数
function getDayOfWeek(dateString) {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const date = new Date(dateString);
  return days[date.getDay()] + '曜日';
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
    fontSize: 22,
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
  selectedText: {
    marginTop: 15,
    fontSize: 16,
    color: '#e94560',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    width: '30%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  timeSlotSelected: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  timeTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  confirmSection: {
    backgroundColor: '#fff3cd',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  requestButton: {
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
  requestButtonDisabled: {
    backgroundColor: '#ccc',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 30,
  },
});