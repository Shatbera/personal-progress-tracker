'use client';

import { useState, useTransition, useRef } from 'react';
import { updateQuestHeader } from '@/actions/quest-actions';
import styles from './editable-header.module.css';

interface EditableHeaderProps {
    questId: string;
    title: string;
    description: string;
    categoryId?: string | null;
}

export default function EditableHeader({ questId, title: initialTitle, description: initialDescription, categoryId }: EditableHeaderProps) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(initialTitle);
    const [, startTransition] = useTransition();
    const descRef = useRef<HTMLParagraphElement>(null);

    const saveTitle = () => {
        const trimmed = titleDraft.trim();
        setEditingTitle(false);
        if (!trimmed || trimmed === title) return;
        const previous = title;
        setTitle(trimmed);
        startTransition(async () => {
            const result = await updateQuestHeader(questId, trimmed, description, categoryId ?? undefined);
            if ('error' in result && result.error) {
                setTitle(previous);
                alert(result.error);
            }
        });
    };

    const saveDesc = () => {
        const trimmed = (descRef.current?.innerText ?? '').trim();
        if (trimmed === description) return;
        const previous = description;
        setDescription(trimmed);
        startTransition(async () => {
            const result = await updateQuestHeader(questId, title, trimmed, categoryId ?? undefined);
            if ('error' in result && result.error) {
                setDescription(previous);
                if (descRef.current) descRef.current.innerText = previous;
                alert(result.error);
            }
        });
    };

    return (
        <>
            {editingTitle ? (
                <input
                    className={styles.titleInput}
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); saveTitle(); }
                        if (e.key === 'Escape') { setEditingTitle(false); setTitleDraft(title); }
                    }}
                    autoFocus
                />
            ) : (
                <h1
                    className={`${styles.title} ${styles.editable}`}
                    onClick={() => { setTitleDraft(title); setEditingTitle(true); }}
                    title="Click to edit"
                >
                    {title}
                </h1>
            )}

            <p
                ref={descRef}
                className={`${styles.description} ${styles.editable}`}
                contentEditable
                suppressContentEditableWarning
                onBlur={saveDesc}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLElement).blur(); }
                    if (e.key === 'Escape') {
                        if (descRef.current) descRef.current.innerText = description;
                        (e.target as HTMLElement).blur();
                    }
                }}
                title="Click to edit"
            >
                {description}
            </p>
        </>
    );
}
