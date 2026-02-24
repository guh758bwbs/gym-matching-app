import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // true: ログイン, false: 新規登録

  useEffect(() => {
    // ログイン状態を監視
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('ログイン済み:', user.email);
        
        // プロフィールが登録済みかチェック
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          navigation.replace('Home', { userId: user.uid });
        } else {
          navigation.replace('ProfileSetup', { userId: user.uid });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('ログイン成功:', user.email);

      // プロフィール確認
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        navigation.replace('Home', { userId: user.uid });
      } else {
        navigation.replace('ProfileSetup', { userId: user.uid });
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      
      if (error.code === 'auth/invalid-credential') {
        Alert.alert('エラー', 'メールアドレスまたはパスワードが間違っています');
      } else if (error.code === 'auth/user-not-found') {
        Alert.alert('エラー', 'このメールアドレスは登録されていません');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('エラー', 'パスワードが間違っています');
      } else {
        Alert.alert('エラー', 'ログインに失敗しました: ' + error.message);
      }
    }
  }

  async function handleSignup() {
    if (!email || !password) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    if (password.length < 6) {
      Alert.alert('入力エラー', 'パスワードは6文字以上にしてください');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('新規登録成功:', user.email);
      Alert.alert('登録完了', 'アカウントを作成しました！\nプロフィールを設定してください');
      
      navigation.replace('ProfileSetup', { userId: user.uid });
    } catch (error) {
      console.error('新規登録エラー:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('エラー', 'このメールアドレスは既に登録されています');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('エラー', 'メールアドレスの形式が正しくありません');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('エラー', 'パスワードが弱すぎます。6文字以上にしてください');
      } else {
        Alert.alert('エラー', '新規登録に失敗しました: ' + error.message);
      }
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>💪 GymMatch</Text>
      <Text style={styles.subtitle}>理想のトレーニングパートナーを見つけよう</Text>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>
          {isLogin ? 'ログイン' : '新規登録'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="パスワード（6文字以上）"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={isLogin ? handleLogin : handleSignup}
        >
          <Text style={styles.loginButtonText}>
            {isLogin ? 'ログイン' : '新規登録'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchButtonText}>
            {isLogin ? 'アカウントを作成する' : 'ログインに戻る'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 40,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#1a5490',
  },
  loginButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
  },
  switchButtonText: {
    color: '#64b5f6',
    fontSize: 16,
    textAlign: 'center',
  },
});