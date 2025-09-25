/**
 * DEBUG TEST COMPONENT
 *
 * Add this to any React component to test debugging connection
 * The console errors should show clickable source links in Windsurf
 */

import React from 'react';

const DebugTest = () => {
  // Test 1: Basic console logging
  console.log('🔧 Debug test - this should link to source file');

  // Test 2: Error logging
  console.error('❌ Error test - should show stack trace with source links');

  // Test 3: Warning
  console.warn('⚠️ Warning test - should be clickable in console');

  // Test 4: Object logging
  console.log('📊 Object test:', {
    component: 'DebugTest',
    file: 'DebugTest.tsx',
    line: 15,
    testData: 'This should be expandable'
  });

  // Test 5: Function call logging
  const testFunction = () => {
    console.log('🔧 Function test - should show caller location');
    return 'test result';
  };

  const result = testFunction();

  // Test 6: Async operation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.log('⏰ Timeout test - should show source location');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Test 7: Event handler
  const handleClick = () => {
    console.log('🖱️ Click test - should show handler location');
    throw new Error('🚨 Intentional error test - should break at this line');
  };

  return (
    <div style={{
      padding: '20px',
      border: '2px solid #007acc',
      borderRadius: '8px',
      margin: '20px 0',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>🔧 Debug Test Component</h3>
      <p>Open browser console and check if these messages are clickable:</p>
      <ul>
        <li>🔧 Debug test - this should link to source file</li>
        <li>❌ Error test - should show stack trace with source links</li>
        <li>⚠️ Warning test - should be clickable in console</li>
        <li>📊 Object test - should be expandable</li>
        <li>🔧 Function test - should show caller location</li>
        <li>⏰ Timeout test - should show source location (after 1s)</li>
      </ul>
      <button
        onClick={handleClick}
        style={{
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🚨 Test Error (Click to throw exception)
      </button>
      <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
        <strong>Expected:</strong> All console messages should be clickable and open the source file in Windsurf
      </p>
    </div>
  );
};

export default DebugTest;
