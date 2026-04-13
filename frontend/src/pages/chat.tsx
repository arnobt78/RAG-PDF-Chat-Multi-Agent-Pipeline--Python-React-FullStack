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
    <PageWrapper showBackground showFooter={false}>
      <SectionWrapper className="py-8 sm:py-12 h-full">
        <ChatContainer />
      </SectionWrapper>
    </PageWrapper>
  );
}

export default ChatPage;
