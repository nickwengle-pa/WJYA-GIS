interface PrintButtonProps {
  onPrint: () => Promise<void>;
  printing: boolean;
  canPrint: boolean;
  error: string | null;
}

const PrintButton = ({ onPrint, printing, canPrint, error }: PrintButtonProps) => (
  <>
    <button type="button" className="primary-action" onClick={() => void onPrint()} disabled={printing || !canPrint}>
      {printing ? 'Generating PDF...' : 'Print 11x17 PDF'}
    </button>
    {error ? <p className="status-banner error">{error}</p> : null}
  </>
);

export default PrintButton;
