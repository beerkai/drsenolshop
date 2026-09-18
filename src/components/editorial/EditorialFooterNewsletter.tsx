'use client'

export default function EditorialFooterNewsletter({
  placeholder,
  submitLabel,
}: {
  placeholder: string
  submitLabel: string
}) {
  return (
    <form
      className="flex items-center border-b border-on-surface pb-1"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder={placeholder}
        className="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
      />
      <button
        type="submit"
        className="pl-2 font-nav-caps text-nav-caps uppercase tracking-widest text-on-surface transition-colors hover:text-honey-amber"
      >
        {submitLabel}
      </button>
    </form>
  )
}
