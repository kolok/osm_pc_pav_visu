interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 16,
      left: 16,
      right: 16,
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: 8,
      padding: 16,
      zIndex: 1
    }}>
      <p style={{ color: '#dc2626', margin: 0 }}>
        <strong>Erreur:</strong> {message}
      </p>
    </div>
  );
}
