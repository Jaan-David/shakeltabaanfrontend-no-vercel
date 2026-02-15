import React, { useEffect, useState } from 'react';

// Components
import MessageComponent from '@/components/UI/Profile/leftSection/Messages/Messages';

// Styles
import styles from '@/components/UI/Profile/leftSection/Messages/Messages.module.css';

import { MessageCircle } from 'lucide-react';

// Services
import { 
  fetchProfileMessages, 
  ProfileMessages,
  ProfileMessagesError,
  sortMessagesByDate,
  filterMessagesByStatus
} from '@/services/profile/messages';

type MessageStatus = 'open' | 'closed' | 'pending';

const MessagesList = () => {
  const [messages, setMessages] = useState<ProfileMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, _setFilterStatus] = useState<MessageStatus | 'all'>('all');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchProfileMessages();
      
      // Sort by newest first
      const sortedMessages = sortMessagesByDate(data, 'desc');
      setMessages(sortedMessages);
    } catch (err) {
      if (err instanceof ProfileMessagesError) {
        setError(err.message);
      } else {
        setError('حدث خطأ أثناء تحميل الرسائل. يرجى المحاولة مرة أخرى.');
      }
      //console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getFilteredMessages = () => {
    if (filterStatus === 'all') {
      return messages;
    }
    return filterMessagesByStatus(messages, filterStatus);
  };

  const filteredMessages = getFilteredMessages();

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        {error}
      </div>
    );
  }

  if (filteredMessages.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#8B95A5' }}>
        <MessageCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
        <p>لا توجد رسائل</p>
      </div>
    );
  }

  return (
    <div className={styles.messagesList}>
      {filteredMessages.map((message, index) => (
        <MessageComponent
          key={message._id || index}
          message={message.description || ''}
          timestamp={formatDate(message.createdAt || '')}
          response={message.reply || undefined}
        />
      ))}
    </div>
  );
};

export default MessagesList;