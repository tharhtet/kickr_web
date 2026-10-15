import { useEffect, useId, useState, type FormEvent } from 'react';
import { gradientBtn } from './DetailUI';
import Modal, { modalInput, type ModalSummary } from './Modal';
import { isApiError } from '@/lib/api/errors';
import { useJoinEventAnonymous } from '@/services/events';

/**
 * Join an event as a named guest, without an account
 * (`POST /events/:id/join-anonymous`). Offers a way over to the login modal
 * for visitors who do have one.
 */
export default function GuestJoinModal({
  open,
  onClose,
  eventId,
  summary,
  onJoined,
  onLogin,
}: {
  open: boolean;
  onClose: () => void;
  eventId: string;
  summary?: ModalSummary;
  onJoined: () => void;
  onLogin: () => void;
}) {
  const [name, setName] = useState('');
  const join = useJoinEventAnonymous(eventId);
  const nameId = useId();

  // Start clean each time it opens.
  useEffect(() => {
    if (open) join.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    join.mutate(name.trim(), {
      onSuccess: () => {
        onJoined();
        onClose();
      },
    });
  }

  const errorMessage = join.error
    ? isApiError(join.error)
      ? join.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Join as a guest"
      subtitle="Tell the host who's coming — no account needed."
      summary={summary}
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor={nameId} className="mb-1.5 block text-sm font-semibold text-ink">
            Your name
          </label>
          <input
            id={nameId}
            type="text"
            autoComplete="name"
            autoFocus
            required
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aung Aung"
            className={modalInput}
          />
        </div>

        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={join.isPending || !name.trim()}
          className={`w-full rounded-2xl py-3.5 text-base font-bold disabled:cursor-not-allowed disabled:opacity-60 ${gradientBtn}`}
        >
          {join.isPending ? 'Joining…' : 'Join event'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-cream-dim">
        Have an account?{' '}
        <button type="button" onClick={onLogin} className="font-bold text-pitch-600 hover:underline">
          Log in instead
        </button>
      </p>
    </Modal>
  );
}
