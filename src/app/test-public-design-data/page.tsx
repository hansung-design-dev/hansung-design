'use client';

import { useEffect, useState } from 'react';

export default function TestPublicDesignDataPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/test-public-design-data');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.error('Failed to fetch test data');
        }
      } catch (error) {
        console.error('Error fetching test data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">공공디자인 데이터 테스트</h1>

      {data && (
        <div>
          <h2 className="text-xl font-semibold mb-2">요약</h2>
          <pre className="bg-gray-100 p-4 rounded mb-4">
            {JSON.stringify(data.summary, null, 2)}
          </pre>

          <h2 className="text-xl font-semibold mb-2">List 데이터</h2>
          <div className="space-y-2">
            {data.listData?.map((item: any, index: number) => (
              <div key={index} className="border p-4 rounded">
                <p>
                  <strong>ID:</strong> {item.id}
                </p>
                <p>
                  <strong>Category:</strong> {item.project_category}
                </p>
                <p>
                  <strong>Display Order:</strong> {item.display_order}
                </p>
                <p>
                  <strong>Title:</strong> {item.title}
                </p>
                <p>
                  <strong>Location:</strong> {item.location}
                </p>
                <p>
                  <strong>Images:</strong>{' '}
                  {item.image_urls?.join(', ') || 'None'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
