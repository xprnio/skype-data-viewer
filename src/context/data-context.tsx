import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DataContext = createContext({
  conversations: [],
  messages: {},
});

export function useDataContext() {
  return useContext(DataContext);
}

export function useConversation(conversation_id) {
  const { conversations, messages } = useDataContext();

  return useMemo(() => {
    const conversation = conversations.find((conversation) => {
      return conversation.id === conversation_id;
    });
    const conversationMessages = messages[conversation.id];

    return [conversation, conversationMessages];
  }, [conversations, messages, conversation_id]);
}

function parseData({ userId, conversations }) {
  return conversations.reduce(({ conversations, messages }, { MessageList, ...conversation }) => {
    if (MessageList.length === 0) {
      return { conversations, messages };
    }

    return {
      conversations: [
        ...conversations,
        {
          id: conversation.id,
          displayName: conversation.displayName,
        },
      ],
      messages: {
        ...messages,
        [conversation.id]: MessageList.map(({ id, from, displayName, content, originalarrivaltime: timestamp }) => {
          if (from === userId) {
            return { id, content, timestamp };
          }
          return { id, from: displayName, content, timestamp };
        }).sort((a, b) => {
          return Date.parse(a.timestamp) - Date.parse(b.timestamp);
        }),
      },
    };
  }, {
    conversations: [],
    messages: {},
  });
}

export function DataContextProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    fetch('/data.json', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => parseData(data))
      .then(({ conversations, messages }) => {
        setConversations(conversations);
        setMessages(messages);
      });
  }, [setConversations, setMessages]);

  return (
    <DataContext.Provider value={{ conversations, messages }}>
      {children}
    </DataContext.Provider>
  );
}
