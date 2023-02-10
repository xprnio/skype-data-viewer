import { useConversation, useDataContext } from './context/data-context';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ActiveContext = createContext<{ active?: string }>({
  active: undefined,
});

function useActiveConversation() {
  const { active } = useContext(ActiveContext);
  const { conversations, messages } = useDataContext();
  return useMemo(() => {
    const conversation = conversations.find((conversation) => conversation.id === active);
    if (!conversation) return {};

    return { conversation, messages: messages[conversation.id] };
  }, [conversations, active]);
}

function ConversationsList({ onChange }) {
  const { conversations } = useDataContext();
  const { active } = useContext(ActiveContext);

  return (
    <div className="conversation-list">
      <h2>Conversations</h2>
      {conversations.map(conversation => (
        <div className="conversation-item">
          <span>{conversation.displayName || conversation.id}</span>
          <button key={conversation.id} onClick={() => onChange(conversation.id)}>
            open
          </button>
        </div>
      ))}
    </div>
  );
}

function Conversation() {
  const { conversation, messages } = useActiveConversation();

  if (!conversation) {
    return null;
  }

  return (
    <div className="conversation">
      <h1>{conversation.displayName || conversation.id}</h1>
      <div className="conversation-messages">
        {messages.map((message) => (
          message.from ? (
            <div key={message.id} className="conversation-message right">
              <h2>{message.from}</h2>
              <p dangerouslySetInnerHTML={{ __html: message.content }} />
            </div>
          ) : (
            <div key={message.id} className="conversation-message">
              <h2>You</h2>
              <p dangerouslySetInnerHTML={{ __html: message.content }} />
            </div>
          )
        ))}
      </div>
    </div>
  );
}

function App() {
  const { conversations } = useDataContext();
  const [active, setActive] = useState<string>(null);

  useEffect(() => {
    if (active) return;
    if (conversations.length === 0) return;
    setActive(conversations[0].id);
  }, [conversations]);

  return (
    <ActiveContext.Provider value={{ active }}>
      <div className="app">
        <ConversationsList onChange={setActive} />
        <Conversation />
      </div>
    </ActiveContext.Provider>
  );
}

export default App;
