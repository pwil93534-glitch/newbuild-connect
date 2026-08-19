import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../src/design-system';
import { AITypingBubble, Avatar } from '../../src/components';
import { useBuyerStore } from '../../src/stores/buyer';
import { AGENT_PERSONA, AGENT_PHOTO } from '../../src/constants/agent';
import { streamAIResponse } from '../../src/services/anthropic';
import { AIMessage } from '../../src/types';

const STARTER_PROMPTS: Record<string, string[]> = {
  veteran: [
    "What can I afford with my BAH?",
    "Stack my VA incentives for me",
    "Explain the VA appraisal process",
    "How does a VA OTC loan work?",
  ],
  first_time: [
    "Explain the home building process",
    "What DPA programs can I use?",
    "How much do I really need to buy?",
    "What happens at the design center?",
  ],
  relocation: [
    "Compare Phoenix vs Tucson for me",
    "How do I buy remotely?",
    "What should I know about AZ taxes?",
    "Best West Valley neighborhoods?",
  ],
  senior: [
    "What are the best 55+ communities?",
    "How do I stack my incentives?",
    "Tell me about Del Webb communities",
    "What accessibility features can I add?",
  ],
  default: [
    "Stack my incentives for me",
    "When should I lock my rate?",
    "What happens at the design center?",
    "How long does new construction take?",
  ],
};

function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser && (
        <Avatar name={AGENT_PERSONA.name} size={32} imageSource={AGENT_PHOTO} style={styles.agentAvatar} />
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export default function AdvisorScreen() {
  const { buyer, messages, addMessage } = useBuyerStore();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const { prompt: incomingPrompt } = useLocalSearchParams<{ prompt?: string }>();
  const handledPromptRef = useRef<string | null>(null);

  const buyerType = buyer?.buyer_type ?? 'default';
  const starters = STARTER_PROMPTS[buyerType] ?? STARTER_PROMPTS.default;

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      buyer_id: buyer?.id ?? 'local',
      role: 'user',
      content: text.trim(),
      created_at: new Date().toISOString(),
    };
    addMessage(userMsg);
    setInput('');
    setIsStreaming(true);
    setStreamingText('');
    Keyboard.dismiss();
    scrollToBottom();

    const historyForApi = [...messages, userMsg].map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    let fullText = '';
    await streamAIResponse(
      historyForApi,
      buyer ?? {},
      (chunk) => {
        fullText += chunk;
        setStreamingText(fullText);
        scrollToBottom();
      },
      (complete) => {
        const aiMsg: AIMessage = {
          id: (Date.now() + 1).toString(),
          buyer_id: buyer?.id ?? 'local',
          role: 'assistant',
          content: complete,
          created_at: new Date().toISOString(),
        };
        addMessage(aiMsg);
        setIsStreaming(false);
        setStreamingText('');
        scrollToBottom();
      },
      (error) => {
        const errMsg: AIMessage = {
          id: (Date.now() + 1).toString(),
          buyer_id: buyer?.id ?? 'local',
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please check your connection and try again.",
          created_at: new Date().toISOString(),
        };
        addMessage(errMsg);
        setIsStreaming(false);
        setStreamingText('');
      }
    );
  }, [buyer, messages, isStreaming, addMessage]);

  useEffect(() => {
    if (incomingPrompt && incomingPrompt !== handledPromptRef.current) {
      handledPromptRef.current = incomingPrompt;
      const timer = setTimeout(() => sendMessage(incomingPrompt), 400);
      return () => clearTimeout(timer);
    }
  }, [incomingPrompt, sendMessage]);

  const displayMessages = [...messages];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Avatar name={AGENT_PERSONA.name} size={40} imageSource={AGENT_PHOTO} />
        <View style={styles.headerText}>
          <Text style={styles.headerName}>{AGENT_PERSONA.name}</Text>
          <View style={styles.onlineDot}>
            <View style={styles.greenDot} />
            <Text style={styles.onlineText}>AI Advisor · Always available</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.newChatBtn}
          onPress={() => {
            const { clearMessages } = useBuyerStore.getState();
            clearMessages();
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {displayMessages.length === 0 && !isStreaming ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyAvatar}>
              <Avatar name={AGENT_PERSONA.name} size={72} imageSource={AGENT_PHOTO} />
              <View style={styles.emptySparkle}>
                <Ionicons name="sparkles" size={18} color={Colors.accent} />
              </View>
            </View>
            <Text style={styles.emptyTitle}>Your AI-Powered Advisor</Text>
            <Text style={styles.emptyDesc}>
              Ask me anything about new construction, VA benefits, Arizona communities, or your home buying journey.
            </Text>

            <View style={styles.starterGrid}>
              {starters.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  style={styles.starterBtn}
                  onPress={() => sendMessage(prompt)}
                >
                  <Text style={styles.starterText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={displayMessages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
            renderItem={({ item }) => <MessageBubble message={item} />}
            ListFooterComponent={
              isStreaming ? (
                <View style={styles.messageRow}>
                  <Avatar name={AGENT_PERSONA.name} size={32} imageSource={AGENT_PHOTO} style={styles.agentAvatar} />
                  {streamingText ? (
                    <View style={[styles.bubble, styles.bubbleAI]}>
                      <Text style={styles.bubbleText}>{streamingText}</Text>
                    </View>
                  ) : (
                    <AITypingBubble />
                  )}
                </View>
              ) : null
            }
          />
        )}

        {/* Quick replies after last AI message */}
        {!isStreaming && displayMessages.length > 0 && (
          <View style={styles.quickReplies}>
            {starters.slice(0, 3).map((p) => (
              <TouchableOpacity key={p} style={styles.quickReply} onPress={() => sendMessage(p)}>
                <Text style={styles.quickReplyText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask your advisor anything..."
            placeholderTextColor={Colors.textSecondary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isStreaming) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
          >
            <Ionicons name="send" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  headerText: { flex: 1 },
  headerName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  onlineDot: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  onlineText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  newChatBtn: { padding: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing['2xl'], gap: Spacing.lg },
  emptyAvatar: { position: 'relative' },
  emptySparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.supportGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  emptyDesc: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  starterGrid: { width: '100%', gap: Spacing.sm },
  starterBtn: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  starterText: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  messageList: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.lg },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  messageRowUser: { flexDirection: 'row-reverse' },
  agentAvatar: { flexShrink: 0, marginBottom: 2 },
  bubble: {
    maxWidth: '80%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  bubbleAI: {
    backgroundColor: Colors.backgroundSecondary,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: FontSize.base, color: Colors.textPrimary, lineHeight: 22 },
  bubbleTextUser: { color: Colors.white },
  quickReplies: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  quickReply: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickReplyText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.primary },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundPrimary,
    paddingBottom: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
