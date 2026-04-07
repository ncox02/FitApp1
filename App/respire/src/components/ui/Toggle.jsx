export default function Toggle({ checked, onChange, id }) {
  return (
    <label className="toggle-wrapper" htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  )
}
