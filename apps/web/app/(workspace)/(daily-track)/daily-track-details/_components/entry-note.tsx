'use client';

import { useState, useTransition, useRef } from 'react';
import { updateDailyTrackEntryNote } from '@/actions/daily-track-actions';
import styles from './entry-note.module.css';

interface EntryNoteProps {
    entryId: string;
    questId: string;
    note: string;
    date: string;
}

export default function EntryNote({ entryId, questId, note: initialNote, date }: EntryNoteProps) {
    const [note, setNote] = useState(initialNote);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(initialNote);
    const [isPending, startTransition] = useTransition();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isFuture = new Date(date) > new Date(new Date().toDateString());

    const handleEdit = () => {
        if (isFuture) return;
        setDraft(note);
        setEditing(true);
        setTimeout(() => textareaRef.current?.focus(), 0);
    };

    const handleSave = () => {
        const trimmed = draft.trim();
        setEditing(false);
        if (trimmed === note) return;
        const previous = note;
        setNote(trimmed);
        startTransition(async () => {
            const result = await updateDailyTrackEntryNote(entryId, trimmed, questId);
            if ('error' in result && result.error) {
                setNote(previous);
                alert(result.error);
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === 'Escape') {
            setEditing(false);
            setDraft(note);
        }
    };

    if (editing) {
        return (
            <div className={styles.container}>
                <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    placeholder="Add a note…"
                    disabled={isPending}
                />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <span
                className={`${note ? styles.note : styles.noNote} ${isFuture ? styles.disabled : ''}`}
                onClick={handleEdit}
                title={isFuture ? 'Cannot edit future days' : 'Click to edit'}
            >
                {note || 'Add a note…'}
            </span>
        </div>
    );
}
