// Icon + input row used by the auth forms, with an inline error (or hint) below it.
export default function FormField({ icon, error, hint, trailing, inputClassName = '', ...inputProps }) {
  const messageId = `${inputProps.name}-message`;
  const message = error || hint;

  return (
    <div>
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-[#f9f9f8] px-4 py-3 text-[#7a857d] shadow-inner ${
          error ? 'border-red-300 ring-1 ring-red-200' : 'border-[#dfe4de]'
        }`}
      >
        <span className="text-xl">{icon}</span>
        <input
          {...inputProps}
          aria-invalid={Boolean(error)}
          aria-describedby={message ? messageId : undefined}
          className={`w-full border-0 bg-transparent text-base text-slate-800 placeholder:text-slate-400 focus:outline-none ${inputClassName}`}
        />
        {trailing}
      </div>
      {message && (
        <p id={messageId} className={`mt-1.5 px-2 text-sm ${error ? 'text-red-600' : 'text-[#6b7c70]'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export function PasswordToggle({ shown, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-lg text-[#7a857d] transition hover:text-[#2d4e3d]"
      aria-label={shown ? 'Hide password' : 'Show password'}
    >
      {shown ? '◉' : '◌'}
    </button>
  );
}
