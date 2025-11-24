/**
 * commentsScreen.js con Modo Oscuro
 * Autor: Danna Cahelca Padilla Nuñez, Jesus Javier Rojo Martinez
 * Fecha: 09/06/2025
 */
import { useEffect, useState } from "react"
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, Image, StatusBar, RefreshControl, TextInput, Modal, KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import Toast from "react-native-toast-message"
import { fetchComments, createComment, formatDateTime } from "../components/comments"
import { useAppTheme } from '../hooks/useThemeApp'

const CommentsScreen = () => {
  const navigation = useNavigation()
  const { colors, isDark } = useAppTheme()
  
  const [comments, setComments] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [accountId, setAccountId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "error", 
    onConfirm: null,
    onCancel: null,
    showCancel: false,
    confirmText: "Aceptar",
    cancelText: "Cancelar",
  })

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)
      await Promise.all([loadComments(), getCurrentUser()])
      setIsLoading(false)
    }

    initialize()
  }, [])

  const showCustomModal = (title, message, type = "error", options = {}) => {
    setModalConfig({
      title,
      message,
      type,
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
      showCancel: options.showCancel || false,
      confirmText: options.confirmText || "Aceptar",
      cancelText: options.cancelText || "Cancelar",
    })
    setShowModal(true)
  }

  const hideModal = () => {
    setShowModal(false)
    setModalConfig({
      title: "",
      message: "",
      type: "error",
      onConfirm: null,
      onCancel: null,
      showCancel: false,
      confirmText: "Aceptar",
      cancelText: "Cancelar",
    })
  }

  const handleModalConfirm = () => {
    if (modalConfig.onConfirm) {
      modalConfig.onConfirm()
    }
    hideModal()
  }

  const handleModalCancel = () => {
    if (modalConfig.onCancel) {
      modalConfig.onCancel()
    }
    hideModal()
  }

  const getCurrentUser = async () => {
    try {
      console.log("Intentando obtener datos de usuario...")

      let id = await AsyncStorage.getItem("accountId")
      if (!id) {
        id = await AsyncStorage.getItem("idAccount")
      }

      const userData = await AsyncStorage.getItem("nameUser")
      let userName = null

      if (userData) {
        try {
          const parsedData = JSON.parse(userData)
          userName = parsedData.name || parsedData.nameUser

          if (parsedData.idAccount && !id) {
            id = parsedData.idAccount
          }
        } catch (e) {
          userName = userData
        }
      }

      const userDataComplete = await AsyncStorage.getItem("userData")
      if (userDataComplete) {
        try {
          const parsedUserData = JSON.parse(userDataComplete)
          if (!id && parsedUserData.idAccount) {
            id = parsedUserData.idAccount
          }
          if (!userName && parsedUserData.name) {
            userName = parsedUserData.name
          }

          setCurrentUser(parsedUserData)
        } catch (e) {
          console.error("Error parsing userData:", e)
        }
      }

      if (id && !currentUser) {
        setCurrentUser({
          idAccount: id,
          name: userName || "Usuario",
        })
      }

      if (id) {
        console.log("ID de cuenta encontrado:", id)
        setAccountId(id)
      } else {
        console.warn("No se encontró ID de cuenta en AsyncStorage")
      }

      console.log("Datos de usuario recuperados:", { id, userName })
    } catch (error) {
      console.error("Error getting current user:", error)
    }
  }

  const loadComments = async () => {
    try {
      const result = await fetchComments()
      setComments(result.comments)
    } catch (error) {
      console.error("Error loading comments:", error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los comentarios",
      })
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadComments()
    await getCurrentUser()
    setRefreshing(false)
  }

  const submitComment = async () => {
    if (!commentText.trim()) {
      showCustomModal("Campo requerido", "Por favor escribe un comentario antes de enviarlo.")
      return
    }

    if (!accountId) {
      await getCurrentUser()

      if (!accountId) {
        showCustomModal(
          "Error de autenticación",
          "No se pudo verificar tu sesión. Por favor, cierra la aplicación e inicia sesión nuevamente.",
          "error",
          {
            showCancel: true,
            confirmText: "Reintentar",
            cancelText: "OK",
            onConfirm: getCurrentUser,
          },
        )
        return
      }
    }

    setIsSubmitting(true)

    try {
      const commentData = {
        titleComment: "Comentario de usuario",
        descriptionComment: commentText.trim(),
        accountId: accountId,
      }

      await createComment(commentData)
      
      setCommentText("")
      showCustomModal("Comentario enviado", "Tu comentario ha sido publicado correctamente.", "success")
      await loadComments()
    } catch (error) {
      console.error("Error submitting comment:", error)
      showCustomModal("Error al enviar", "No se pudo enviar tu comentario. Por favor, inténtalo nuevamente.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUserIdentifier = (item) => {
    return item.nameUser || "Usuario Anónimo"
  }

  const renderCommentItem = ({ item, index }) => {
    return (
      <View style={[styles.commentCard, { 
        backgroundColor: colors.cardBg,
        borderColor: colors.border
      }]}>
        <View style={styles.commentHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: isDark ? colors.inputBg : '#E0E0E0' }]}>
            <Image 
              source={require("../assets/profile.png")} 
              style={[styles.avatar, { tintColor: colors.textSecondary }]} 
            />
          </View>
          <View style={styles.commentContent}>
            <Text style={[styles.userNameText, { color: '#4A90E2' }]}>{getUserIdentifier(item)}</Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>{formatDateTime(item.dateComment)}</Text>
            <Text style={[styles.commentText, { color: colors.text }]}>{item.descriptionComment}</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderCommentInput = () => (
    <View style={[styles.inputCard, { 
      backgroundColor: colors.cardBg,
      borderColor: colors.border
    }]}>
      <View style={styles.inputHeader}>
        <View style={[styles.avatarContainer, { backgroundColor: isDark ? colors.inputBg : '#E0E0E0' }]}>
          <Image 
            source={require("../assets/profile.png")} 
            style={[styles.avatar, { tintColor: colors.textSecondary }]} 
          />
        </View>
        <View style={styles.inputContainer}>
          {isLoading ? (
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando...</Text>
          ) : accountId ? (
            <>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                placeholder="Deja tu comentario sobre la aplicación..."
                placeholderTextColor={colors.textSecondary}
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
                <Text style={styles.submitButtonText}>{isSubmitting ? "Enviando..." : "Enviar"}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={[styles.authErrorContainer, { backgroundColor: isDark ? '#4a1d1d' : '#FFE4E1' }]}>
              <Text style={[styles.authErrorText, { color: colors.text }]}>
                No se pudo verificar tu sesión. Por favor, cierra la aplicación e inicia sesión nuevamente.
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={getCurrentUser}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin comentarios</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Sé el primero en compartir tu opinión{"\n"}
        sobre nuestra aplicación
      </Text>
    </View>
  )

  const CustomModal = () => (
    <Modal visible={showModal} transparent={true} animationType="fade" onRequestClose={hideModal}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.cardBg }]}>
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor:
                  modalConfig.type === "success"
                    ? "#10B981"
                    : modalConfig.type === "warning"
                      ? "#F59E0B"
                      : modalConfig.type === "info"
                        ? "#4A90E2"
                        : "#EF4444",
              },
            ]}
          >
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
          </View>

          <View style={styles.modalBody}>
            <Text style={[styles.modalMessage, { color: colors.text }]}>{modalConfig.message}</Text>
          </View>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            {modalConfig.showCancel && (
              <TouchableOpacity 
                style={[styles.modalButtonSecondary, { 
                  backgroundColor: colors.inputBg,
                  borderRightColor: colors.border
                }]} 
                onPress={handleModalCancel} 
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonSecondaryText, { color: colors.textSecondary }]}>
                  {modalConfig.cancelText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.modalButtonPrimary, 
                { backgroundColor: colors.inputBg },
                !modalConfig.showCancel && styles.modalButtonPrimaryFull
              ]}
              onPress={handleModalConfirm}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonPrimaryText, { color: colors.text }]}>
                {modalConfig.confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        backgroundColor={colors.headerBg} 
        barStyle={isDark ? "light-content" : "dark-content"} 
      />

      <View style={[styles.header, { 
        backgroundColor: colors.black,
        borderBottomColor: colors.border
      }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.cardBg }]} 
          onPress={() => navigation.goBack()}
        >
          <Image 
            source={require("../assets/back-arrow.png")} 
            style={[styles.backIcon, { tintColor: colors.text }]} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Comentarios</Text>
        <View style={styles.emptySpace} />
      </View>

      <KeyboardAvoidingView style={styles.contentContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4A90E2"]}
              tintColor="#4A90E2"
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
              keyExtractor={(item, index) => item.idComment?.toString() || index.toString()}
              renderItem={renderCommentItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomModal />

      <View style={[styles.bottomNav, { 
        backgroundColor: colors.navBg,
        borderTopColor: colors.border
      }]}>
        <TouchableOpacity 
          style={styles.bottomNavItem} 
          onPress={() => navigation.navigate("Home")} 
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Image 
              source={require("../assets/home.png")} 
              style={[styles.navIcon, { tintColor: colors.textSecondary }]} 
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("EventScreen")}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Image 
              source={require("../assets/more.png")} 
              style={[styles.navIcon, { tintColor: colors.textSecondary }]} 
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Image 
              source={require("../assets/profile.png")} 
              style={[styles.navIcon, { tintColor: colors.textSecondary }]} 
            />
          </View>
        </TouchableOpacity>
      </View>

      <Toast />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatar: {
    width: 24,
    height: 24,
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  commentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  commentContent: {
    flex: 1,
  },
  userNameText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 9,
    borderTopWidth: 3,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  loadingText: {
    fontSize: 14,
    textAlign: "center",
    padding: 20,
  },
  authErrorContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  authErrorText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    borderRadius: 20,
    minWidth: 280,
    maxWidth: "90%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    minHeight: 60,
    justifyContent: "center",
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  modalFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  modalButtonPrimaryFull: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderRightWidth: 1,
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: "500",
  },
})

export default CommentsScreen