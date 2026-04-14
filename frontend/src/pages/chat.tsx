/**
 * Chat Page
 * 
 * Main chat interface for interacting with PDF documents.
 * Includes PDF upload and chat functionality.
 */

import { PageWrapper, SectionWrapper } from "@/components/layout/page-wrapper";
import { ChatContainer } from "@/components/chat/chat-container";

export function ChatPage() {
  return (
    <PageWrapper showBackground showFooter className="w-full overflow-x-clip">
      <SectionWrapper className="w-full">
        <ChatContainer />
      </SectionWrapper>
    </PageWrapper>
  );
}

export default ChatPage;
