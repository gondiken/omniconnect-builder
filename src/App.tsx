// src/App.tsx

import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { useNotifications, useOpenAI } from './hooks'
import { ToastNotification, InputPanel, ChatPanel, OutputPanel } from './components'

const SYSTEM_PROMPT = `You are an expert at creating Bloomreach Omniconnect transformation functions. You help users transform webhook payloads into Bloomreach Engagement events.

CRITICAL REQUIREMENTS:
1. Always return ONLY a JavaScript function named 'handler' that takes a 'payload' parameter
2. The function must return an array of event objects (even if just one event)
3. Use const and let instead of var for variables
4. No 3rd party libraries or console.log() allowed
5. Must include utility functions if needed (like timestamp helpers)

EVENT TYPES AND STRUCTURE:

**CUSTOMER UPDATE EVENT:**
{
    "name": "customers",
    "command_id": "unique-string-id", 
    "data": {
        "customer_ids": {
            "registered": "customer@email.com"
            // customer ID is required
        },
        "properties": {
            "first_name": "John",
            "last_name": "Doe"
            // Customer properties to update
        },
        "update_timestamp": 1614941503 // Unix timestamp in seconds (REQUIRED)
    }
}

**CUSTOMER EVENT:**
{
    "name": "customers/events",
    "command_id": "unique-string-id",
    "data": {
        "customer_ids": {
            "registered": "customer@email.com"
            // At least one customer ID required
        },
        "event_type": "purchase", // REQUIRED: event name
        "timestamp": 1614941503, // Unix timestamp in seconds (REQUIRED)
        "properties": {
            "total_price": 1234.50,
            "product_name": "Widget"
            // Event-specific properties
        }
    }
}

PREDEFINED CONSTANTS (available in Bloomreach):
- INTEGRATION_ID: Current integration identifier
- COMPANY_ID: Project ID in Engagement Platform  
- INTEGRATION_NAME: Name of the webhook handler

REQUIRED UTILITY FUNCTIONS TO INCLUDE:
\`\`\`javascript
function currentTimestampInSeconds() {
    return Math.round(Date.now() / 1000);
}

function parseDateToTimestampInSeconds(dateStr) {
    const date = new Date(dateStr);
    return Math.round(date.getTime() / 1000);
}
\`\`\`

EXAMPLE STRUCTURE:
\`\`\`javascript
function handler(payload) {
    const event_list = [];
    
    // Extract customer IDs (at least one required)
    const customerIDs = {
        "registered": payload.email || payload.customer_email,
        "email_id": payload.email || payload.customer_email
    };
    
    // Customer Update Event (optional)
    const customerUpdate = {
        name: "customers",
        command_id: String(payload.id + "-update"),
        data: {
            customer_ids: customerIDs,
            properties: {
                first_name: payload.first_name,
                last_name: payload.last_name
            },
            update_timestamp: currentTimestampInSeconds()
        }
    };
    event_list.push(customerUpdate);
    
    // Customer Event (for tracking behavior)
    const customerEvent = {
        name: "customers/events", 
        command_id: String(payload.id + "-event"),
        data: {
            customer_ids: customerIDs,
            event_type: payload.event_type || "custom_event",
            timestamp: currentTimestampInSeconds(),
            properties: {
                // Map relevant payload fields to event properties
            }
        }
    };
    event_list.push(customerEvent);
    
    return event_list;
}
\`\`\`

FOR CSV DATA:
- payload will be an array of row objects
- Process each row with payload.forEach() or payload.map()
- Generate events for each row or aggregate across rows
- Always ensure customer_ids are properly extracted from each row

When users describe transformations, generate the complete handler function with:
- Proper customer ID extraction
- Appropriate event types based on the data
- Correct timestamp handling
- Field mappings as requested
- Conditional logic for different scenarios
- Multiple events if needed (updates + behavioral events)
- All required utility functions included`

