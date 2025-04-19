import { For, createEffect, createSignal } from 'solid-js';
import type { Student } from '../types';

export default function RetrieveDataForm() {
    const [studentData, setStudentData] = createSignal<Student[]>();
    const [loading, setLoading] = createSignal(true);

    const [error, setError] = createSignal<string | null>(null);

    createEffect(() => {
        handleClick();
    });

    async function handleClick() {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:8080/student', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (!response.ok) {
                const error = data.error || 'Unknown error occurred.';
                setError(error);
                console.error('An error occurred\n', data);
            } else {
                setStudentData(data);
                console.log('Student data received\n', data);
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error occurred.';
            setError(msg);
            console.error('Failed to fetch students\n', msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div class='rounded-2xl border p-6 flex flex-col space-y-4 bg-slate-100 border-slate-500 w-full max-w-3xl'>
            <h1 class='text-2xl font-bold'>All Students</h1>

            <button
                class='w-40 rounded-lg border-2 border-blue-900 bg-blue-600 p-1 text-white hover:cursor-pointer hover:bg-blue-400 hover:border-blue-600 transition-colors'
                onClick={handleClick}
            >
                Refresh Data
            </button>

            {loading() && <div class='text-center p-4'>Loading...</div>}

            {error() && (
                <div class='font-mono text-red-500 p-2 border border-red-300 bg-red-50 rounded'>
                ERROR: {error()}
                </div>
            )}

            {/* biome-ignore lint/style/noNonNullAssertion: <explanation> */}
            {!loading() && !error() && studentData()!.length === 0 && (
                <div class='text-center p-4'>No students found</div>
            )}

            {/* biome-ignore lint/style/noNonNullAssertion: <explanation> */}
            {!loading() && studentData()!.length > 0 && (
            <div class='overflow-x-auto'>
                <table class='w-full border-collapse'>
                    <thead>
                        <tr class='bg-slate-200'>
                            <th class='border border-slate-300 p-2 text-left'>ID</th>
                            <th class='border border-slate-300 p-2 text-left'>Name</th>
                            <th class='border border-slate-300 p-2 text-left'>Course</th>
                            <th class='border border-slate-300 p-2 text-left'>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                    <For each={studentData()}>
                        {(student) => (<tr class='hover:bg-slate-50'>
                            <td class='border border-slate-300 p-2'>{student.studentID}</td>
                            <td class='border border-slate-300 p-2'>{student.studentName}</td>
                            <td class='border border-slate-300 p-2'>{student.courseName}</td>
                            <td class='border border-slate-300 p-2'>
                            {new Date(student.Date).toLocaleDateString()}
                            </td>
                        </tr>)}
                    </For>
                    </tbody>
                </table>
            </div>
            )}
        </div>
  );
}
