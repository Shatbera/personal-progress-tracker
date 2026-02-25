'use client';

export default function QuestsError({ error }: { error: Error }) {
    return <main>
        <h1>{error.message}</h1>
    </main>;
}