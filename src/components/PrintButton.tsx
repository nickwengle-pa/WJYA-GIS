interface PrintButtonProps {
  onPrint: () => Promise<void>;
  printing: boolean;
}

const PrintButton = ({ onPrint, printing }: PrintButtonProps) => (
  <button type="button" onClick={() => void onPrint()} disabled={printing}>
    {printing ? 'Generating PDF…' : 'Print 11x17 PDF'}
  </button>
);

export default PrintButton;
