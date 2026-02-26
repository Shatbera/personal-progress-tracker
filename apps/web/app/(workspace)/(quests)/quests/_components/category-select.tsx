'use client';

import { createPortal, useFormStatus } from 'react-dom';
import { useEffect, useRef, useState, useTransition, useActionState } from 'react';
import { QuestCategory } from '../../types';
import { createCategory, deleteCategory, updateCategory } from '@/actions/quest-category-actions';
import styles from './category-select.module.css';

type CategorySelectProps = {
    categories: QuestCategory[];
    defaultValue?: string;
};

type ModalState = { mode: 'add' } | { mode: 'edit'; category: QuestCategory } | null;

function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className={styles.modalSubmitBtn} disabled={pending} style={pending ? { opacity: 0.5 } : undefined}>
            {label}
        </button>
    );
}

function CategoryFormModal({ modal, onClose }: {
    modal: ModalState;
    onClose: (created?: QuestCategory, updated?: QuestCategory) => void;
}) {
    const isEditing = modal?.mode === 'edit';
    const category = modal?.mode === 'edit' ? modal.category : undefined;

    const [formState, formAction] = useActionState(
        isEditing ? updateCategory : createCategory,
        { error: '' }
    );

    useEffect(() => {
        if (formState && 'success' in formState && formState.success) {
            onClose(
                !isEditing ? formState.category : undefined,
                isEditing ? formState.category : undefined
            );
        }
    }, [formState]);

    if (!modal) return null;

    return createPortal(
        <div className={styles.modalOverlay} onClick={() => onClose()}>
            <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>{isEditing ? 'Edit Category' : 'Add Category'}</h2>
                {formState.error && <div className={styles.modalError}>{formState.error}</div>}
                <form action={formAction} className={styles.modalForm}>
                    {isEditing && <input type="hidden" name="id" value={category!.id} />}
                    <input
                        type="text"
                        name="name"
                        defaultValue={category?.name}
                        placeholder="Category name"
                        className={styles.modalInput}
                        autoFocus
                        required
                    />
                    <div className={styles.modalActions}>
                        <button type="button" className={styles.modalCancelBtn} onClick={() => onClose()}>Cancel</button>
                        <SubmitButton label={isEditing ? 'Save' : 'Add'} />
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default function CategorySelect({ categories: initialCategories, defaultValue = '' }: CategorySelectProps) {
    const [categories, setCategories] = useState<QuestCategory[]>(initialCategories);
    const [selectedId, setSelectedId] = useState(defaultValue);
    const [open, setOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalState>(null);
    const [isPending, startTransition] = useTransition();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync when parent loads categories asynchronously (e.g. create modal)
    useEffect(() => {
        setCategories(initialCategories);
    }, [initialCategories]);

    const selectedCategory = categories.find(c => c.id === selectedId);
    const displayLabel = selectedCategory?.name ?? 'No category';

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            const target = e.target as Node;
            const insideTrigger = triggerRef.current?.contains(target);
            const insideDropdown = dropdownRef.current?.contains(target);
            if (!insideTrigger && !insideDropdown) {
                setOpen(false);
                setMenuOpenId(null);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function openDropdown() {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownStyle({
            position: 'fixed',
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
        });
        setOpen(true);
    }

    function handleDelete(id: string) {
        const category = categories.find(c => c.id === id);
        if (!window.confirm(`Are you sure you want to delete "${category?.name}"?`)) return;
        setMenuOpenId(null);
        startTransition(async () => {
            const result = await deleteCategory(id);
            if (!('error' in result && result.error)) {
                setCategories(prev => prev.filter(c => c.id !== id));
                if (selectedId === id) setSelectedId('');
            }
        });
    }

    function handleModalClose(created?: QuestCategory, updated?: QuestCategory) {
        if (created) {
            setCategories(prev => [...prev, created]);
            setSelectedId(created.id);
        }
        if (updated) {
            setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
        }
        setModal(null);
    }

    return (
        <div className={styles.wrapper}>
            <input type="hidden" name="categoryId" value={selectedId} />

            <button
                type="button"
                ref={triggerRef}
                className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
                onClick={() => open ? setOpen(false) : openDropdown()}
            >
                <span>{displayLabel}</span>
                <span className={styles.chevron}>▾</span>
            </button>

            {open && createPortal(
                <div className={styles.dropdown} ref={dropdownRef} style={dropdownStyle}>
                    <div
                        className={`${styles.option} ${selectedId === '' ? styles.optionSelected : ''}`}
                        onClick={() => { setSelectedId(''); setOpen(false); }}
                    >
                        No category
                    </div>

                    {(() => {
                        const builtIn = categories.filter(c => c.isBuiltIn);
                        const custom = categories.filter(c => !c.isBuiltIn);
                        return (
                            <>
                                {builtIn.map(cat => (
                                    <div key={cat.id} className={`${styles.option} ${selectedId === cat.id ? styles.optionSelected : ''}`}>
                                        <span className={styles.optionName} onClick={() => { setSelectedId(cat.id); setOpen(false); }}>{cat.name}</span>
                                    </div>
                                ))}
                                {builtIn.length > 0 && custom.length > 0 && (
                                    <div className={styles.categoriesDivider} />
                                )}
                                {custom.map(cat => (
                        <div key={cat.id} className={`${styles.option} ${selectedId === cat.id ? styles.optionSelected : ''}`}>
                            <span className={styles.optionName} onClick={() => { setSelectedId(cat.id); setOpen(false); }}>{cat.name}</span>
                            {!cat.isBuiltIn && (
                                <div className={styles.menuWrapper}>
                                    <button
                                        type="button"
                                        className={styles.menuBtn}
                                        onClick={e => { e.stopPropagation(); setMenuOpenId(menuOpenId === cat.id ? null : cat.id); }}
                                        aria-label="Options"
                                    >⋮</button>
                                    {menuOpenId === cat.id && (
                                        <div className={styles.menu}>
                                            <button type="button" className={styles.menuItem} onClick={() => { setModal({ mode: 'edit', category: cat }); setMenuOpenId(null); setOpen(false); }}>Edit</button>
                                            <button type="button" className={`${styles.menuItem} ${styles.menuItemDelete}`} onClick={() => handleDelete(cat.id)} disabled={isPending}>Delete</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        ))}
                            </>
                        );
                    })()}

                    <div className={styles.addOption} onClick={() => { setModal({ mode: 'add' }); setOpen(false); }}>
                        ＋ Add category...
                    </div>
                </div>,
                document.body
            )}

            <CategoryFormModal
                key={modal ? `${modal.mode}-${modal.mode === 'edit' ? modal.category.id : 'new'}` : 'closed'}
                modal={modal}
                onClose={handleModalClose}
            />
        </div>
    );
}