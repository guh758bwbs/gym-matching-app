import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function ProfileEditScreen({ route, navigation }) {
  const { userId } = route.params;
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState('');
  const [gym, setGym] = useState('');
  const [bio, setBio] = useState('');
  
  // トレーナー用
  const [specialties, setSpecialties] = useState([]);
  const [experience, setExperience] = useState('');
  
  // 教わる側用
  const [goals, setGoals] = useState([]);
  const [targetMuscles, setTargetMuscles] = useState([]);
  const [level, setLevel] = useState('');
  
  // 共通
  const [availableDays, setAvailableDays] = useState([]);
  const [availableTime, setAvailableTime] = useState('');

  // 選択肢
  const muscleOptions = ['胸', '背中', '脚', '肩', '腕', '腹筋'];
  const goalOptions = ['増量', '減量', '筋力アップ', '健康維持', '体型改善'];
  const dayOptions = ['月', '火', '水', '木', '金', '土', '日'];
  const timeOptions = ['朝（6〜9時）', '昼（12〜15時）', '夕方（17〜20時）', '夜（20〜22時）'];
  const levelOptions = ['初心者', '中級者', '上級者'];

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setName(data.name || '');
        setAge(data.age?.toString() || '');
        setRole(data.role || '');
        setGym(data.gym || '');
        setBio(data.bio || '');
        setAvailableDays(data.availableDays || []);
        setAvailableTime(data.availableTime || '');
        
        if (data.role === 'trainer') {
          setSpecialties(data.specialties || []);
          setExperience(data.experience?.toString() || '');
        } else {
          setGoals(data.goals || []);
          setTargetMuscles(data.targetMuscles || []);
          setLevel(data.level || '');
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('プロフィール読み込みエラー:', error);
      setLoading(false);
    }
  }

  function toggleSelection(item, list, setList) {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  }

  async function handleSave() {
    if (!name || !age || !gym) {
      Alert.alert('入力エラー', '必須項目を入力してください');
      return;
    }

    if (role === 'trainer' && specialties.length === 0) {
      Alert.alert('入力エラー', '得意種目を1つ以上選択してください');
      return;
    }

    if (role === 'learner' && (goals.length === 0 || targetMuscles.length === 0)) {
      Alert.alert('入力エラー', '目標と鍛えたい部位を選択してください');
      return;
    }

    try {
      const userData = {
        name,
        age: parseInt(age),
        gym,
        bio,
        availableDays,
        availableTime,
      };

      if (role === 'trainer') {
        userData.specialties = specialties;
        userData.experience = experience ? parseInt(experience) : 0;
      } else {
        userData.goals = goals;
        userData.targetMuscles = targetMuscles;
        userData.level = level;
      }

      await updateDoc(doc(db, 'users', userId), userData);

      Alert.alert('更新完了', 'プロフィールを更新しました！', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('更新エラー:', error);
      Alert.alert('エラー', 'プロフィールの更新に失敗しました');
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>プロフィール編集</Text>

      {/* 基本情報 */}
      <View style={styles.section}>
        <Text style={styles.label}>名前 *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="田中太郎"
        />

        <Text style={styles.label}>年齢 *</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="28"
          keyboardType="number-pad"
        />

        <Text style={styles.label}>利用するジム *</Text>
        <TextInput
          style={styles.input}
          value={gym}
          onChangeText={setGym}
          placeholder="渋谷フィットネス"
        />

        <Text style={styles.label}>自己紹介</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder="一言自己紹介..."
          multiline
          numberOfLines={3}
        />
      </View>

      {/* 役割表示（変更不可） */}
      <View style={styles.section}>
        <Text style={styles.label}>役割（変更不可）</Text>
        <View style={styles.roleDisplay}>
          <Text style={styles.roleText}>
            {role === 'trainer' ? '教える側（トレーナー）' : '教わる側（ビギナー）'}
          </Text>
        </View>
      </View>

      {/* トレーナー用設定 */}
      {role === 'trainer' && (
        <View style={styles.section}>
          <Text style={styles.label}>得意種目 *</Text>
          <View style={styles.optionGrid}>
            {muscleOptions.map(muscle => (
              <TouchableOpacity
                key={muscle}
                style={[
                  styles.optionButton,
                  specialties.includes(muscle) && styles.optionButtonActive
                ]}
                onPress={() => toggleSelection(muscle, specialties, setSpecialties)}
              >
                <Text style={[
                  styles.optionText,
                  specialties.includes(muscle) && styles.optionTextActive
                ]}>
                  {muscle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>指導経験（年数）</Text>
          <TextInput
            style={styles.input}
            value={experience}
            onChangeText={setExperience}
            placeholder="3"
            keyboardType="number-pad"
          />
        </View>
      )}

      {/* 教わる側用設定 */}
      {role === 'learner' && (
        <View style={styles.section}>
          <Text style={styles.label}>目標 *</Text>
          <View style={styles.optionGrid}>
            {goalOptions.map(goal => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.optionButton,
                  goals.includes(goal) && styles.optionButtonActive
                ]}
                onPress={() => toggleSelection(goal, goals, setGoals)}
              >
                <Text style={[
                  styles.optionText,
                  goals.includes(goal) && styles.optionTextActive
                ]}>
                  {goal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>鍛えたい部位 *</Text>
          <View style={styles.optionGrid}>
            {muscleOptions.map(muscle => (
              <TouchableOpacity
                key={muscle}
                style={[
                  styles.optionButton,
                  targetMuscles.includes(muscle) && styles.optionButtonActive
                ]}
                onPress={() => toggleSelection(muscle, targetMuscles, setTargetMuscles)}
              >
                <Text style={[
                  styles.optionText,
                  targetMuscles.includes(muscle) && styles.optionTextActive
                ]}>
                  {muscle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>レベル</Text>
          <View style={styles.optionGrid}>
            {levelOptions.map(lv => (
              <TouchableOpacity
                key={lv}
                style={[
                  styles.optionButton,
                  level === lv && styles.optionButtonActive
                ]}
                onPress={() => setLevel(lv)}
              >
                <Text style={[
                  styles.optionText,
                  level === lv && styles.optionTextActive
                ]}>
                  {lv}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 空き時間 */}
      <View style={styles.section}>
        <Text style={styles.label}>空いている曜日</Text>
        <View style={styles.optionGrid}>
          {dayOptions.map(day => (
            <TouchableOpacity
              key={day}
              style={[
                styles.optionButton,
                availableDays.includes(day) && styles.optionButtonActive
              ]}
              onPress={() => toggleSelection(day, availableDays, setAvailableDays)}
            >
              <Text style={[
                styles.optionText,
                availableDays.includes(day) && styles.optionTextActive
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>空いている時間帯</Text>
        <View style={styles.optionGrid}>
          {timeOptions.map(time => (
            <TouchableOpacity
              key={time}
              style={[
                styles.optionButton,
                availableTime === time && styles.optionButtonActive
              ]}
              onPress={() => setAvailableTime(time)}
            >
              <Text style={[
                styles.optionText,
                availableTime === time && styles.optionTextActive
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 保存ボタン */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>保存する</Text>
      </TouchableOpacity>
    </ScrollView>
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  roleDisplay: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  roleText: {
    fontSize: 16,
    color: '#666',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  optionButtonActive: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#e94560',
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});