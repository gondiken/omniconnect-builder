// src/components.tsx

import React, { useState, useEffect, useRef } from 'react'
import Papa from 'papaparse'
import type { Notification, Message } from './hooks'

interface ToastNotificationProps {
  notification: Notification
  onClose: (id: number) => void
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onClose(notification.id), 300)
    }, 2000)

    return () => clearTimeout(timer)
  }, [notification.id, onClose])

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[notification.type]

  const icon = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }[notification.type]

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-64 notification ${isExiting ? 'notification-exit' : ''}`}>
      {icon}
      <span className="text-sm font-medium">{notification.message}</span>
      <button
        onClick={() => {
          setIsExiting(true)
          setTimeout(() => onClose(notification.id), 300)
        }}
        className="ml-auto text-white hover:text-gray-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

interface InputPanelProps {
  inputJson: string
  setInputJson: (json: string) => void
  inputType: 'json' | 'csv'
  setInputType: (type: 'json' | 'csv') => void
  csvHeaders: string[]
  setCsvHeaders: (headers: string[]) => void
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void
}

export const InputPanel: React.FC<InputPanelProps> = ({
  inputJson,
  setInputJson,
  inputType,
  setInputType,
  csvHeaders,
  setCsvHeaders,
  showNotification
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        if (file.name.endsWith('.csv')) {
          Papa.parse(content, {
            header: true,
            complete: (results) => {
              setInputType('csv')
              setCsvHeaders(results.meta.fields || [])
              setInputJson(content)
              showNotification(`CSV file loaded with ${results.data.length} rows`)
            },
            error: (error) => {
              showNotification('Error parsing CSV: ' + error.message, 'error')
            }
          })
        } else {
          try {
            const json = JSON.parse(content)
            setInputType('json')
            setInputJson(JSON.stringify(json, null, 2))
            showNotification('JSON file loaded successfully')
          } catch (err) {
            showNotification('Invalid JSON file', 'error')
          }
        }
      }
      reader.readAsText(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'application/json' || file.name.endsWith('.csv'))) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        
        if (file.name.endsWith('.csv')) {
          Papa.parse(content, {
            header: true,
            complete: (results) => {
              setInputType('csv')
              setCsvHeaders(results.meta.fields || [])
              setInputJson(content)
              showNotification(`CSV file loaded with ${results.data.length} rows`)
            },
            error: (error) => {
              showNotification('Error parsing CSV: ' + error.message, 'error')
            }
          })
        } else {
          try {
            const json = JSON.parse(content)
            setInputType('json')
            setInputJson(JSON.stringify(json, null, 2))
            showNotification('JSON file loaded successfully')
          } catch (err) {
            showNotification('Invalid JSON file', 'error')
          }
        }
      }
      reader.readAsText(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Payload Sample</h2>
        {inputType === 'csv' && (
          <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
            CSV
          </span>
        )}
      </div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-4 hover:border-gray-400 transition-colors"
      >
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mt-2 text-sm text-gray-600">Drag & drop JSON or CSV file</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700"
        >
          Choose file
        </button>
      </div>
      {inputType === 'csv' && csvHeaders.length > 0 && (
        <div className="mb-3 p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium text-gray-700 mb-1">CSV Columns:</p>
          <div className="flex flex-wrap gap-1">
            {csvHeaders.map((header, idx) => (
              <span key={idx} className="text-xs bg-white px-2 py-1 rounded border">
                {header}
              </span>
            ))}
          </div>
        </div>
      )}
      <textarea
        value={inputJson}
        onChange={(e) => setInputJson(e.target.value)}
        className="w-full h-80 p-3 border rounded-lg font-mono text-sm resize-none"
        placeholder={inputType === 'csv' ? "CSV content..." : "Or paste data JSON payload here..."}
      />
    </div>
  )
}

interface ChatPanelProps {
  messages: Message[]
  loading: boolean
  onSendMessage: (message: string) => void
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, loading, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [inputMessage])

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage)
      setInputMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Describe Your Transformation</h2>
      
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 text-sm max-w-xs">
            <p className="mb-4">Tell me how to transform this payload into Bloomreach events:</p>
            <div className="space-y-2 text-left bg-gray-50 p-3 rounded">
              <p className="text-xs">• "Create customer update and purchase event"</p>
              <p className="text-xs">• "Map email to customer ID, create form submission event"</p>
              <p className="text-xs">• "For each CSV row, update customer and track signup"</p>
              <p className="text-xs">• "Extract order items into separate events"</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.role === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message">
            <div className="inline-block p-3 rounded-lg bg-gray-100">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t pt-4">
        <div className="flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your mapping requirements... (Shift+Enter for new line, Enter to send)"
            className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 chat-input"
            disabled={loading}
            rows={3}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Shift+Enter for new line • Enter to send
            </span>
            <button
              onClick={handleSend}
              disabled={loading || !inputMessage.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface OutputPanelProps {
  generatedCode: string
  preview: string
  inputJson: string
  inputType: 'json' | 'csv'
  onCopyCode: () => void
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  generatedCode,
  preview,
  inputJson,
  inputType,
  onCopyCode,
  showNotification
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'test'>('code')
  const [endpoint, setEndpoint] = useState('https://api-demoapp.exponea.com/intg/webhook-handler/v1.0/ab30354f-7f8f-4074-9c58-058d29db3cfe/callback')
  const [responses, setResponses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'code') {
      setTimeout(() => (window as any).Prism?.highlightAll(), 100)
    }
  }, [generatedCode, activeTab])

  const sendRequest = async (data: any, index?: number) => {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Bloomreach-Test-Client/1.0"
        },
        body: JSON.stringify(data),
        mode: 'no-cors'
      })

      return {
        index,
        status: 'sent',
        statusText: 'Request sent successfully',
        timestamp: new Date().toISOString(),
        success: true
      }
    } catch (error) {
      return {
        index,
        status: 0,
        statusText: 'Network Error',
        data: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        success: false
      }
    }
  }

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const testData = { test: true, timestamp: new Date().toISOString() }
      const result = await sendRequest(testData)
      setResponses(prev => [{ ...result, index: 'TEST' }, ...prev])
      
      if (result.success) {
        showNotification('✅ Test connection successful!')
      } else {
        showNotification(`❌ Test connection failed: ${result.data}`, 'error')
      }
    } catch (error) {
      showNotification('❌ Test connection failed: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const sendData = async () => {
    setIsLoading(true)
    try {
      let inputData
      
      if (inputType === 'csv') {
        const parsed = Papa.parse(inputJson, { 
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true 
        })
        inputData = parsed.data.filter(row => Object.keys(row).some(key => row[key] !== null && row[key] !== ''))
        
        // Send each row
        const results = []
        for (let i = 0; i < inputData.length; i++) {
          const result = await sendRequest(inputData[i], i)
          results.push(result)
        }
        setResponses(prev => [...results.reverse(), ...prev])
        showNotification(`Sent ${inputData.length} row${inputData.length !== 1 ? 's' : ''} successfully!`)
      } else {
        inputData = JSON.parse(inputJson)
        const result = await sendRequest(inputData)
        setResponses(prev => [result, ...prev])
        showNotification('Data sent successfully!')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showNotification('Error sending data: ' + errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const clearResponses = () => {
    setResponses([])
  }

return (
    <div className="bg-white rounded-lg shadow-sm border p-4 flex flex-col">
      {/* Header with tabs and title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Generated Output</h2>
        <button
          onClick={onCopyCode}
          disabled={generatedCode === '// Your Bloomreach Omniconnect handler function will appear here'}
          className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Code
        </button>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            activeTab === 'code' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Handler Function
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            activeTab === 'preview' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Output Preview
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            activeTab === 'test' 
              ? 'bg-green-100 text-green-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Send
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'code' && (
          <div className="h-full overflow-auto">
            <pre className="language-javascript h-full"><code>{generatedCode}</code></pre>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="h-full overflow-auto">
            <pre className="bg-gray-50 p-4 rounded text-sm">{preview || '// Event output will appear here after generating the handler function'}</pre>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="h-full flex flex-col space-y-4">
            {/* Endpoint Configuration */}
            <div className="border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endpoint
              </label>
              <input
                type="url"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                placeholder="https://api-demoapp.exponea.com/intg/webhook-handler/..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={testConnection}
                disabled={isLoading}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Test Connection
              </button>

              <button
                onClick={sendData}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Data
                  </>
                )}
              </button>
            </div>

            {/* Response History */}
            <div className="flex-1 border rounded-lg">
              <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                <h3 className="text-sm font-medium">Request History</h3>
                <div className="flex items-center gap-2">
                  {responses.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {responses.length} request{responses.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  <button
                    onClick={clearResponses}
                    className="text-xs bg-white text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="p-3 max-h-64 overflow-y-auto">
                {responses.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2" />
                    </svg>
                    <p className="text-sm">No requests sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {responses.map((response, index) => (
                      <div key={index} className={`text-xs p-2 rounded border ${
                        response.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              response.success ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className="font-medium">{response.statusText}</span>
                            {response.index === 'TEST' && (
                              <span className="bg-blue-200 text-blue-700 px-1 rounded text-xs">
                                TEST
                              </span>
                            )}
                            {response.index !== undefined && response.index !== 'TEST' && (
                              <span className="bg-gray-200 text-gray-700 px-1 rounded text-xs">
                                Row {response.index + 1}
                              </span>
                            )}
                          </div>
                          <span className="text-gray-500">
                            {new Date(response.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}