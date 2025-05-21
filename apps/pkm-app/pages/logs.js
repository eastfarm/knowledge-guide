// File: apps/pkm-app/pages/logs.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logContent, setLogContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchLogList();
  }, []);

  useEffect(() => {
    const { logfile } = router.query;
    if (logfile) {
      fetchLogContent(logfile);
    } else {
      setSelectedLog(null);
      setLogContent('');
    }
  }, [router.query]);

  const fetchLogList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/logs`);
      // Assuming logs are named like sync_TIMESTAMP.md or webhook_TIMESTAMP.md
      const sortedLogs = response.data.logs.sort((a, b) => {
        const timeA = extractTimestampFromFilename(a);
        const timeB = extractTimestampFromFilename(b);
        return timeB - timeA; // Sort descending, most recent first
      });
      setLogs(sortedLogs || []);
      setError('');
    } catch (err) {
      console.error("Failed to load log list:", err);
      setError('Failed to load log list. Please try again.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const extractTimestampFromFilename = (filename) => {
    const match = filename.match(/_(\d+)\.md$/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Invalid Date';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const fetchLogContent = async (logFile) => {
    if (!logFile) return;
    setLoading(true);
    setSelectedLog(logFile);
    try {
      const response = await axios.get(`${API_URL}/logs/${logFile}`);
      setLogContent(response.data.content || 'No content found.');
      setError('');
    } catch (err) {
      console.error(`Failed to load log content for ${logFile}:`, err);
      setError(`Failed to load log content for ${logFile}. Please try again.`);
      setLogContent('');
    } finally {
      setLoading(false);
    }
  };

  const handleLogClick = (logFile) => {
    router.push(`/logs?logfile=${logFile}`, undefined, { shallow: true });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '20px', overflowY: 'auto' }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 style={{ marginTop: 0 }}>Log Files</h2>
          <Link href="/">
            <a>Back to Home</a>
          </Link>
        </div>
        {loading && !logs.length && <p>Loading log list...</p>}
        {error && !logs.length && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !logs.length && !error && <p>No log files found.</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {logs.map((log) => (
            <li key={log} style={{ marginBottom: '10px' }}>
              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); handleLogClick(log); }}
                style={{ 
                  textDecoration: selectedLog === log ? 'underline' : 'none', 
                  color: selectedLog === log ? 'blue' : 'black',
                  fontWeight: selectedLog === log ? 'bold' : 'normal',
                  display: 'block',
                  padding: '5px',
                  borderRadius: '4px',
                  backgroundColor: selectedLog === log ? '#e0e0e0' : 'transparent'
                }}
              >
                {log.replace(/_(\d+)\.md$/, '')} ({formatTimestamp(extractTimestampFromFilename(log))})
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {selectedLog ? (
          <>
            <h2 style={{ marginTop: 0 }}>Content: {selectedLog}</h2>
            {loading && <p>Loading log content...</p>}
            {error && logContent === '' && <p style={{ color: 'red' }}>{error}</p>}
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
              {logContent}
            </pre>
          </>
        ) : (
          <p>Select a log file to view its content.</p>
        )}
      </div>
    </div>
  );
}
