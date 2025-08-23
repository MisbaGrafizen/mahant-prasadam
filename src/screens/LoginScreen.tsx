import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ImageBackground,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import loginbg from '../../src/assets/images/loginbackground.png'

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  navigation?: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [usernameFocused, setUsernameFocused] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);

const handleLogin = (): void => {
  if (!username.trim()) {
    Alert.alert('Error', 'Please enter your username');
    return;
  }
  if (!password.trim()) {
    Alert.alert('Error', 'Please enter your password');
    return;
  }

  // Simulate login process
  Alert.alert(
    'Login Successful',
    `Welcome ${username}!`,
    [
      {
        text: 'Continue',
        onPress: () => {
          console.log('Login successful:', { username, rememberMe });

        navigation.reset({
  index: 0,
  routes: [{ name: 'Parasad' }],
});
        
        }
      }
    ]
  );
};


  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  const toggleRememberMe = (): void => {
    setRememberMe(!rememberMe);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Background Image with Overlay */}
          {/* <ImageBackground
            source={loginbg}
            style={styles.backgroundImage}
            resizeMode="contain"
          > */}
            {/* Black Gradient Overlay */}
            {/* <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', '#000000']}
              locations={[0, 0.4, 0.7, 1]}
              style={styles.gradientOverlay}
            > */}
              {/* Profile Name */}


              <Image source={loginbg} style={styles.image} resizeMode='contain' />
              <View style={styles.profileNameContainer}>
                <Text style={styles.profileName}>Mahant Prasadam</Text>
              </View>

              {/* Login Form */}
              <View style={styles.loginFormContainer}>
                <View style={styles.loginForm}>
                  {/* Username Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.textInput,
                        usernameFocused && styles.textInputFocused
                      ]}
                      placeholder="ENTER YOUR USERNAME"
                      placeholderTextColor="#999999"
                      value={username}
                      onChangeText={setUsername}
                      onFocus={() => setUsernameFocused(true)}
                      onBlur={() => setUsernameFocused(false)}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <View style={[
                      styles.inputUnderline,
                      usernameFocused && styles.inputUnderlineFocused
                    ]} />
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[
                          styles.textInput,
                          styles.passwordInput,
                          passwordFocused && styles.textInputFocused
                        ]}
                        placeholder="ENTER YOUR PASSWORD"
                        placeholderTextColor="#999999"
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={togglePasswordVisibility}
                        activeOpacity={0.7}
                      >
                        <Icon
                          name={showPassword ? 'visibility' : 'visibility-off'}
                          size={24}
                          color="#666666"
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={[
                      styles.inputUnderline,
                      passwordFocused && styles.inputUnderlineFocused
                    ]} />
                  </View>

                  {/* Remember Me Checkbox */}
                  <TouchableOpacity
                    style={styles.rememberMeContainer}
                    onPress={toggleRememberMe}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxChecked
                    ]}>
                      {rememberMe && (
                        <Icon name="check" size={16} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.rememberMeText}>Remember Me</Text>
                  </TouchableOpacity>

                  {/* Login Button */}
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.loginButtonText}>LOGIN</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bottom Text */}
              <View style={styles.bottomTextContainer}>
                <Text style={styles.bottomText}>BAPS Swaminarayan Mandir Rajkot</Text>
              </View>
            {/* </LinearGradient>
          </ImageBackground> */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2f2f2f',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backgroundImage: {
    width: width,
    height: height,
    flex: 1,
  },
  image:{
width: '100%',
// height: 400,
objectFit: 'contain',
  },

  gradientOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  profileNameContainer: {
    alignItems: 'center',
    marginTop: height * 0.45, // Position name over the image
  },
  profileName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loginFormContainer: {
width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
position: 'absolute', bottom: "30%"
  },
  loginForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  inputContainer: {
    marginBottom: 10,
    width: '90%',
    marginHorizontal: "auto",

  },
  textInput: {
    fontSize: 16,
    color: '#333333',
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  textInputFocused: {
    color: '#000000',
  },
  inputUnderline: {
    height: 2,
    backgroundColor: '#CCCCCC',
    marginTop: 5,
  },
  inputUnderlineFocused: {
    backgroundColor: '#2563eb',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    padding: 10,
    marginLeft: 10,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 13,
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 3,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  rememberMeText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loginButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  bottomTextContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  bottomText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 1,
  },
});

export default LoginScreen;