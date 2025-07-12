import React, { useState } from 'react';
import axios from 'axios';
import SplitBill from './SplitBill';

type ScanReceiptResponse = {
  ocrText: string;
  items: any[];
};

const ReceiptUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [ocrText, setOcrText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('receipt', file);

    const res = await axios.post<ScanReceiptResponse>('/api/transactions/scan-receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setOcrText(res.data.ocrText);
    setItems(res.data.items);
  };

  return (
    <div>
      <form onSubmit={handleUpload}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">Scan Struk</button>
      </form>
      {ocrText && <pre>{ocrText}</pre>}
      {items.length > 0 && <SplitBill items={items} />}
    </div>
  );
};

export default ReceiptUpload;