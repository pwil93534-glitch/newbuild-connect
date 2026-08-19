import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../src/design-system';
import { Card, Badge, ProgressBar, MilestoneCheckmark } from '../../src/components';
import { useBuyerStore } from '../../src/stores/buyer';
import { useAppStore } from '../../src/stores/app';
import { JOURNEY_BY_BUYER_TYPE } from '../../src/constants/journey-steps';
import { JourneyStageDefinition, JourneyTaskDefinition } from '../../src/types';
import { useRouter } from 'expo-router';

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  not_started: { bg: Colors.backgroundSecondary, text: Colors.textSecondary, label: 'Not Started' },
  in_progress: { bg: Colors.supportMilitaryBlue, text: Colors.primary, label: 'In Progress' },
  complete: { bg: '#D1FAE5', text: Colors.success, label: 'Complete' },
  needs_attention: { bg: '#FEE2E2', text: Colors.danger, label: 'Needs Attention' },
};

function TaskDetailModal({
  task,
  taskKey,
  visible,
  onClose,
}: {
  task: JourneyTaskDefinition;
  taskKey: string;
  visible: boolean;
  onClose: () => void;
}) {
  const { toggleTask, isTaskComplete } = useAppStore();
  const [justCompleted, setJustCompleted] = useState(false);
  const router = useRouter();
  const isDone = isTaskComplete(taskKey);

  const handleToggle = () => {
    if (!isDone) setJustCompleted(true);
    toggleTask(taskKey);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Task Detail</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          {justCompleted && isDone && (
            <View style={styles.celebrationRow}>
              <MilestoneCheckmark size={48} onComplete={() => setJustCompleted(false)} />
              <Text style={styles.celebrationText}>Task Complete!</Text>
            </View>
          )}

          <Text style={styles.taskTitle}>{task.text}</Text>

          <View style={styles.infoSection}>
            <View style={styles.infoIcon}>
              <Ionicons name="information-circle" size={18} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>What this means</Text>
              <Text style={styles.infoText}>{task.detail}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={[styles.infoIcon, { backgroundColor: Colors.supportGoldLight }]}>
              <Ionicons name="help-circle" size={18} color={Colors.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Why it matters</Text>
              <Text style={styles.infoText}>{task.why}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={[styles.infoIcon, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>How to complete it</Text>
              <Text style={styles.infoText}>{task.how}</Text>
            </View>
          </View>

          <View style={styles.agentNote}>
            <View style={styles.agentNoteHeader}>
              <Ionicons name="person-circle" size={20} color={Colors.primary} />
              <Text style={styles.agentNoteLabel}>Strategist Note</Text>
            </View>
            <Text style={styles.agentNoteText}>{task.agentNote}</Text>
          </View>

          <TouchableOpacity
            style={styles.advisorBtn}
            onPress={() => { onClose(); router.push('/(tabs)/advisor'); }}
          >
            <Ionicons name="chatbubbles-outline" size={18} color={Colors.primary} />
            <Text style={styles.advisorBtnText}>Ask My Advisor about this</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.taskToggleBtn, isDone && styles.taskToggleBtnDone]}
            onPress={handleToggle}
          >
            <Ionicons name={isDone ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={isDone ? Colors.success : Colors.textSecondary} />
            <Text style={[styles.taskToggleText, isDone && styles.taskToggleTextDone]}>
              {isDone ? 'Marked Complete' : 'Mark as Complete'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function StageCard({
  stage,
  stageIndex,
  isActive,
  onToggle,
}: {
  stage: JourneyStageDefinition;
  stageIndex: number;
  isActive: boolean;
  onToggle: () => void;
}) {
  const { toggleTask, isTaskComplete, journeyStageStatuses } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<JourneyTaskDefinition | null>(null);
  const [selectedTaskKey, setSelectedTaskKey] = useState('');

  const completedCount = stage.tasks.filter((_, i) =>
    isTaskComplete(`stage_${stage.number}_task_${i}`)
  ).length;
  const stageProgress = completedCount / stage.tasks.length;

  const statusKey = journeyStageStatuses[stage.number] ?? 'not_started';
  const statusColor = STATUS_COLORS[statusKey];

  return (
    <>
      <TouchableOpacity
        style={[styles.stageCard, isActive && styles.stageCardActive]}
        onPress={onToggle}
        activeOpacity={0.88}
      >
        <View style={styles.stageCardHeader}>
          <View style={[styles.stageIconCircle, isActive && styles.stageIconCircleActive]}>
            <Ionicons
              name={stage.icon as any}
              size={22}
              color={isActive ? Colors.white : Colors.textSecondary}
            />
          </View>
          <View style={styles.stageHeaderText}>
            <Text style={styles.stageNumber}>Stage {stage.number}</Text>
            <Text style={[styles.stageName, isActive && styles.stageNameActive]}>{stage.name}</Text>
          </View>
          <View style={styles.stageRight}>
            <View style={[styles.statusPill, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>{statusColor.label}</Text>
            </View>
            <Ionicons
              name={isActive ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.textSecondary}
            />
          </View>
        </View>

        {isActive && (
          <View style={styles.stageExpanded}>
            <Text style={styles.stageDesc}>{stage.description}</Text>

            <ProgressBar progress={stageProgress} height={6} style={{ marginVertical: Spacing.sm }} />
            <Text style={styles.progressText}>{completedCount} of {stage.tasks.length} tasks complete</Text>

            {/* Agent tip */}
            <View style={styles.tipBox}>
              <Ionicons name="bulb" size={16} color={Colors.accent} />
              <Text style={styles.tipText}>{stage.agentTip}</Text>
            </View>

            {/* Tasks */}
            <View style={styles.taskList}>
              {stage.tasks.map((task, taskIdx) => {
                const key = `stage_${stage.number}_task_${taskIdx}`;
                const done = isTaskComplete(key);
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.taskRow}
                    onPress={() => { setSelectedTask(task); setSelectedTaskKey(key); }}
                    activeOpacity={0.8}
                  >
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); toggleTask(key); }}
                      style={styles.checkbox}
                    >
                      <Ionicons
                        name={done ? 'checkmark-circle' : 'ellipse-outline'}
                        size={22}
                        color={done ? Colors.success : Colors.border}
                      />
                    </TouchableOpacity>
                    <Text style={[styles.taskText, done && styles.taskTextDone]}>{task.text}</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.border} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Documents needed */}
            {stage.documentsNeeded && (
              <View style={styles.docsSection}>
                <Text style={styles.docsSectionTitle}>Documents Needed</Text>
                {stage.documentsNeeded.map((doc) => (
                  <View key={doc} style={styles.docItem}>
                    <Ionicons name="document-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.docText}>{doc}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          taskKey={selectedTaskKey}
          visible={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}

export default function JourneyScreen() {
  const { buyer } = useBuyerStore();
  const buyerType = buyer?.buyer_type ?? 'first_time';
  const stages = JOURNEY_BY_BUYER_TYPE[buyerType] ?? [];
  const [activeStage, setActiveStage] = useState<number | null>(buyer?.current_stage ?? 1);
  const { isTaskComplete } = useAppStore();

  const totalTasks = stages.reduce((acc, s) => acc + s.tasks.length, 0);
  const completedTasks = stages.reduce(
    (acc, s) =>
      acc + s.tasks.filter((_, i) => isTaskComplete(`stage_${s.number}_task_${i}`)).length,
    0
  );
  const overallProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const buyerTypeLabel: Record<string, string> = {
    veteran: 'Veteran Journey',
    first_time: 'First-Time Buyer Journey',
    relocation: 'Relocation Journey',
    senior: 'Active Adult Journey',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View style={styles.pageHeader}>
          <Badge label={buyerTypeLabel[buyerType]} variant={buyerType as any} />
          <Text style={styles.pageTitle}>Your Journey</Text>
          <Text style={styles.pageSubtitle}>{stages.length} stages to your new home</Text>

          {/* Progress hero card */}
          <View style={styles.progressHero}>
            <View style={styles.progressHeroLeft}>
              <Text style={styles.progressHeroPct}>{Math.round(overallProgress * 100)}%</Text>
              <Text style={styles.progressHeroLabel}>Complete</Text>
              <Text style={styles.progressHeroSub}>{completedTasks} of {totalTasks} tasks done</Text>
            </View>
            <View style={styles.progressHeroRight}>
              <ProgressBar progress={overallProgress} height={14} style={{ marginBottom: Spacing.sm }} />
              <View style={styles.progressHeroStats}>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatNum}>{stages.filter((s, i) => i < (buyer?.current_stage ?? 1) - 1).length}</Text>
                  <Text style={styles.progressStatLabel}>Stages Done</Text>
                </View>
                <View style={styles.progressStatDivider} />
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatNum}>{stages.length - (buyer?.current_stage ?? 1) + 1}</Text>
                  <Text style={styles.progressStatLabel}>Remaining</Text>
                </View>
                <View style={styles.progressStatDivider} />
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatNum}>{totalTasks - completedTasks}</Text>
                  <Text style={styles.progressStatLabel}>Tasks Left</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Stages */}
        <View style={styles.stagesSection}>
          {stages.map((stage, idx) => (
            <StageCard
              key={stage.number}
              stage={stage}
              stageIndex={idx}
              isActive={activeStage === stage.number}
              onToggle={() => setActiveStage(activeStage === stage.number ? null : stage.number)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  scroll: { flex: 1 },
  content: { paddingBottom: Spacing['4xl'] },
  pageHeader: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  pageTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.white, marginTop: Spacing.xs },
  pageSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)' },
  progressHero: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.md,
    alignItems: 'center',
  },
  progressHeroLeft: { alignItems: 'center', minWidth: 64 },
  progressHeroPct: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.accent },
  progressHeroLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', fontWeight: FontWeight.semibold },
  progressHeroSub: { fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 2, textAlign: 'center' },
  progressHeroRight: { flex: 1 },
  progressHeroStats: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  progressStat: { flex: 1, alignItems: 'center' },
  progressStatNum: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  progressStatLabel: { fontSize: 9, color: 'rgba(255,255,255,0.7)' },
  progressStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
  stagesSection: { marginHorizontal: Spacing.lg, marginTop: Spacing.md, gap: Spacing.sm },
  stageCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  stageCardActive: { borderColor: Colors.primary, ...Shadows.md },
  stageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  stageIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIconCircleActive: { backgroundColor: Colors.primary },
  stageHeaderText: { flex: 1 },
  stageNumber: { fontSize: FontSize.xs, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  stageName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginTop: 2 },
  stageNameActive: { color: Colors.primary },
  stageRight: { alignItems: 'flex-end', gap: Spacing.xs },
  statusPill: { borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: FontWeight.semibold },
  stageExpanded: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm },
  stageDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  progressText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  tipBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.supportGoldLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  tipText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20 },
  taskList: { gap: 2 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  checkbox: { padding: 2 },
  taskText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 18 },
  taskTextDone: { color: Colors.textSecondary, textDecorationLine: 'line-through' },
  docsSection: { gap: Spacing.xs },
  docsSectionTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary, textTransform: 'uppercase' },
  docItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  docText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  // Modal styles
  modalSafe: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  modalContent: { padding: Spacing.lg, gap: Spacing.lg },
  celebrationRow: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  celebrationText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.success },
  taskTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, lineHeight: 28 },
  infoSection: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.supportMilitaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoContent: { flex: 1, gap: 4 },
  infoLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoText: { fontSize: FontSize.base, color: Colors.textPrimary, lineHeight: 22 },
  agentNote: {
    backgroundColor: Colors.supportMilitaryBlue,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  agentNoteHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  agentNoteLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  agentNoteText: { fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20 },
  advisorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.supportMilitaryBlue,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  advisorBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.primary },
  modalFooter: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  taskToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    minHeight: 48,
  },
  taskToggleBtnDone: { borderColor: Colors.success, backgroundColor: '#D1FAE5' },
  taskToggleText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  taskToggleTextDone: { color: Colors.success },
});
