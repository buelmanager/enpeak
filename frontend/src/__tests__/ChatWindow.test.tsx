import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatWindow from '../components/ChatWindow';

// Mock contexts
vi.mock('@/contexts/TTSContext', () => ({
  useTTS: () => ({
    speakWithCallback: vi.fn(),
    isSpeaking: false,
    stop: vi.fn(),
  }),
}));

vi.mock('@/contexts/ConversationSettingsContext', () => ({
  useConversationSettings: () => ({
    settings: {
      autoTTS: false,
      autoRecord: false,
      inputMode: 'text',
    },
  }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/chat',
}));

// Mock VoiceRecorder component
vi.mock('../components/VoiceRecorder', () => ({
  default: vi.fn(() => null),
}));

// Mock ConversationSettingsPanel
vi.mock('../components/ConversationSettingsPanel', () => ({
  default: vi.fn(() => null),
}));

// Mock ChatSettingsGuide
vi.mock('../components/ChatSettingsGuide', () => ({
  default: vi.fn(() => null),
}));

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

describe('ChatWindow', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('mode=free (default)', () => {
    it('uses /api/chat endpoint for free mode', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: 'conv-123',
          message: 'Hello! How can I help you?',
          suggestions: ['Tell me more', 'Thanks'],
        }),
      });

      render(<ChatWindow />);

      // Type a message
      const input = screen.getByPlaceholderText(/영어로 입력하세요/i);
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          `${API_BASE}/api/chat`,
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"message":"Hello"'),
          })
        );
      });
    });

    it('default mode is free when no mode prop is provided', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: 'conv-123',
          message: 'Hi there!',
        }),
      });

      render(<ChatWindow />);

      const input = screen.getByPlaceholderText(/영어로 입력하세요/i);
      fireEvent.change(input, { target: { value: 'Hi' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          `${API_BASE}/api/chat`,
          expect.any(Object)
        );
      });
    });
  });

  describe('mode=expression', () => {
    it('uses /api/chat endpoint with practiceExpression', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: 'conv-456',
          message: 'Great use of the expression!',
          suggestions: ['Thanks!'],
        }),
      });

      const practiceExpression = {
        expression: 'break the ice',
        meaning: 'to make people feel more comfortable',
      };

      render(
        <ChatWindow mode="expression" practiceExpression={practiceExpression} />
      );

      // Wait for initial messages
      await waitFor(() => {
        expect(screen.getByText(/Let's practice using/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/영어로 입력하세요/i);
      fireEvent.change(input, { target: { value: 'I try to break the ice' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          `${API_BASE}/api/chat`,
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });
  });

  describe('mode=roleplay', () => {
    it('calls /api/roleplay/start when first message sent', async () => {
      // Mock roleplay start
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          session_id: 'roleplay-session-123',
          ai_message: 'Welcome to the cafe! What can I get you?',
          current_stage: 1,
          total_stages: 3,
          suggested_responses: ["I'd like a coffee", 'Just looking'],
        }),
      });

      render(<ChatWindow mode="roleplay" scenarioId="cafe_order" />);

      const input = screen.getByPlaceholderText(/영어로 입력하세요/i);
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          `${API_BASE}/api/roleplay/start`,
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"scenario_id":"cafe_order"'),
          })
        );
      });
    });

    it('calls /api/roleplay/turn for subsequent messages', async () => {
      // Mock roleplay start
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            session_id: 'roleplay-session-123',
            ai_message: 'Welcome to the cafe!',
            current_stage: 1,
            total_stages: 3,
          }),
        })
        // Mock roleplay turn
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            session_id: 'roleplay-session-123',
            ai_message: 'Great choice! What size?',
            current_stage: 2,
            total_stages: 3,
            is_complete: false,
          }),
        });

      render(<ChatWindow mode="roleplay" scenarioId="cafe_order" />);

      const input = screen.getByPlaceholderText(/영어로 입력하세요/i);

      // First message triggers start
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          `${API_BASE}/api/roleplay/start`,
          expect.any(Object)
        );
      });

      // Second message triggers turn
      fireEvent.change(input, { target: { value: "I'd like a latte" } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          `${API_BASE}/api/roleplay/turn`,
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"session_id":"roleplay-session-123"'),
          })
        );
      });
    });

    it('requires scenarioId for roleplay mode', async () => {
      // Should not crash without scenarioId, but won't make API call
      render(<ChatWindow mode="roleplay" />);

      const input = screen.getByPlaceholderText(/영어로 입력하세요/i);
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.submit(input.closest('form')!);

      // Wait a bit to ensure no fetch was made
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('onReset callback', () => {
    it('calls onReset when conversation is reset', async () => {
      const onReset = vi.fn();

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          session_id: 'roleplay-session-123',
          ai_message: 'Welcome!',
          current_stage: 1,
          total_stages: 1,
          is_complete: true,
        }),
      });

      render(
        <ChatWindow mode="roleplay" scenarioId="cafe_order" onReset={onReset} />
      );

      const input = screen.getByPlaceholderText(/영어로 입력하세요/i);
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.submit(input.closest('form')!);

      // When roleplay completes (is_complete: true), onReset should be called
      await waitFor(
        () => {
          expect(onReset).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });
  });

  describe('backward compatibility', () => {
    it('works without mode prop (defaults to free)', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: 'conv-789',
          message: 'Hello!',
        }),
      });

      render(<ChatWindow />);

      const input = screen.getByPlaceholderText(/영어로 입력하세요/i);
      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          `${API_BASE}/api/chat`,
          expect.any(Object)
        );
      });
    });

    it('works with only practiceExpression prop (backward compatible)', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversation_id: 'conv-exp',
          message: 'Nice!',
        }),
      });

      const practiceExpression = {
        expression: 'piece of cake',
        meaning: 'very easy',
      };

      render(<ChatWindow practiceExpression={practiceExpression} />);

      await waitFor(() => {
        expect(screen.getByText(/Let's practice using/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/영어로 입력하세요/i);
      fireEvent.change(input, { target: { value: 'It was a piece of cake' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          `${API_BASE}/api/chat`,
          expect.any(Object)
        );
      });
    });
  });
});
