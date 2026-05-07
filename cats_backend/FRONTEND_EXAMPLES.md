# Frontend Integration Examples

## QR Code Scanner for Students

### Installation
```bash
npm install html5-qrcode
# or
yarn add html5-qrcode
```

### React Component - QR Scanner

```jsx
// components/QRScanner.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      scanner.render(
        (decodedText, decodedResult) => {
          console.log('QR Code detected:', decodedText);
          
          // Extract classroom code from URL
          // Expected format: http://localhost:3000/join-classroom/ABC12345
          const urlParts = decodedText.split('/');
          const code = urlParts[urlParts.length - 1];
          
          if (code && code.length === 8) {
            scanner.clear();
            onScanSuccess(code);
          } else {
            onScanError('Invalid QR code format');
          }
        },
        (error) => {
          // Handle scan errors (can be noisy, so we'll just log)
          console.warn('QR scan error:', error);
        }
      );

      scannerRef.current = scanner;
      setScanning(true);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="qr-scanner-container">
      <div id="qr-reader" style={{ width: '100%' }}></div>
    </div>
  );
};

export default QRScanner;
```

### React Component - Join Classroom Page

```jsx
// pages/JoinClassroom.jsx
import React, { useState } from 'react';
import QRScanner from '../components/QRScanner';
import axios from 'axios';

const JoinClassroom = () => {
  const [mode, setMode] = useState('manual'); // 'manual' or 'qr'
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [verifiedClassroom, setVerifiedClassroom] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  const token = localStorage.getItem('auth_token'); // Adjust based on your auth implementation

  const verifyCode = async (classroomCode) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `${API_URL}/student/classrooms/verify-code`,
        { code: classroomCode.toUpperCase() },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.valid) {
        setVerifiedClassroom(response.data.classroom);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify classroom code');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const joinClassroom = async (classroomCode) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `${API_URL}/student/classrooms/join`,
        { code: classroomCode.toUpperCase() },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess(response.data);
      setTimeout(() => {
        // Redirect to classroom page or dashboard
        window.location.href = `/classrooms/${response.data.classroom.id}`;
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join classroom');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 8) {
      setError('Classroom code must be 8 characters');
      return;
    }
    
    const isValid = await verifyCode(code);
    if (isValid) {
      await joinClassroom(code);
    }
  };

  const handleQRScanSuccess = async (scannedCode) => {
    setCode(scannedCode);
    const isValid = await verifyCode(scannedCode);
    if (isValid) {
      await joinClassroom(scannedCode);
    }
  };

  const handleQRScanError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className="join-classroom-page">
      <h1>Join a Classroom</h1>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button 
          className={mode === 'manual' ? 'active' : ''}
          onClick={() => setMode('manual')}
        >
          Enter Code
        </button>
        <button 
          className={mode === 'qr' ? 'active' : ''}
          onClick={() => setMode('qr')}
        >
          Scan QR Code
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="alert alert-success">
          Successfully joined {success.classroom.name}! Redirecting...
        </div>
      )}

      {/* Verified Classroom Preview */}
      {verifiedClassroom && !success && (
        <div className="classroom-preview">
          <h3>{verifiedClassroom.name}</h3>
          <p>{verifiedClassroom.description}</p>
          <p>Teacher: {verifiedClassroom.teacher.name}</p>
        </div>
      )}

      {/* Manual Code Entry */}
      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="manual-entry-form">
          <div className="form-group">
            <label htmlFor="code">Classroom Code</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter 8-character code"
              maxLength={8}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading || code.length !== 8}>
            {loading ? 'Joining...' : 'Join Classroom'}
          </button>
        </form>
      )}

      {/* QR Scanner */}
      {mode === 'qr' && (
        <div className="qr-scanner-section">
          <p>Point your camera at the classroom QR code</p>
          <QRScanner 
            onScanSuccess={handleQRScanSuccess}
            onScanError={handleQRScanError}
          />
        </div>
      )}
    </div>
  );
};

export default JoinClassroom;
```

### CSS Styling

```css
/* styles/JoinClassroom.css */
.join-classroom-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.mode-toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.mode-toggle button {
  flex: 1;
  padding: 10px 20px;
  border: 2px solid #007bff;
  background: white;
  color: #007bff;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
  transition: all 0.3s;
}

.mode-toggle button.active {
  background: #007bff;
  color: white;
}

.mode-toggle button:hover {
  background: #0056b3;
  color: white;
  border-color: #0056b3;
}

.alert {
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 5px;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.classroom-preview {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 20px;
  border: 1px solid #dee2e6;
}

.classroom-preview h3 {
  margin-top: 0;
  color: #333;
}

.manual-entry-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

button[type="submit"] {
  padding: 12px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

button[type="submit"]:hover:not(:disabled) {
  background: #218838;
}

button[type="submit"]:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.qr-scanner-section {
  text-align: center;
}

.qr-scanner-section p {
  margin-bottom: 20px;
  color: #666;
}

.qr-scanner-container {
  border: 2px solid #007bff;
  border-radius: 10px;
  overflow: hidden;
  padding: 10px;
}
```

## Teacher Dashboard - Display QR Code

