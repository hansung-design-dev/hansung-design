'use client';

import { useState } from 'react';

// API 함수들
async function testLEDBasicDataFetch() {
  try {
    const response = await fetch('/api/test-connection');
    const result = await response.json();

    if (result.success) {
      return result;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error testing LED basic data fetch:', error);
    throw error;
  }
}

async function getLEDDisplaysByDistrict(districtName: string) {
  try {
    const response = await fetch(
      `/api/led-display?action=getByDistrict&district=${encodeURIComponent(
        districtName
      )}`
    );
    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching LED displays by district:', error);
    throw error;
  }
}

async function getAllLEDDisplays() {
  try {
    const response = await fetch('/api/led-display?action=getAll');
    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching all LED displays:', error);
    throw error;
  }
}

export default function TestLEDAPIPage() {
  const [testResults, setTestResults] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Starting LED API test...');
      const results = await testLEDBasicDataFetch();
      console.log('🔍 Test results:', results);
      setTestResults(results as Record<string, unknown>);
    } catch (err) {
      console.error('🔍 Test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testDistrictAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Testing district API...');
      const results = await getLEDDisplaysByDistrict('관악구');
      console.log('🔍 District API results:', results);
      setTestResults({ districtResults: results });
    } catch (err) {
      console.error('🔍 District API error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testAllAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Testing all LED API...');
      const results = await getAllLEDDisplays();
      console.log('🔍 All LED API results:', results);
      setTestResults({ allResults: results });
    } catch (err) {
      console.error('🔍 All LED API error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-6">LED API 테스트</h1>

      <div className="space-y-4 mb-8">
        <button
          onClick={runTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? '테스트 중...' : '기본 데이터 테스트'}
        </button>

        <button
          onClick={testDistrictAPI}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50 ml-4"
        >
          {loading ? '테스트 중...' : '관악구 LED 데이터 테스트'}
        </button>

        <button
          onClick={testAllAPI}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50 ml-4"
        >
          {loading ? '테스트 중...' : '전체 LED 데이터 테스트'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>에러:</strong> {error}
        </div>
      )}

      {testResults && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">테스트 결과:</h2>
          <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
