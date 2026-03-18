'use client';

import styles from './check-mark.module.css';

type CheckMarkProps = {
    checked: boolean;
    disabled?: boolean;
    variant?: 'default' | 'light';
    onClick?: () => void;
};

export default function CheckMark({ checked, disabled, variant = 'default', onClick }: CheckMarkProps) {
    const handleClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (!disabled && onClick) onClick();
    };

    const disabledClass = disabled
        ? (checked ? styles.disabledChecked : styles.disabled)
        : '';

    return (
        <div
            className={`${styles.wrapper} ${variant === 'light' ? styles.light : ''} ${disabledClass}`}
            onClick={handleClick}
        >
            <span className={`${styles.box} ${checked ? styles.checked : ''} ${disabled ? styles.noAnimation : ''}`} aria-hidden="true">
                {checked && (
                    <svg className={styles.icon} viewBox="0 0 16 16">
                        <path d="M3 8.5 L6.5 12 L13 4" />
                    </svg>
                )}
            </span>
        </div>
    );
}