```jsx
// components/ClassroomQRCode.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClassroomQRCode = ({ classroomId }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    fetchQRCode();
  }, [classroomId]);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/teacher/classrooms/${classroomId}/qr-code`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setQrData(response.data);
    } catch (err) {
      setError('Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const regenerateCode = async () => {
    if (!window.confirm('Are you sure you want to regenerate the classroom code? The old code will no longer work.')) {
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/teacher/classrooms/${classroomId}/regenerate-code`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      await fetchQRCode();
      alert('Classroom code regenerated successfully!');
    } catch (err) {
      setError('Failed to regenerate code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = `${API_URL.replace('/api', '')}${qrData.qr_code_url}`;
    link.download = `classroom-${classroomId}-qr.png`;
    link.click();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(qrData.classroom_code);
    alert('Classroom code copied to clipboard!');
  };

  const copyJoinUrl = () => {
    navigator.clipboard.writeText(qrData.join_url);
    alert('Join URL copied to clipboard!');
  };

  if (loading) return <div>Loading QR code...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!qrData) return null;

  return (
    <div className="classroom-qr-code">
      <h3>Classroom QR Code</h3>
      
      <div className="qr-code-display">
        <img 
          src={`${API_URL.replace('/api', '')}${qrData.qr_code_url}`}
          alt="Classroom QR Code"
          className="qr-image"
        />
      </div>

      <div className="classroom-code">
        <label>Classroom Code:</label>
        <div className="code-display">
          <span className="code">{qrData.classroom_code}</span>
          <button onClick={copyCode} className="btn-copy">Copy</button>
        </div>
      </div>

      <div className="join-url">
        <label>Join URL:</label>
        <div className="url-display">
          <input 
            type="text" 
            value={qrData.join_url} 
            readOnly 
            className="url-input"
          />
          <button onClick={copyJoinUrl} className="btn-copy">Copy</button>
        </div>
      </div>

      <div className="actions">
        <button onClick={downloadQRCode} className="btn-download">
          Download QR Code
        </button>
        <button onClick={regenerateCode} className="btn-regenerate">
          Regenerate Code
        </button>
      </div>
    </div>
  );
};

export default ClassroomQRCode;
```

### CSS for QR Code Display

```css
/* styles/ClassroomQRCode.css */
.classroom-qr-code {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.classroom-qr-code h3 {
  margin-top: 0;
  color: #333;
  text-align: center;
}

.qr-code-display {
  text-align: center;
  margin: 20px 0;
}

.qr-image {
  max-width: 300px;
  width: 100%;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  padding: 10px;
  background: white;
}

.classroom-code,
.join-url {
  margin: 15px 0;
}

.classroom-code label,
.join-url label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

.code-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.code {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 3px;
  color: #007bff;
  font-family: monospace;
}

.url-display {
  display: flex;
  gap: 10px;
}

.url-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  font-size: 14px;
}

.btn-copy {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-copy:hover {
  background: #5a6268;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-download {
  background: #28a745;
  color: white;
}

.btn-download:hover {
  background: #218838;
}

.btn-regenerate {
  background: #ffc107;
  color: #333;
}

.btn-regenerate:hover {
  background: #e0a800;
}
```

## Vue.js Example

```vue
<!-- components/QRScanner.vue -->
<template>
  <div class="qr-scanner">
    <div id="qr-reader"></div>
  </div>
</template>

<script>
import { Html5QrcodeScanner } from 'html5-qrcode';

export default {
  name: 'QRScanner',
  props: {
    onScanSuccess: Function,
    onScanError: Function
  },
  mounted() {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        const code = decodedText.split('/').pop();
        if (code && code.length === 8) {
          scanner.clear();
          this.onScanSuccess(code);
        }
      },
      (error) => {
        console.warn('QR scan error:', error);
      }
    );

    this.scanner = scanner;
  },
  beforeUnmount() {
    if (this.scanner) {
      this.scanner.clear();
    }
  }
};
</script>
```

## Angular Example

```typescript
// qr-scanner.component.ts
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Html5QrcodeScanner } from 'html5-qrcode';

@Component({
  selector: 'app-qr-scanner',
  template: '<div id="qr-reader"></div>'
})
export class QRScannerComponent implements OnInit, OnDestroy {
  @Output() scanSuccess = new EventEmitter<string>();
  @Output() scanError = new EventEmitter<string>();
  
  private scanner: Html5QrcodeScanner | null = null;

  ngOnInit() {
    this.scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    this.scanner.render(
      (decodedText: string) => {
        const code = decodedText.split('/').pop();
        if (code && code.length === 8) {
          this.scanner?.clear();
          this.scanSuccess.emit(code);
        }
      },
      (error: string) => {
        console.warn('QR scan error:', error);
      }
    );
  }

  ngOnDestroy() {
    this.scanner?.clear();
  }
}
```

## Mobile Considerations

### Permissions
Make sure to request camera permissions properly:

```javascript
// Check if camera is available
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(() => {
      console.log('Camera access granted');
    })
    .catch((error) => {
      console.error('Camera access denied:', error);
      alert('Please allow camera access to scan QR codes');
    });
}
```

### Responsive Design
```css
@media (max-width: 768px) {
  .join-classroom-page {
    padding: 10px;
  }

  .qr-image {
    max-width: 250px;
  }

  .code {
    font-size: 20px;
  }

  .actions {
    flex-direction: column;
  }
}
```