function App() {
  const [inputJson, setInputJson] = useState('')
  const [inputType, setInputType] = useState<'json' | 'csv'>('json')
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [generatedCode, setGeneratedCode] = useState('// Your Bloomreach Omniconnect handler function will appear here')
  const [preview, setPreview] = useState('')
  const [previewError, setPreviewError] = useState('')
  // Remove this line: const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code')
  const [apiKey, setApiKey] = useState('')
  
  const { notifications, showNotification, removeNotification } = useNotifications()
  const { messages, loading, sendMessage } = useOpenAI()

  useEffect(() => {
    // Check for API key in localStorage
    const savedKey = localStorage.getItem('openai_api_key')
    if (savedKey) setApiKey(savedKey)

    // Set example JSON
    const exampleJson = {
      "event_id": "EVT-12345",
      "customer_data": {
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "created_at": "2024-01-15T10:30:00Z",
        "event_type": "registration"
      },
      "customer_event_data": {
        "event_type": "form_submission",
        "title": "Newsletter Signup",
        "form_id": "FORM-001",
        "submitted_at": "2024-01-15T10:30:00Z",
        "tags": ["newsletter", "marketing"]
      }
    }
    setInputJson(JSON.stringify(exampleJson, null, 2))
  }, [])

  const handleSendMessage = async (userMessage: string) => {
    if (!apiKey) {
      showNotification('Please enter your OpenAI API key', 'error')
      return
    }

    try {
      let contextMessage = ''
      if (inputType === 'csv') {
        contextMessage = `Here is a CSV file with columns: ${csvHeaders.join(', ')}\n\nThe payload will be an array where each element represents a row of the CSV.\n\nUser request: ${userMessage}`
      } else {
        contextMessage = `Here is the input JSON payload:\n${inputJson}\n\nUser request: ${userMessage}`
      }

      const assistantResponse = await sendMessage(userMessage, apiKey, SYSTEM_PROMPT, contextMessage)
      
      // Extract and process the generated code
      let fullCode = ''
      const codeBlockMatch = assistantResponse.match(/```(?:javascript)?\s*([\s\S]*?)```/)
      if (codeBlockMatch) {
        fullCode = codeBlockMatch[1].trim()
      } else {
        const functionMatches = assistantResponse.match(/function\s+\w+\s*\([^)]*\)\s*{[\s\S]*?^}/gm)
        if (functionMatches) {
          fullCode = functionMatches.join('\n\n')
        }
      }
      
      if (fullCode) {
        setGeneratedCode(fullCode)
        showNotification('Handler function generated successfully!')
        
        // Generate preview
        generatePreview(fullCode)
      } else {
        setPreview('// No code found in response. Please try again or refine your request.')
        showNotification('No handler function found in response', 'error')
      }
    } catch (error) {
      showNotification('Error: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error')
    }
  }

  const generatePreview = (code: string) => {
    try {
      let cleanCode = code
      
      // Ensure utility functions are present
      if (cleanCode.includes('function handler') && !cleanCode.includes('function currentTimestampInSeconds')) {
        const utilityFunctions = `
function currentTimestampInSeconds() {
    return Math.round(Date.now() / 1000);
}

function parseDateToTimestampInSeconds(dateStr) {
    const date = new Date(dateStr);
    return Math.round(date.getTime() / 1000);
}
`
        cleanCode = utilityFunctions + '\n\n' + cleanCode
      }
      
      // Create execution environment
      const executionCode = `
(function() {
    const INTEGRATION_ID = "test-integration";
    const COMPANY_ID = "test-company"; 
    const INTEGRATION_NAME = "Test Integration";
    
    ${cleanCode}
    
    if (typeof handler !== 'function') {
        throw new Error('No handler function found in generated code');
    }
    
    return handler;
})()`
      
      const handlerFunc = eval(executionCode)
      let inputData
      
      if (inputType === 'csv') {
        const parsed = Papa.parse(inputJson, { 
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true 
        })
        inputData = parsed.data.filter(row => Object.keys(row).some(key => row[key] !== null && row[key] !== ''))
      } else {
        inputData = JSON.parse(inputJson)
      }
      
      const output = handlerFunc(inputData)
      
      if (!Array.isArray(output)) {
        throw new Error('Handler must return an array of events')
      }
      
      // Validate output structure
      output.forEach((event, index) => {
        if (!event.name || !event.data) {
          throw new Error(`Event ${index} missing required 'name' or 'data' field`)
        }
      })
      
      setPreview(JSON.stringify(output, null, 2))
      setPreviewError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setPreviewError(errorMessage)
      setPreview(`// Preview Error: ${errorMessage}\n// Please check the generated code for syntax errors or missing functions.`)
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      showNotification('Code copied to clipboard!')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = generatedCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showNotification('Code copied to clipboard!')
    }
  }

  const saveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey)
    showNotification('API key saved!')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Notifications */}
      {notifications.map(notification => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bloomreach Omniconnect AI Transformer</h1>
              <p className="text-sm text-gray-600 mt-1">Generate transformation functions for Bloomreach Engagement</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="OpenAI API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm w-64"
              />
              <button
                onClick={saveApiKey}
                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          <InputPanel
            inputJson={inputJson}
            setInputJson={setInputJson}
            inputType={inputType}
            setInputType={setInputType}
            csvHeaders={csvHeaders}
            setCsvHeaders={setCsvHeaders}
            showNotification={showNotification}
          />
          
          <ChatPanel
            messages={messages}
            loading={loading}
            onSendMessage={handleSendMessage}
          />
          
          <OutputPanel
            generatedCode={generatedCode}
            preview={preview}
            inputJson={inputJson}
            inputType={inputType}
            onCopyCode={copyCode}
            showNotification={showNotification}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500 text-center">
            Generated code follows Bloomreach Omniconnect specifications. Copy and paste into your Bloomreach data handler.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App