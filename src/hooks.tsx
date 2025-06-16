// src/hooks.tsx

import { useState, useCallback } from 'react'

export interface Notification {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now()
    const notification = { id, message, type }
    setNotifications(prev => [...prev, notification])
  }, [])

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }, [])

  return { notifications, showNotification, removeNotification }
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export const useOpenAI = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const sendMessage = useCallback(async (
    userMessage: string, 
    apiKey: string, 
    systemPrompt: string, 
    contextMessage: string
  ) => {
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: contextMessage }
          ],
          temperature: 0.3
        })
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error.message)
      }

      const assistantResponse = data.choices[0].message.content
      setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }])
      
      return assistantResponse
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMessage}` }])
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { messages, loading, sendMessage }
}