import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, Image, StatusBar, RefreshControl, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const COLORS = {
  darkBlue: "#003366",
  lightBlue: "#7AB3D1",
  accent: "#4A90E2",
  yellow: "#FFF7A3",
  green: "#E6FFE6",
  orange: "#FFEBCD",
  red: "#FFE4E1",
  gray: "#F5F5F5",
  textDark: "#333333",
  textLight: "#666666",
  primary: "#4A90E2",
  secondary: "#E8F4FD",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  cardBg: "#FFFFFF",
  shadow: "rgba(0, 0, 0, 0.08)",
  cream: "#F5F5DC",
  darkGray: "#666666",
  lightGray: "#CCCCCC",
  placeholder: "#999999",
};

const CommentsScreen = () => {
  const navigation = useNavigation();
  const [comments, setComments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    }
  };

  const fetchComments = async () => {
  try {
    const accountId = await AsyncStorage.getItem("accountId");
    if (!accountId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const response = await fetch(`https://5f82-2806-265-5402-ca4-4856-b42f-7290-c370.ngrok-free.app/comments/${accountId}`);
    const data = await response.json();

    if (data.success && data.comments) {
    
      console.log("Datos de comentarios recibidos:", data.comments);
      if (data.comments.length > 0) {
        console.log("Primer comentario:", data.comments[0]);
        console.log("Campos de fecha disponibles:", {
          dateCreated: data.comments[0].dateCreated,
          created_at: data.comments[0].created_at,
          date: data.comments[0].date,
          timestamp: data.comments[0].timestamp,
          allKeys: Object.keys(data.comments[0])
        });
      }
      
      setComments(data.comments || []);
    } else {
      setComments([]);
    }
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    setComments([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const submitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert("Error", "Por favor escribe un comentario");
      return;
    }

    setIsSubmitting(true);
    try {
      const accountId = await AsyncStorage.getItem("accountId");
      if (!accountId) {
        Alert.alert("Error", "No se pudo obtener la información de la cuenta");
        return;
      }

      const response = await fetch('https://5f82-2806-265-5402-ca4-4856-b42f-7290-c370.ngrok-free.app/createComment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titleComment: "Comentario de usuario",
          descriptionComment: commentText.trim(),
          accountId: accountId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCommentText('');
        Toast.show({
          type: 'success',
          text1: "¡Comentario enviado!",
          text2: "Gracias por tu opinión",
          visibilityTime: 3000,
        });
        fetchComments(); 
      } else {
        Alert.alert("Error", data.message || "No se pudo enviar el comentario");
      }
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      Alert.alert("Error", "No se pudo enviar el comentario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const renderCommentItem = ({ item, index }) => {
    return (
      <View style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={require("../assets/profile.png")} 
              style={styles.avatar}
            />
          </View>
          <View style={styles.commentContent}>
            <Text style={styles.timeText}>{formatTimeAgo(item.dateCreated || item.created_at)}</Text>
            <Text style={styles.commentText}>{item.descriptionComment || item.description}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCommentInput = () => (
    <View style={styles.inputCard}>
      <View style={styles.inputHeader}>
        <View style={styles.avatarContainer}>
          <Image 
            source={require("../assets/profile.png")} 
            style={styles.avatar}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Deja tu comentario sobre la aplicación..."
            placeholderTextColor={COLORS.placeholder}
            value={commentText}
            onChangeText={setCommentText}
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
          />
          <TouchableOpacity 
            style={[styles.submitButton, { opacity: commentText.trim() ? 1 : 0.5 }]}
            onPress={submitComment}
            disabled={isSubmitting || !commentText.trim()}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Enviando..." : "Enviar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Sin comentarios</Text>
      <Text style={styles.emptySubtitle}>
        Sé el primero en compartir tu opinión{'\n'}
        sobre nuestra aplicación
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cream} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require("../assets/back-arrow.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comentarios</Text>
        <View style={styles.emptySpace} />
      </View>

      <KeyboardAvoidingView 
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderCommentInput()}
          
          {comments.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
              renderItem={renderCommentItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.bottomNavItem} 
          onPress={() => navigation.navigate("Home")}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Image
              source={require("../assets/home.png")}
              style={styles.navIcon}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("EventScreen")}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Image source={require("../assets/more.png")} style={styles.navIcon} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Image source={require("../assets/profile.png")} style={styles.navIcon} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.cream,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  emptySpace: {
    width: 36,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    flexGrow: 1,
  },
  inputCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 24,
    height: 24,
    tintColor: COLORS.darkGray,
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.textDark,
    backgroundColor: "#FAFAFA",
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: '600',
  },
  commentCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentContent: {
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIcon: {
    width: 40,
    height: 40,
    tintColor: COLORS.primary,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomNav: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    paddingVertical: 9, 
    borderTopWidth: 3, 
    borderColor: "#ddd", 
    backgroundColor: "#fcfbf8",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  bottomNavItem: { 
    alignItems: "center",
    padding: 8,
    flex: 1,
  },
  navIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 32, 
    width: 32,  
  },
  navIcon: { 
    width: 25, 
    height: 25,
    tintColor: COLORS.darkGray,
  },
  activeNavItem: { 
    borderBottomWidth: 2, 
    borderColor: '#f0e342',
  }
});

export default CommentsScreen;