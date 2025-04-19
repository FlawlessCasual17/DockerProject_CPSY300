import { createSignal } from 'solid-js';
import dayjs from 'dayjs';
import type { Student } from '../types';

export default function DeleteDataForm() {
    const [studentId, setStudentId] = createSignal('');
    const [student, setStudent] = createSignal<Student | null>(null);
    const [loading, setLoading] = createSignal(false);
    const [searchLoading, setSearchLoading] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    const [success, setSuccess] = createSignal<string | null>(null);
    const [confirmDelete, setConfirmDelete] = createSignal(false);

    async function searchStudent() {
        if (!studentId()) {
            setError('Student ID is required');
            return;
        }

        try {
            setSearchLoading(true);
            setError(null);
            setSuccess(null);
            setStudent(null);
            setConfirmDelete(false);

            const response = await fetch(`http://127.0.0.1:8080/api/student/${studentId()}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error || 'Unknown error occurred.';
                setError(Array.isArray(errorMsg) ? errorMsg.join('\n') : errorMsg);
                console.error('Error fetching student:', data);
            } else {
                setStudent(data);
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error occurred.';
            setError(msg);
            console.error('Failed to fetch student:', msg);
        } finally {
            setSearchLoading(false);
        }
    }

    async function handleDelete() {
        if (!confirmDelete()) {
            setConfirmDelete(true);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`http://127.0.0.1:8080/api/student/${studentId()}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error || 'Unknown error occurred.';
                setError(Array.isArray(errorMsg) ? errorMsg.join('\n') : errorMsg);
                console.error('Error deleting student:', data);
            } else {
                setSuccess(data.message || 'Student deleted successfully!');
                setStudent(null);
                setStudentId('');
                setConfirmDelete(false);
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error occurred.';
            setError(msg);
            console.error('Failed to delete student:', msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div class="rounded-2xl border p-6 flex flex-col space-y-4 bg-slate-100 border-slate-500 w-full max-w-lg">
            <h1 class="text-2xl font-bold">Delete Student</h1>

            <div class="flex gap-2">
                <input
                    class="flex-1 rounded-lg border-2 border-slate-900 bg-gray-300 p-1"
                    type="text"
                    placeholder="Enter Student ID"
                    value={studentId()}
                    onInput={(e) => setStudentId(e.currentTarget.value)}
                />
                <button
                    class="rounded-lg border-2 border-blue-900 bg-blue-600 p-1 px-4 text-white hover:cursor-pointer hover:bg-blue-400 hover:border-blue-600 transition-colors"
                    onClick={searchStudent}
                    disabled={searchLoading()}
                >
                    {searchLoading() ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error() && (
                <div class="font-mono text-red-500 p-2 border border-red-300 bg-red-50 rounded">
                    {error()}
                </div>
            )}

            {success() && (
                <div class="font-mono text-green-600 p-2 border border-green-300 bg-green-50 rounded">
                    {success()}
                </div>
            )}

            {student() && (
                <div class="mt-4 p-4 border rounded-lg bg-white">
                    <h2 class="text-xl font-bold mb-4">Student Details</h2>

                    <div class="grid grid-cols-[auto_1fr] gap-2 mb-6">
                        <div class="font-bold">ID:</div>
                        <div>{student()!.studentID}</div>

                        <div class="font-bold">Name:</div>
                        <div>{student()!.studentName}</div>

                        <div class="font-bold">Course:</div>
                        <div>{student()!.courseName}</div>

                        <div class="font-bold">Date:</div>
                        <div>{new Date(student()!.Date).toLocaleDateString()}</div>
                    </div>

                    <button
                        class={`w-full rounded-lg border-2 p-1 text-white hover:cursor-pointer transition-colors ${confirmDelete()
                            ? 'border-red-900 bg-red-700 hover:bg-red-800'
                            : 'border-red-400 bg-red-500 hover:bg-red-600'
                            }`}
                        onClick={handleDelete}
                        disabled={loading()}
                    >
                        {loading()
                            ? 'Deleting...'
                            : confirmDelete()
                                ? 'Confirm Delete'
                                : 'Delete Student'}
                    </button>

                    {confirmDelete() && (
                        <button
                            class="w-full mt-2 rounded-lg border-2 border-slate-500 bg-slate-400 p-1 text-white hover:cursor-pointer hover:bg-slate-300 transition-colors"
                            onClick={() => setConfirmDelete(false)}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
