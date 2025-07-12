import React, { useState } from 'react';

interface Item {
  item: string;
  price: number;
  category: string;
}

interface SplitBillProps {
  items: Item[];
}

const users = ['A', 'B', 'C']; // Ganti sesuai kebutuhan

const SplitBill: React.FC<SplitBillProps> = ({ items }) => {
  const [assignments, setAssignments] = useState<{ [key: number]: string }>({});

  const handleAssign = (idx: number, user: string) => {
    setAssignments({ ...assignments, [idx]: user });
  };

  const handleSave = () => {
    // Kirim assignments ke backend jika perlu
    const result = items.map((item, idx) => ({
      ...item,
      assignedTo: assignments[idx] || null
    }));
    console.log('Split Bill Result:', result);
    // TODO: POST ke backend endpoint split bill
  };

  return (
    <div>
      <h3>Split Bill</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Harga</th>
            <th>Kategori</th>
            <th>Assign ke</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.item}</td>
              <td>{item.price}</td>
              <td>{item.category}</td>
              <td>
                <select value={assignments[idx] || ''} onChange={e => handleAssign(idx, e.target.value)}>
                  <option value="">Pilih</option>
                  {users.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSave}>Simpan Split Bill</button>
    </div>
  );
};

export default SplitBill;
