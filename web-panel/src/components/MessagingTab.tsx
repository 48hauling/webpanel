'use client'

import { useState, useEffect, useRef } from 'react'
import { devapi } from '@/lib/devapi'
import toast from 'react-hot-toast'
import {
  MessageSquare, Send, Users, Bell, Megaphone, X,
  Plus, Calendar, AlertCircle, RefreshCw, Trash2, Edit
} from 'lucide-react'
import type { Message, Conversation, Announcement } from '@/types/api'

export default function MessagingTab() {
  const [view, setView] = useState<'messages' | 'announcements'>('messages')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'NORMAL',
    expiresAt: ''
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const user = devapi.getUser()
    setCurrentUser(user)
    fetchConversations()
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.userId)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const response = await devapi.getConversations()
      if (response.success && response.data) {
        setConversations(response.data)
      }
    } catch (error) {
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (userId: string) => {
    try {
      const response = await devapi.getConversation(userId)
      if (response.success && response.data) {
        setMessages(response.data)
        // Mark as read
        await devapi.markConversationRead(userId)
        // Update conversation unread count
        setConversations(prev =>
          prev.map(conv =>
            conv.userId === userId ? { ...conv, unreadCount: 0 } : conv
          )
        )
      }
    } catch (error) {
      toast.error('Failed to load messages')
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const response = await devapi.getAnnouncements(currentUser?.role === 'ADMIN')
      if (response.success && response.data) {
        setAnnouncements(response.data)
      }
    } catch (error) {
      toast.error('Failed to load announcements')
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const response = await devapi.sendMessage(selectedConversation.userId, newMessage.trim())

      if (response.success) {
        setNewMessage('')
        await fetchMessages(selectedConversation.userId)
        await fetchConversations()
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      toast.error('Error sending message')
    } finally {
      setSending(false)
    }
  }

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) {
      toast.error('Title and content are required')
      return
    }

    try {
      if (editingAnnouncement) {
        const response = await devapi.updateAnnouncement(editingAnnouncement.id.toString(), announcementForm)
        if (response.success) {
          toast.success('Announcement updated')
        }
      } else {
        const response = await devapi.createAnnouncement(announcementForm)
        if (response.success) {
          toast.success('Announcement created')
        }
      }

      setShowAnnouncementModal(false)
      setEditingAnnouncement(null)
      setAnnouncementForm({ title: '', content: '', priority: 'NORMAL', expiresAt: '' })
      fetchAnnouncements()
    } catch (error) {
      toast.error('Failed to save announcement')
    }
  }

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm('Delete this announcement?')) return

    try {
      const response = await devapi.deleteAnnouncement(id.toString())
      if (response.success) {
        toast.success('Announcement deleted')
        fetchAnnouncements()
      }
    } catch (error) {
      toast.error('Failed to delete announcement')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-900/30 text-red-500 border-red-700'
      case 'HIGH':
        return 'bg-orange-900/30 text-orange-500 border-orange-700'
      case 'NORMAL':
        return 'bg-blue-900/30 text-blue-500 border-blue-700'
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-700'
    }
  }

  const isAdmin = currentUser?.role === 'ADMIN'

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Messaging & Announcements</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setView('messages')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              view === 'messages' ? 'bg-blue-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-gray-800'
            }`}
          >
            <MessageSquare size={18} />
            Messages
          </button>
          <button
            onClick={() => setView('announcements')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              view === 'announcements' ? 'bg-blue-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-gray-800'
            }`}
          >
            <Megaphone size={18} />
            Announcements
          </button>
        </div>
      </div>

      {view === 'messages' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Users size={18} />
                Conversations
              </h2>
              <button
                onClick={fetchConversations}
                className="p-2 hover:bg-[#0f0f0f] rounded"
              >
                <RefreshCw size={16} className="text-gray-400" />
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : conversations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No conversations yet</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.userId}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-3 rounded cursor-pointer hover:bg-[#0f0f0f] ${
                      selectedConversation?.userId === conv.userId ? 'bg-[#0f0f0f] border border-blue-700' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="text-white font-medium">{conv.username}</p>
                        <p className="text-xs text-gray-500">{conv.role}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(conv.lastMessageAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Thread */}
          <div className="md:col-span-2 bg-[#1a1a1a] border border-gray-800 rounded-lg flex flex-col">
            {selectedConversation ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-gray-800">
                  <h3 className="text-white font-semibold">{selectedConversation.username}</h3>
                  <p className="text-sm text-gray-400">{selectedConversation.email}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No messages yet. Start a conversation!</p>
                  ) : (
                    messages.map((message) => {
                      const isSentByMe = message.senderId === currentUser?.userId
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isSentByMe
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#0f0f0f] text-gray-300 border border-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isSentByMe ? 'text-blue-200' : 'text-gray-500'
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                      disabled={sending}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Send size={16} />
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare size={48} className="mx-auto mb-3 text-gray-600" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Announcements View */
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Announcements</h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingAnnouncement(null)
                  setAnnouncementForm({ title: '', content: '', priority: 'NORMAL', expiresAt: '' })
                  setShowAnnouncementModal(true)
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              >
                <Plus size={16} />
                New Announcement
              </button>
            )}
          </div>

          {announcements.length === 0 ? (
            <div className="text-center py-12 bg-[#1a1a1a] border border-gray-800 rounded-lg">
              <Bell size={48} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400">No announcements</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`p-4 rounded-lg border ${getPriorityColor(announcement.priority)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">{announcement.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                        {!announcement.isActive && (
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-900/30 text-gray-400">
                            INACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingAnnouncement(announcement)
                            setAnnouncementForm({
                              title: announcement.title,
                              content: announcement.content,
                              priority: announcement.priority,
                              expiresAt: announcement.expiresAt ? (typeof announcement.expiresAt === 'string' ? announcement.expiresAt.split('T')[0] : new Date(announcement.expiresAt).toISOString().split('T')[0]) : ''
                            })
                            setShowAnnouncementModal(true)
                          }}
                          className="p-2 hover:bg-[#0f0f0f] rounded"
                          aria-label={`Edit announcement: ${announcement.title}`}
                        >
                          <Edit size={16} className="text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          className="p-2 hover:bg-[#0f0f0f] rounded"
                          aria-label={`Delete announcement: ${announcement.title}`}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-300 mb-3">{announcement.content}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>Posted: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                    {announcement.expiresAt && (
                      <div className="flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-white font-bold">
                {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                  placeholder="Announcement title"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Content</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                  placeholder="Announcement content"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Priority</label>
                <select
                  value={announcementForm.priority}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Expires At (Optional)</label>
                <input
                  type="date"
                  value={announcementForm.expiresAt}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-800">
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {editingAnnouncement ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
