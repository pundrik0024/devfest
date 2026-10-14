export function SampleDataLabel({ className = '' }) {
  return (
    <span className={`sample-label ${className}`} title="This value is sample/illustrative data, not real market data">
      📊 Sample data
    </span>
  )
}

export function AIDisclaimer({ className = '' }) {
  return (
    <p className={`ai-disclaimer ${className}`} role="note">
      ⚠️ AI suggestion. Check the product label and ask a local expert before use.
    </p>
  )
}

export function SampleDataBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex items-center gap-2 text-xs text-amber-800 mb-4" role="note">
      <span>📊</span>
      <span><strong>Sample data</strong> — All prices, levels and metrics shown here are illustrative. Not real market or telemetry data.</span>
    </div>
  )
}
