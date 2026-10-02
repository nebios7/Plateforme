import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ScrollView, FlatList, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    try {
      const docs = await DocumentPicker.requestDirectoryPermissionsAsync();
      const media = await MediaLibrary.requestPermissionsAsync();
      return docs.granted && media.granted;
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de demander les permissions');
      return false;
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*',
        copyTo: FileSystem.cacheDirectory,
      });

      if (!result.canceled) {
        const file = {
          id: Date.now().toString(),
          name: result.assets[0].name,
          size: formatSize(result.assets[0].size),
          type: getFileType(result.assets[0].mimeType),
          uri: result.assets[0].uri,
        };
        setFiles([...files, file]);
        setSelectedFile(file);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
    }
  };

  const getFileType = (mimeType) => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('image')) return 'Image';
    if (mimeType.includes('video')) return 'Vidéo';
    if (mimeType.includes('zip') || mimeType.includes('tar')) return 'Archive';
    if (mimeType.includes('text')) return 'Document';
    return 'Autre';
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSendFile = async () => {
    if (!selectedFile || !recipient) {
      Alert.alert('Erreur', 'Veuillez sélectionner un fichier et un destinataire');
      return;
    }
    setLoading(true);
    // Simulation d'envoi (dans la vraie app, utiliser une API)
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Fichier envoyé !',
        `Le fichier ${selectedFile.name} a été envoyé à ${recipient}`,
        [
          { text: 'OK', onPress: () => {
            setSelectedFile(null);
            setRecipient('');
            setMessage('');
          }},
        ]
      );
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Transfert de Fichiers</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermissions}>
          <Ionicons name="lock-closed" size={16} color="#fff" />
          <Text style={styles.permissionText}>Permissions</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sélectionner un fichier</Text>
          <TouchableOpacity style={styles.pickBtn} onPress={pickFile}>
            <Ionicons name="attach" size={24} color="#3b82f6" />
            <Text style={styles.pickBtnText}>Choisir un fichier</Text>
          </TouchableOpacity>
        </View>

        {files.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mes Fichiers</Text>
            <FlatList
              data={files}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.fileCard}
                  onPress={() => setSelectedFile(item)}
                >
                  <Ionicons name="document-text" size={30} color="#3b82f6" />
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{item.name}</Text>
                    <Text style={styles.fileSize}>{item.size} • {item.type}</Text>
                  </View>
                  {selectedFile?.name === item.name && (
                    <Ionicons name="checkmark-done" size={24} color="#10b981" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {selectedFile && (
          <View style={styles.fileDetail}>
            <Text style={styles.fileDetailTitle}>{selectedFile.name}</Text>
            <Text style={styles.fileDetailSize}>{selectedFile.size}</Text>
            <Text style={styles.fileDetailType}>{selectedFile.type}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedFile(null)}>
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinataire</Text>
          <TextInput
            style={styles.input}
            placeholder="Email du destinataire"
            placeholderTextColor="#9ca3af"
            value={recipient}
            onChangeText={setRecipient}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ajoutez un message..."
            placeholderTextColor="#9ca3af"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSendFile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.sendButtonText}>Envoyer le fichier</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  permissionBtn: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickBtnText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  fileSize: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  fileDetail: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  fileDetailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  fileDetailSize: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  fileDetailType: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  closeText: {
    color: '#3b82f6',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
