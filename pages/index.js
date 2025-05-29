import dynamic from 'next/dynamic';
const ChatWidget = dynamic(() => import('../modules/chat/components/ChatWidget'), { ssr: false });

export default function Home() {
  return (
    <div>
      <h1>FounderOS</h1>
      <ChatWidget />
    </div>
  );
}
