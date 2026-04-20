/**
 * Chat Page
 * 
 * Main chat interface for interacting with PDF documents.
 * Includes PDF upload and chat functionality.
 *
 * Thin page component: all behavior lives in ``ChatContainer`` so routing stays dumb.
 */

import { PageWrapper, SectionWrapper } from "@/components/layout/page-wrapper";
import { ChatContainer } from "@/components/chat/chat-container";

export function ChatPage() {
  return (
    <PageWrapper
      showBackground
      showFooter
      clipHorizontal={false}
      className="w-full min-w-0 min-h-0"
    >
      <SectionWrapper className="w-full min-h-0 overflow-x-visible">
        <ChatContainer />
      </SectionWrapper>
    </PageWrapper>
  );
}

export default ChatPage;
