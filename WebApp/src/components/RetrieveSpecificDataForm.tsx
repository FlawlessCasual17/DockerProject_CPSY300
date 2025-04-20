import { createSignal } from 'solid-js';
import dayjs from 'dayjs';
import type { Student } from '../types';

export default function RetrieveSpecificDataForm() {
    const [studentId, setStudentId] = createSignal('');
    const [student, setStudent] = createSignal<Student | null>(null);
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        if (!studentId()) {
            setError('Student ID is required');
            return;
        }

        (async () => {
            try {
                setLoading(true);
                setError(null);
                setStudent(null);

                const response = await fetch(`http://127.0.0.1:8080/student/${studentId()}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                const data = await response.json();

                if (!response.ok) {
                    const error = data.error || 'Unknown error occurred.';
                    setError(Array.isArray(error) ? error.join('\n') : error);
                    console.error('An error occurred\n', data);
                } else {
                    setStudent(data);
                }
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error occurred.';
                setError(msg);
                console.error('Failed to fetch student\n', msg);
            }
        })()
    }

    return (
        <div class='rounded-2xl border p-6 flex flex-col space-y-4 bg-slate-100 border-slate-500 w-full max-w-lg'>
            <h1 class='text-2xl font-bold'>Find Student</h1>

            <form onSubmit={handleSubmit} class='flex flex-col space-y-4'>
                <label for='studentId' class='flex flex-col'>
                    <div class='leading-6 font-bold'>Student ID</div>
                    <input
                        class='w-full rounded-lg border-2 border-slate-900 bg-gray-300 p-1'
                        id='studentId'
                        type='text'
                        value={studentId()}
                        onInput={(e) => setStudentId(e.currentTarget.value)}
                        placeholder='Enter Student ID'
                        required
                    />
                </label>

                <button
                    class='w-full rounded-lg border-2 border-blue-900 bg-blue-600 p-1 text-white hover:cursor-pointer hover:bg-blue-400 hover:border-blue-600 transition-colors'
                    type='submit'
                    disabled={loading()}
                >
                    {loading() ? 'Searching...' : 'Find Student'}
                </button>
            </form>

            {error() && (
                <div class='font-mono text-red-500 p-2 border border-red-300 bg-red-50 rounded'>
                    {error()}
                </div>
            )}

            {student() && (
                <div class='mt-4 p-4 border rounded-lg bg-white'>
                    <h2 class='text-xl font-bold mb-2'>Student Details</h2>
                    <div class='grid grid-cols-[auto_1fr] gap-2'>
                        <div class='font-bold'>ID:</div>
                        <div>{student()?.studentID}</div>

                        <div class='font-bold'>Name:</div>
                        <div>{student()?.studentName}</div>

                        <div class='font-bold'>Course:</div>
                        <div>{student()?.courseName}</div>

                        <div class='font-bold'>Date:</div>
                        <div>{dayjs(student()?.Date).format('YYYY-MM-DD')}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
