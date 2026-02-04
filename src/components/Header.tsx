interface HeaderProps {
  title: string;
  subtitle: string;
  pointCount?: number;
  loading?: boolean;
  error?: boolean;
}

export function Header({ title, subtitle, pointCount, loading, error }: HeaderProps) {
  return (
    <div style={{
      position: 'absolute',
      top: 16,
      left: 16,
      background: 'white',
      padding: '16px 20px',
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxWidth: 350,
      zIndex: 1
    }}>
      <h1 style={{
        margin: 0,
        fontSize: 18,
        color: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span style={{ fontSize: 24 }}>♻️</span>
        {title}
      </h1>
      <p style={{ margin: '8px 0 0 0', fontSize: 14, color: '#6b7280' }}>
        {subtitle}
      </p>
      {!loading && !error && pointCount !== undefined && (
        <p style={{
          margin: '8px 0 0 0',
          fontSize: 13,
          color: '#22c55e',
          fontWeight: 500
        }}>
          {pointCount} points de collecte chargés
        </p>
      )}
    </div>
  );
}
