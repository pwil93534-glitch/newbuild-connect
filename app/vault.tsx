import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActionSheetIOS,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../src/design-system';
import { useVaultStore, VaultDoc, VaultCategory } from '../src/stores/vault';
import { useBuyerStore } from '../src/stores/buyer';

const VAULT_DIR = FileSystem.documentDirectory + 'vault/';

const CATEGORIES: { id: VaultCategory | 'all'; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { id: 'all', label: 'All', icon: 'folder-open', color: Colors.textSecondary },
  { id: 'financial', label: 'Financial', icon: 'cash', color: Colors.success },
  { id: 'identity', label: 'Identity', icon: 'card', color: Colors.primary },
  { id: 'military', label: 'Military', icon: 'shield', color: Colors.accent },
  { id: 'purchase', label: 'Purchase', icon: 'home', color: '#7B2FBE' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: Colors.textSecondary },
];

const SUGGESTIONS: Record<VaultCategory, string[]> = {
  financial: ['Pay Stub', 'W-2 Form', 'Bank Statement', 'Tax Return', 'Pre-Approval Letter'],
  identity: ['Driver\'s License', 'Passport', 'Social Security Card'],
  military: ['Certificate of Eligibility', 'DD-214', 'BAH Letter', 'VA Funding Fee Exemption'],
  purchase: ['Purchase Contract', 'Inspection Report', 'Appraisal', 'Closing Disclosure'],
  other: [],
};

function catColor(cat: VaultCategory): string {
  const found = CATEGORIES.find((c) => c.id === cat);
  return found?.color ?? Colors.border;
}

function catLabel(cat: VaultCategory): string {
  const found = CATEGORIES.find((c) => c.id === cat);
  return found?.label ?? 'Other';
}

