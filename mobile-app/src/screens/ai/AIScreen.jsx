

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, FlatList,
  Alert
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { aiAPI } from '../../services/api';

// ── MESSAGE BUBBLE ────────────────────────────────────
const MessageBubble = ({ message }) => (
  <View style={[
    styles.messageBubble,
    message.role === 'user' ? styles.userBubble : styles.aiBubble
  ]}>
    {message.role === 'ai' && (
      <View style={styles.aiAvatar}>
        <MaterialIcons name="smart-toy" size={16} color="#7c3aed" />
      </View>
    )}
    <View style={[
      styles.bubbleContent,
      message.role === 'user' ? styles.userBubbleContent : styles.aiBubbleContent
    ]}>
      <Text style={[
        styles.bubbleText,
        message.role === 'user' ? styles.userBubbleText : styles.aiBubbleText
      ]}>
        {message.text}
      </Text>
    </View>
  </View>
);

const AIScreen = () => {
  const scrollViewRef = useRef(null);

  // ── CHAT STATE ────────────────────────────────────
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      text: 'Hello! 👋 I\'m your SmartBiz AI assistant. I can help you with business insights, questions about your sales and inventory. What would you like to know?'
    }
  ]);
  const [question, setQuestion]       = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // ── INSIGHTS STATE ────────────────────────────────
  const [insights, setInsights]             = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // ── EMAIL STATE ───────────────────────────────────
  const [emailPurpose, setEmailPurpose] = useState('');
  const [emailDetails, setEmailDetails] = useState('');
  const [emailResult, setEmailResult]   = useState(null);
  const [loadingEmail, setLoadingEmail] = useState(false);

  // ── ACTIVE TAB ────────────────────────────────────
  const [activeTab, setActiveTab] = useState('chat');

  const TABS = [
    { key: 'chat',     label: 'Chat',     icon: 'chat' },
    { key: 'insights', label: 'Insights', icon: 'lightbulb' },
    { key: 'email',    label: 'Email',    icon: 'email' },
  ];

  // ── HANDLERS ──────────────────────────────────────
  const handleChat = async () => {
    if (!question.trim()) return;

    const userMsg = { role: 'user', text: question };
    setChatMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setLoadingChat(true);

    try {
      const res = await aiAPI.chat({ question });
      setChatMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        { role: 'ai', text: 'Sorry, I could not process your request. Please try again!' }
      ]);
    } finally {
      setLoadingChat(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleGetInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await aiAPI.insights();
      setInsights(res.data.insights);
    } catch {
      Alert.alert('Error', 'Failed to get insights. Try again!');
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleGetEmail = async () => {
    if (!emailPurpose || !emailDetails) {
      Alert.alert('Error', 'Please fill purpose and details!');
      return;
    }
    setLoadingEmail(true);
    try {
      const res = await aiAPI.email({ purpose: emailPurpose, details: emailDetails });
      setEmailResult(res.data.email);
    } catch {
      Alert.alert('Error', 'Failed to compose email. Try again!');
    } finally {
      setLoadingEmail(false);
    }
  };

  const insightColors = {
    warning:  { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
    tip:      { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    positive: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  };

  return (
    <View style={styles.container}>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <MaterialIcons
              name={tab.icon}
              size={18}
              color={activeTab === tab.key ? '#7c3aed' : '#94a3b8'}
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── CHAT TAB ─────────────────────────────── */}
      {activeTab === 'chat' && (
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {chatMessages.map((msg, index) => (
              <MessageBubble key={index} message={msg} />
            ))}
            {loadingChat && (
              <View style={styles.typingIndicator}>
                <View style={styles.aiAvatar}>
                  <MaterialIcons name="smart-toy" size={16} color="#7c3aed" />
                </View>
                <View style={styles.typingDots}>
                  <ActivityIndicator size="small" color="#7c3aed" />
                  <Text style={styles.typingText}>AI is thinking...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Questions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickQuestions}
          >
            {[
              'How is my business today?',
              'Which product sells most?',
              'What are my top expenses?',
              'How to increase revenue?',
            ].map((q) => (
              <TouchableOpacity
                key={q}
                style={styles.quickBtn}
                onPress={() => setQuestion(q)}
              >
                <Text style={styles.quickBtnText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.chatInput}
              placeholder="Ask anything about your business..."
              placeholderTextColor="#94a3b8"
              value={question}
              onChangeText={setQuestion}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!question.trim() || loadingChat) && styles.sendBtnDisabled
              ]}
              onPress={handleChat}
              disabled={!question.trim() || loadingChat}
            >
              <MaterialIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ── INSIGHTS TAB ─────────────────────────── */}
      {activeTab === 'insights' && (
        <ScrollView style={styles.tabContent}>
          <View style={styles.insightsHeader}>
            <Text style={styles.insightsTitle}>Business Insights</Text>
            <Text style={styles.insightsSubtitle}>
              Let AI analyze your business data and give recommendations!
            </Text>
          </View>

          <TouchableOpacity
            style={styles.analyzeBtn}
            onPress={handleGetInsights}
            disabled={loadingInsights}
          >
            {loadingInsights ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="analytics" size={22} color="#fff" />
                <Text style={styles.analyzeBtnText}>Analyze My Business</Text>
              </>
            )}
          </TouchableOpacity>

          {insights.length > 0 ? (
            insights.map((insight, index) => {
              const style = insightColors[insight.type] || insightColors.tip;
              return (
                <View
                  key={index}
                  style={[
                    styles.insightCard,
                    {
                      backgroundColor: style.bg,
                      borderColor: style.border
                    }
                  ]}
                >
                  <View style={styles.insightHeader}>
                    <MaterialIcons
                      name="lightbulb"
                      size={18}
                      color={style.color}
                    />
                    <Text style={[styles.insightTitle, { color: style.color }]}>
                      {insight.title}
                    </Text>
                  </View>
                  <Text style={styles.insightMessage}>
                    {insight.message}
                  </Text>
                </View>
              );
            })
          ) : (
            !loadingInsights && (
              <View style={styles.emptyInsights}>
                <MaterialIcons name="lightbulb" size={60} color="#cbd5e1" />
                <Text style={styles.emptyText}>
                  Click the button above to get AI insights!
                </Text>
              </View>
            )
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ── EMAIL TAB ─────────────────────────────── */}
      {activeTab === 'email' && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.tabContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.insightsHeader}>
              <Text style={styles.insightsTitle}>AI Email Composer</Text>
              <Text style={styles.insightsSubtitle}>
                Describe what you need and AI will write a professional email!
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Purpose</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Follow up with supplier about delayed delivery"
                placeholderTextColor="#94a3b8"
                value={emailPurpose}
                onChangeText={setEmailPurpose}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Details</Text>
              <TextInput
                style={[styles.fieldInput, { height: 100 }]}
                placeholder="e.g. Order was placed 2 weeks ago, supplier is Ahmed Trading, still not delivered"
                placeholderTextColor="#94a3b8"
                value={emailDetails}
                onChangeText={setEmailDetails}
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.analyzeBtn}
              onPress={handleGetEmail}
              disabled={loadingEmail}
            >
              {loadingEmail ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="email" size={22} color="#fff" />
                  <Text style={styles.analyzeBtnText}>Compose Email</Text>
                </>
              )}
            </TouchableOpacity>

            {emailResult && (
              <View style={styles.emailResult}>
                <View style={styles.emailSubjectRow}>
                  <Text style={styles.emailSubjectLabel}>Subject:</Text>
                  <Text style={styles.emailSubjectText}>{emailResult.subject}</Text>
                </View>
                <View style={styles.emailDivider} />
                <Text style={styles.emailBodyLabel}>Body:</Text>
                <Text style={styles.emailBodyText}>{emailResult.body}</Text>
              </View>
            )}

            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#7c3aed',
  },
  tabText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
    marginLeft: 4,
  },
  tabTextActive: {
    color: '#7c3aed',
    fontWeight: '700',
  },

  // Chat
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 12,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bubbleContent: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubbleContent: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  aiBubbleContent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userBubbleText: {
    color: '#fff',
  },
  aiBubbleText: {
    color: '#1e293b',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 16,
    gap: 6,
  },
  typingText: {
    fontSize: 13,
    color: '#7c3aed',
    marginLeft: 6,
  },
  quickQuestions: {
    maxHeight: 44,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  quickBtn: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  quickBtnText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },

  // Insights & Email
  tabContent: {
    flex: 1,
    padding: 16,
  },
  insightsHeader: {
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  insightsSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 20,
    gap: 8,
    elevation: 4,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  analyzeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  insightCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  insightMessage: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  emptyInsights: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
    textAlign: 'center',
  },

  // Email
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
    textAlignVertical: 'top',
  },
  emailResult: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  emailSubjectRow: {
    marginBottom: 12,
  },
  emailSubjectLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 4,
  },
  emailSubjectText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  emailDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },
  emailBodyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
  },
  emailBodyText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 22,
  },
});

export default AIScreen;