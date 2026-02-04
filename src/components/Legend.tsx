interface LegendItem {
  id: string;
  color: string;
  borderColor: string;
  label: string;
  visible: boolean;
  count?: number;
}

interface LegendProps {
  items: LegendItem[];
  onToggle: (id: string) => void;
}

export function Legend({ items, onToggle }: LegendProps) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 16,
      right: 16,
      background: 'white',
      padding: 12,
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontSize: 13,
      zIndex: 1
    }}>
      {items.map((item) => (
        <label 
          key={item.id} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            cursor: 'pointer',
            marginBottom: 4,
            opacity: item.visible ? 1 : 0.5
          }}
        >
          <input
            type="checkbox"
            checked={item.visible}
            onChange={() => onToggle(item.id)}
            style={{ cursor: 'pointer' }}
          />
          <div style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: item.color,
            border: `2px solid ${item.borderColor}`
          }} />
          <span>
            {item.label}
            {item.count !== undefined && (
              <span style={{ color: '#6b7280', marginLeft: 4 }}>
                ({item.count})
              </span>
            )}
          </span>
        </label>
      ))}
    </div>
  );
}