function fileIcon(mimeType: string): { name: keyof typeof Ionicons.glyphMap; color: string } {
  if (mimeType.startsWith('image/')) return { name: 'image', color: '#0D7377' };
  if (mimeType === 'application/pdf') return { name: 'document', color: Colors.danger };
  if (mimeType.includes('word') || mimeType.includes('docx')) return { name: 'document-text', color: Colors.primary };
  return { name: 'document-attach', color: Colors.textSecondary };
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function DocCard({ doc, onShare, onDelete }: { doc: VaultDoc; onShare: () => void; onDelete: () => void }) {
  const { name: iconName, color: iconColor } = fileIcon(doc.mimeType);
  const accent = catColor(doc.category);

  return (
    <View style={[styles.docCard, { borderLeftColor: accent }]}>
      <View style={[styles.docIconWrap, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={iconName} size={26} color={iconColor} />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docName} numberOfLines={2}>{doc.name}</Text>
        <View style={styles.docMeta}>
          <View style={[styles.catBadge, { backgroundColor: accent + '18' }]}>
            <Text style={[styles.catBadgeText, { color: accent }]}>{catLabel(doc.category)}</Text>
          </View>
          <Text style={styles.docDate}>{formatDate(doc.addedAt)}</Text>
          {doc.sizeBytes ? <Text style={styles.docSize}>{formatSize(doc.sizeBytes)}</Text> : null}
        </View>
      </View>
      <View style={styles.docActions}>
        <TouchableOpacity style={styles.docActionBtn} onPress={onShare}>
          <Ionicons name="share-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.docActionBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

type PendingFile = { uri: string; name: string; mimeType: string; sizeBytes?: number };

export default function VaultScreen() {
  const router = useRouter();
  const { buyer } = useBuyerStore();
  const { docs, addDoc, removeDoc, loadFromStorage } = useVaultStore();
  const [activeFilter, setActiveFilter] = useState<VaultCategory | 'all'>('all');
  const [pending, setPending] = useState<PendingFile | null>(null);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<VaultCategory>('financial');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadFromStorage(); }, []);

  // Pre-select a sensible category based on buyer type
  const defaultCategory = (): VaultCategory => {
    if (buyer?.buyer_type === 'veteran') return 'military';
    if (buyer?.buyer_type === 'first_time') return 'financial';
    return 'financial';
  };

  const filtered = activeFilter === 'all' ? docs : docs.filter((d) => d.category === activeFilter);

  async function ensureVaultDir() {
    const info = await FileSystem.getInfoAsync(VAULT_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
    }
  }

  function showPicker() {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Choose from Files', 'Take Photo / Scan'],
        cancelButtonIndex: 0,
      },
      async (idx) => {
        if (idx === 1) await pickDocument();
        if (idx === 2) await pickPhoto();
      }
    );
  }

  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      setPending({ uri: file.uri, name: file.name ?? 'Document', mimeType: file.mimeType ?? 'application/octet-stream', sizeBytes: file.size ?? undefined });
      setDocName(file.name?.replace(/\.[^.]+$/, '') ?? '');
      setDocCategory(defaultCategory());
    } catch {
      Alert.alert('Error', 'Could not open file. Please try again.');
    }
  }

  async function pickPhoto() {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera Access', 'Please allow camera access in Settings to scan documents.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.85 });
      if (result.canceled) return;
      const asset = result.assets[0];
      const auto = `Scan ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      setPending({ uri: asset.uri, name: auto, mimeType: asset.mimeType ?? 'image/jpeg', sizeBytes: asset.fileSize ?? undefined });
      setDocName(auto);
      setDocCategory(defaultCategory());
    } catch {
      Alert.alert('Error', 'Could not access camera. Please try again.');
    }
  }

  async function saveDocument() {
    if (!pending || !docName.trim()) return;
    setSaving(true);
    try {
      await ensureVaultDir();
      const ext = pending.mimeType.startsWith('image/') ? 'jpg' : pending.mimeType === 'application/pdf' ? 'pdf' : 'bin';
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const destUri = VAULT_DIR + filename;
      await FileSystem.copyAsync({ from: pending.uri, to: destUri });
      addDoc({
        id: Date.now().toString(),
        name: docName.trim(),
        category: docCategory,
        localUri: destUri,
        mimeType: pending.mimeType,
        addedAt: new Date().toISOString(),
        sizeBytes: pending.sizeBytes,
      });
      setPending(null);
    } catch {
      Alert.alert('Save Failed', 'Could not save the document. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleShare(doc: VaultDoc) {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(doc.localUri, { mimeType: doc.mimeType, dialogTitle: doc.name });
    } catch {
      Alert.alert('Error', 'Could not share document.');
    }
  }

  function handleDelete(doc: VaultDoc) {
    Alert.alert(
      'Delete Document',
      `Remove "${doc.name}" from your vault?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await FileSystem.deleteAsync(doc.localUri, { idempotent: true });
            } catch {}
            removeDoc(doc.id);
          },
        },
      ]
    );
  }

  const suggestions = SUGGESTIONS[docCategory] ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Document Vault</Text>
          <Text style={styles.headerSub}>{docs.length} document{docs.length !== 1 ? 's' : ''} stored</Text>
        </View>
        <TouchableOpacity onPress={showPicker} style={styles.addBtn}>
          <Ionicons name="add" size={26} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="lock-closed" size={14} color={Colors.primary} />
        <Text style={styles.infoText}>Documents are stored securely on your device — never uploaded to the cloud.</Text>
      </View>

      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {CATEGORIES.map((cat) => {
          const active = activeFilter === cat.id;
          const count = cat.id === 'all' ? docs.length : docs.filter((d) => d.category === cat.id).length;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.filterChip, active && { backgroundColor: cat.color, borderColor: cat.color }]}
              onPress={() => setActiveFilter(cat.id as VaultCategory | 'all')}
            >
              <Ionicons name={cat.icon} size={14} color={active ? Colors.white : cat.color} />
              <Text style={[styles.filterText, active && { color: Colors.white }]}>{cat.label}</Text>
              {count > 0 && (
                <View style={[styles.filterCount, active && { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                  <Text style={[styles.filterCountText, active && { color: Colors.white }]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Document list */}
      {filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="lock-open-outline" size={48} color={Colors.border} />
          </View>
          <Text style={styles.emptyTitle}>
            {activeFilter === 'all' ? 'Your vault is empty' : `No ${catLabel(activeFilter as VaultCategory)} docs yet`}
          </Text>
          <Text style={styles.emptySub}>
            {activeFilter === 'all'
              ? 'Tap + to add your first document — pre-approval, W-2, VA COE, and more.'
              : `Tap + to add a ${catLabel(activeFilter as VaultCategory).toLowerCase()} document.`}
          </Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={showPicker}>
            <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
            <Text style={styles.emptyAddBtnText}>Add Document</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          renderItem={({ item }) => (
            <DocCard
              doc={item}
              onShare={() => handleShare(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      {/* Add Document Modal */}
      <Modal visible={pending !== null} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Save Document</Text>

            {/* Name input */}
            <Text style={styles.fieldLabel}>Document Name</Text>
            <TextInput
              style={styles.nameInput}
              value={docName}
              onChangeText={setDocName}
              placeholder="e.g. Pre-Approval Letter"
              placeholderTextColor={Colors.textSecondary}
              autoFocus
              returnKeyType="done"
            />

            {/* Quick-name suggestions */}
            {suggestions.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestRow}>
                {suggestions.map((s) => (
                  <TouchableOpacity key={s} style={styles.suggestChip} onPress={() => setDocName(s)}>
                    <Text style={styles.suggestText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Category picker */}
            <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Category</Text>
            <View style={styles.catRow}>
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                const active = docCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catChip, active && { backgroundColor: cat.color, borderColor: cat.color }]}
                    onPress={() => {
                      setDocCategory(cat.id as VaultCategory);
                      // Reset name suggestion when category changes
                    }}
                  >
                    <Ionicons name={cat.icon} size={13} color={active ? Colors.white : cat.color} />
                    <Text style={[styles.catChipText, active && { color: Colors.white }]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setPending(null); setSaving(false); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, (!docName.trim() || saving) && styles.saveBtnDisabled]}
                onPress={saveDocument}
                disabled={!docName.trim() || saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={16} color={Colors.white} />
                    <Text style={styles.saveBtnText}>Save to Vault</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundSecondary },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.supportMilitaryBlue,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  infoText: { flex: 1, fontSize: FontSize.xs, color: Colors.primary, lineHeight: 16 },

  filterRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  filterText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  filterCount: {
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterCountText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textSecondary },

  list: { padding: Spacing.lg, paddingTop: Spacing.sm },

  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  docIconWrap: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  docInfo: { flex: 1 },
  docName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, lineHeight: 20 },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: 5, flexWrap: 'wrap' },
  catBadge: { borderRadius: BorderRadius.full, paddingHorizontal: 7, paddingVertical: 2 },
  catBadgeText: { fontSize: 10, fontWeight: FontWeight.bold },
  docDate: { fontSize: 11, color: Colors.textSecondary },
  docSize: { fontSize: 11, color: Colors.textSecondary },
  docActions: { flexDirection: 'column', gap: Spacing.xs },
  docActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.md,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  emptySub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  emptyAddBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.backgroundPrimary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing['4xl'],
    gap: Spacing.sm,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  fieldLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  nameInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundSecondary,
  },
  suggestRow: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  suggestChip: {
    borderWidth: 1,
    borderColor: Colors.primary + '50',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    backgroundColor: Colors.backgroundSecondary,
  },
  suggestText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  catChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white },
});
