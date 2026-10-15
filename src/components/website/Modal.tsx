import { useEffect, useId, type ReactNode } from 'react';
import { IconX } from '@/components/ui/icons';

/** The thing the visitor is acting on, pinned to the top of the modal. */
export interface ModalSummary {
  /** Thumbnail — an `<img>` or placeholder art, sized by the modal. */
  thumb: ReactNode;
  title: string;
  meta?: string;
  /** Short green status line, e.g. "6 spots left". */
  highlight?: string;
}

export const modalInput =
  'w-full rounded-xl border border-slate-300 px-4 py-3 text-[0.95rem] text-ink outline-none transition placeholder:text-slate-400 focus:border-pitch-600 focus:ring-2 focus:ring-pitch-600/20';

/**
 * Dialog chrome shared by the public detail pages' modals: backdrop, close
 * button, optional summary card, title and subtitle. Escape and a backdrop
 * click close it; the page behind doesn't scroll while open.
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  summary,
  wide = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  summary?: ModalSummary;
  /** Widen the dialog for longer forms. */
  wide?: boolean;
  children: ReactNode;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-ink/45 px-4 py-6 backdrop-blur-[2px] sm:py-24"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full ${wide ? 'max-w-[600px]' : 'max-w-[440px]'} rounded-3xl bg-white p-6 shadow-[0_32px_80px_-24px_rgba(30,10,60,0.45)] sm:p-8`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-ink-2 transition hover:bg-slate-100 sm:right-6 sm:top-6"
        >
          <IconX className="size-5" />
        </button>

        {summary && (
          <div className="mr-10 flex items-center gap-3 rounded-2xl bg-pitch-50/60 p-3 ring-1 ring-pitch-100">
            <div className="size-[52px] flex-none overflow-hidden rounded-xl bg-slate-100 [&>*]:h-full [&>*]:w-full [&>img]:object-cover">
              {summary.thumb}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[0.95rem] font-bold text-ink">{summary.title}</p>
              {summary.meta && <p className="truncate text-[0.8rem] text-ink-2">{summary.meta}</p>}
              {summary.highlight && (
                <p className="text-xs font-semibold text-emerald-700">{summary.highlight}</p>
              )}
            </div>
          </div>
        )}

        <h2
          id={titleId}
          className={`text-[1.65rem] font-bold leading-tight text-ink ${summary ? 'mt-5' : 'pr-10'}`}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-[0.95rem] leading-relaxed text-cream-dim">{subtitle}</p>
        )}

        {children}
      </div>
    </div>
  );
}
